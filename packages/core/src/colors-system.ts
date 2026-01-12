import { 
  converter, 
  formatHex, 
  wcagContrast, 
  formatCss,
  displayable,
  useMode,
  modeP3,
  type Oklch,
  type Color
} from 'culori';

useMode(modeP3); // Register P3 definition
const toOklch = converter('oklch');
const toP3 = converter('p3');
const toHex = formatHex;

// Helper: Round numbers to 4 decimal places for CSS compactness
function formatPrecise(n: number): number {
    return Math.round(n * 10000) / 10000;
}

// Helper: robust displayable check
function isDisplayable(color: Color | string, gamut: 'srgb' | 'p3'): boolean {
    if (gamut === 'srgb') {
        return displayable(color);
    }
    // Manual P3 Check
    const p3 = toP3(color);
    if (!p3) return false;
    return (
        p3.r >= 0 && p3.r <= 1 &&
        p3.g >= 0 && p3.g <= 1 &&
        p3.b >= 0 && p3.b <= 1
    );
}

export interface ColorData {
  name: string;
  hex: string;
  pinyin: string;
  oklch?: Oklch;
}

export interface Palette {
  [level: number]: string;
}

export interface Primitives {
  brand: Palette;
  secondary: Palette;
  tertiary: Palette;
  fourth: Palette;
  emphasize: Palette;
  neutral: Palette;
  neutralVariant: Palette;
  error: Palette;
  warning: Palette;
  success: Palette;
}

// --- Strict Token Types ---
export type BrandTokenKeys = `brand.${'primary' | 'primary-hover' | 'primary-bg'}`;
export type TextTokenKeys = `text.${'primary' | 'secondary' | 'placeholder' | 'inverse' | 'on-brand' | 'on-error' | 'on-warning' | 'on-success' | `on-${string}`}`;
export type BgTokenKeys = `bg.${'canvas' | 'container' | 'elevated' | 'mask' | `tint.${string}`}`;
export type BorderTokenKeys = `border.${'default' | 'divider' | 'strong'}`;
export type SemanticTokenKeys = `${'success' | 'warning' | 'error' | 'info'}.${'text' | 'bg' | 'border' | 'solid.bg' | 'solid.text'}`;
export type ActionTokenKeys = `action.${string}`;
export type EffectTokenKeys = `effect.shadow.${'sm' | 'md' | 'lg'}`;

export type SystemTokenKey = BrandTokenKeys | TextTokenKeys | BgTokenKeys | BorderTokenKeys | SemanticTokenKeys | ActionTokenKeys | EffectTokenKeys;

export type SystemTokens = Partial<Record<SystemTokenKey, string>> & Record<string, string>;

export interface SystemState {
  'hover-opacity': number;
  'pressed-opacity': number;
  'disabled-opacity': number;
  'content-disabled-opacity': number;
}

export interface GeneratedSystem {
  meta: ColorData;
  primitives: Primitives;
  tokens: SystemTokens;
  state: SystemState;
  isDark: boolean;
}

/**
 * 中国传统色色板自动化生成工具 (3-Layer Architecture)
 * Refactored to use OKLCH color space for perceptual uniformity.
 * Includes Advanced Gamut Mapping (Chroma Reduction) for sRGB.
 */
export class TraditionalColorSystem {
  private library: ColorData[];
  private targetGamut: 'srgb' | 'p3';

  constructor(colorData: ColorData[], options: { targetGamut?: 'srgb' | 'p3' } = {}) {
    this.library = colorData.map(c => ({
      ...c,
      oklch: toOklch(c.hex) as Oklch
    }));
    this.targetGamut = options.targetGamut || 'srgb';
  }

  // --- Primitives: Tonal Palette Generation ---
  
  /**
   * Advanced Gamut Mapping: Chroma Reduction
   * Keeps Lightness and Hue constant, reduces Chroma until it fits in Target Gamut.
   */
  fitToGamut(oklchColor: Oklch): Oklch {
    const gamut = this.targetGamut; // 'srgb' or 'p3'
    
    // If already displayable, return as is.
    if (isDisplayable(oklchColor, gamut)) {
      return oklchColor;
    }

    // Binary search for maximum valid chroma
    let low = 0;
    let high = oklchColor.c;
    let optimized = { ...oklchColor };

    for (let i = 0; i < 15; i++) {
      const mid = (low + high) / 2;
      optimized.c = mid;
      if (isDisplayable(optimized, gamut)) {
        low = mid;
      } else {
        high = mid;
      }
    }
    
    optimized.c = low;
    return optimized;
  }

  /**
   * 生成同色系色阶 (Tonal Palette)
   */
  generateTonalPalette(inputColor: string | Oklch, gamutOverride?: 'srgb' | 'p3'): Palette {
    const source = typeof inputColor === 'string' ? (toOklch(inputColor) as Oklch) : inputColor;
    const tones: Palette = {};
    const levels = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 98, 99, 100];
    const targetGamut = gamutOverride || this.targetGamut;
    
    levels.forEach(level => {
      const targetL = level / 100;
      
      let newColor: Oklch = { 
        mode: 'oklch', 
        l: targetL, 
        c: source.c, 
        h: source.h 
      };

      if (level < 10 || level > 90) {
          newColor.c = source.c * 0.5;
      }
      
      newColor = this.fitToGamut(newColor);
      
      newColor = this.fitToGamut(newColor);
      
      // Output Formatting:
      if (targetGamut === 'p3' && !isDisplayable(newColor, 'srgb')) {
          // Format P3 manually to ensure precision control
          // culori's formatCss might be too precise or verbose
          const p3 = toP3(newColor);
          if (p3) {
             tones[level] = `color(display-p3 ${formatPrecise(p3.r)} ${formatPrecise(p3.g)} ${formatPrecise(p3.b)})`;
          } else {
             tones[level] = formatCss(newColor); // Fallback
          }
      } else {
          tones[level] = toHex(newColor);
      }
    });
    
    return tones;
  }

  // --- Features: Harmony Generation ---
  
  /**
   * Generates harmonic colors based on the input color.
   */
  generateHarmonies(inputColorName: string): { complementary: string, analogous: [string, string], triadic: [string, string] } {
      const color = this.library.find(c => c.name === inputColorName);
      if (!color || !color.oklch) {
          // Fallback
           return { complementary: '#000', analogous: ['#000', '#000'], triadic: ['#000', '#000'] };
      }

      const source = color.oklch;
      
      const shift = (h: number, deg: number) => {
          let newH = (h + deg) % 360;
          if (newH < 0) newH += 360;
          // Keep L and C but ensure displayable
          let newColor: Oklch = { ...source, h: newH };
          newColor = this.fitToGamut(newColor);
          return toHex(newColor);
      };

      return {
          complementary: shift(source.h || 0, 180),
          analogous: [shift(source.h || 0, -30), shift(source.h || 0, 30)],
          triadic: [shift(source.h || 0, -120), shift(source.h || 0, 120)]
      };
  }

  // --- Core Logic ---

  generatePalette(themeName: string, isDark: boolean = false, gamutOverride?: 'srgb' | 'p3', overrides?: { secondary?: string, tertiary?: string }): GeneratedSystem {
    const theme = this.library.find(c => c.name === themeName) || this.library[0];
    const sourceOklch = theme.oklch!;

    // Layer 1: Primitives (基础色阶)
    // ------------------------------------------------
    
    // Brand Palette
    const brandPalette = this.generateTonalPalette(theme.hex, gamutOverride);

    // Neutral Palette: Low chroma version of brand hue
    const neutralSource = { ...sourceOklch, c: Math.min(sourceOklch.c * 0.1, 0.03) };
    const neutralPalette = this.generateTonalPalette(neutralSource, gamutOverride);

    // Neutral Variant: Slightly higher chroma
    const neutralVariantSource = { ...sourceOklch, c: Math.min(sourceOklch.c * 0.2, 0.06) };
    const neutralVariantPalette = this.generateTonalPalette(neutralVariantSource, gamutOverride);

    // Semantic Palettes (Standardized Hues)
    // Red (Error)
    const errorPalette = this.generateTonalPalette('#ba1a1a', gamutOverride); 
    // Orange (Warning) - OKLCH hue ~ 70
    const warningPalette = this.generateTonalPalette('#ff9800', gamutOverride); // Standard Orange
    // Green (Success) - OKLCH hue ~ 140
    const successPalette = this.generateTonalPalette('#386a20', gamutOverride); // Standard Green

    // Secondary: Brand distinct Hue pivot (e.g. +60) OR Override
    let secondarySource = { ...sourceOklch, h: ((sourceOklch.h || 0) + 60) % 360 };
    if (overrides?.secondary) {
        const osw = toOklch(overrides.secondary);
        if (osw) {
             secondarySource = { ...osw, h: osw.h ?? 0 };
        }
    }
    const secondaryPalette = this.generateTonalPalette(secondarySource, gamutOverride);

    // Tertiary: Brand distinct Hue pivot (e.g. +120) OR Override
    let tertiarySource = { ...sourceOklch, h: ((sourceOklch.h || 0) + 120) % 360 };
    if (overrides?.tertiary) {
        const otw = toOklch(overrides.tertiary);
        if (otw) {
            tertiarySource = { ...otw, h: otw.h ?? 0 };
        }
    }
    const tertiaryPalette = this.generateTonalPalette(tertiarySource, gamutOverride);
    
    // Fourth: Brand distinct Hue pivot (e.g. +180 Complementary)
    const fourthSource = { ...sourceOklch, h: ((sourceOklch.h || 0) + 180) % 360 };
    const fourthPalette = this.generateTonalPalette(fourthSource, gamutOverride);
    
    // Emphasize: High Vibrancy
    const emphasizeSource = { ...sourceOklch, c: Math.min(0.4, sourceOklch.c * 1.5) }; // Boost Chroma
    const emphasizePalette = this.generateTonalPalette(emphasizeSource, gamutOverride);

    const primitives: Primitives = {
      brand: brandPalette,
      secondary: secondaryPalette,
      tertiary: tertiaryPalette,
      fourth: fourthPalette,
      emphasize: emphasizePalette,
      neutral: neutralPalette,
      neutralVariant: neutralVariantPalette,
      error: errorPalette,
      warning: warningPalette,
      success: successPalette,
    };

    // Layer 2: Semantics (语义映射)
    // ------------------------------------------------
    const sys = this.generateTokens(primitives, isDark);

    // Layer 3: Interaction States
    const state: SystemState = {
      'hover-opacity': 0.08,
      'pressed-opacity': 0.12,
      'disabled-opacity': 0.38,
      'content-disabled-opacity': 0.38,
    };

    return { 
      meta: theme, 
      primitives, 
      tokens: sys, 
      state,
      isDark 
    };
  }

  // --- Helpers ---

  generateTokens(primitives: Primitives, isDark: boolean): SystemTokens {
    return {
      ...this.getBrandTokens(primitives, isDark),
      ...this.getTextTokens(primitives, isDark),
      ...this.getBackgroundTokens(primitives, isDark),
      ...this.getBorderTokens(primitives, isDark),
      ...this.getSemanticTokens(primitives, isDark),
      ...this.getActionTokens(primitives, isDark),
      ...this.getEffectTokens(isDark),
    };
  }

  private pickContrastColor(bg: string, light: string, dark: string): string {
    const contrastLight = wcagContrast(light, bg);
    const contrastDark = wcagContrast(dark, bg);
    return contrastLight >= contrastDark ? light : dark;
  }

  private getBrandTokens(primitives: Primitives, isDark: boolean): SystemTokens {
    const sys: SystemTokens = {};
    if (!isDark) {
      sys['brand.primary'] = primitives.brand[40];       
      sys['brand.primary-hover'] = primitives.brand[30]; 
      sys['brand.primary-bg'] = primitives.brand[95];    
    } else {
      sys['brand.primary'] = primitives.brand[80];       
      sys['brand.primary-hover'] = primitives.brand[70]; 
      sys['brand.primary-bg'] = primitives.brand[20];    
    }
    return sys;
  }

  private getTextTokens(primitives: Primitives, isDark: boolean): SystemTokens {
    const sys: SystemTokens = {};
    const white = '#ffffff'; 
    const black = '#000000'; 

    if (!isDark) {
      sys['text.primary'] = primitives.neutral[10];      
      sys['text.secondary'] = primitives.neutral[40];    
      sys['text.placeholder'] = primitives.neutral[60];  
      sys['text.inverse'] = primitives.neutral[100];     
    } else {
      sys['text.primary'] = primitives.neutral[95];      
      sys['text.secondary'] = primitives.neutral[80];    
      sys['text.placeholder'] = primitives.neutral[60];  
      sys['text.inverse'] = primitives.neutral[10];      
    }
    
    // Smart Contrast Text
    sys['text.on-brand'] = this.pickContrastColor(isDark ? primitives.brand[80] : primitives.brand[40], white, black);
    sys['text.on-error'] = this.pickContrastColor(isDark ? primitives.error[80] : primitives.error[40], white, black); 
    sys['text.on-success'] = this.pickContrastColor(isDark ? primitives.success[80] : primitives.success[40], white, black);
    sys['text.on-warning'] = this.pickContrastColor(isDark ? primitives.warning[80] : primitives.warning[90], white, black);

    return sys;
  }

  private getBackgroundTokens(primitives: Primitives, isDark: boolean): SystemTokens {
    const sys: SystemTokens = {};
    if (!isDark) {
      sys['bg.canvas'] = primitives.neutral[98];         
      sys['bg.container'] = primitives.neutral[100];     
      sys['bg.elevated'] = primitives.neutral[100];      
      sys['bg.mask'] = 'rgba(0,0,0,0.4)';                
    } else {
      sys['bg.canvas'] = primitives.neutral[0];          
      sys['bg.container'] = primitives.neutral[10];      
      sys['bg.elevated'] = primitives.neutral[20];       
      sys['bg.mask'] = 'rgba(0,0,0,0.6)';
    }

    // Background Tints
    const mapBgTint = (level: string, palette: Palette) => {
        sys[`bg.tint.${level}`] = isDark ? palette[10] : palette[98]; 
    };
    mapBgTint('brand', primitives.brand);
    mapBgTint('secondary', primitives.secondary);
    mapBgTint('tertiary', primitives.tertiary);
    mapBgTint('fourth', primitives.fourth);
    mapBgTint('emphasize', primitives.emphasize);

    return sys;
  }

  private getBorderTokens(primitives: Primitives, isDark: boolean): SystemTokens {
    const sys: SystemTokens = {};
    if (!isDark) {
      sys['border.default'] = primitives.neutralVariant[80]; 
      sys['border.divider'] = primitives.neutralVariant[90]; 
      sys['border.strong'] = primitives.neutralVariant[70];  
    } else {
      sys['border.default'] = primitives.neutralVariant[30]; 
      sys['border.divider'] = primitives.neutralVariant[20]; 
      sys['border.strong'] = primitives.neutralVariant[40];  
    }
    return sys;
  }

  private getSemanticTokens(primitives: Primitives, isDark: boolean): SystemTokens {
    const sys: SystemTokens = {};
    const white = '#ffffff'; 
    const black = '#000000'; 

    const mapSemantic = (name: string, palette: Palette) => {
        if (!isDark) {
            sys[`${name}.text`] = palette[30]; 
            sys[`${name}.bg`] = palette[95];   
            sys[`${name}.border`] = palette[80]; 
        } else {
            sys[`${name}.text`] = palette[90]; 
            sys[`${name}.bg`] = palette[20];   
            sys[`${name}.border`] = palette[30]; 
        }
    };
    
    mapSemantic('success', primitives.success);
    mapSemantic('warning', primitives.warning);
    mapSemantic('error', primitives.error);
    
    // Info fallback
    sys['info.text'] = isDark ? primitives.brand[80] : primitives.brand[40];
    sys['info.bg'] = isDark ? primitives.brand[20] : primitives.brand[95];
    sys['info.border'] = isDark ? primitives.brand[30] : primitives.brand[80];

    // Semantic Solid (High Emphasis)
    const mapSemanticSolid = (name: string, palette: Palette) => {
        const bg = isDark ? palette[80] : palette[40];
        sys[`${name}.solid.bg`] = bg;
        sys[`${name}.solid.text`] = this.pickContrastColor(bg, white, black);
    };
    
    mapSemanticSolid('error', primitives.error);
    mapSemanticSolid('warning', primitives.warning);
    mapSemanticSolid('success', primitives.success);
    mapSemanticSolid('info', primitives.brand);

    return sys;
  }

  private getActionTokens(primitives: Primitives, isDark: boolean): SystemTokens {
    const sys: SystemTokens = {};
    const white = '#ffffff'; 
    const black = '#000000'; 

    const mapAction = (level: string, palette: Palette) => {
        if (!isDark) {
            sys[`action.${level}`] = palette[40];
            sys[`action.${level}.hover`] = palette[30];
            sys[`action.${level}.bg`] = palette[95];
            sys[`text.on-${level}`] = this.pickContrastColor(palette[40], white, black);
        } else {
            sys[`action.${level}`] = palette[80];
            sys[`action.${level}.hover`] = palette[70];
            sys[`action.${level}.bg`] = palette[20];
            sys[`text.on-${level}`] = this.pickContrastColor(palette[80], white, black);
        }
    };

    mapAction('secondary', primitives.secondary);
    mapAction('tertiary', primitives.tertiary);
    mapAction('fourth', primitives.fourth);
    mapAction('emphasize', primitives.emphasize);

    // Interaction / Action States
    if (!isDark) {
      sys['action.primary.pressed'] = primitives.brand[30]; 
      sys['action.primary.disabled'] = primitives.neutral[90]; 
      sys['action.primary.disabled-text'] = primitives.neutral[60];
    } else {
      sys['action.primary.pressed'] = primitives.brand[70]; 
      sys['action.primary.disabled'] = primitives.neutral[20]; 
      sys['action.primary.disabled-text'] = primitives.neutral[50];
    }

    return sys;
  }

  private getEffectTokens(isDark: boolean): SystemTokens {
      const sys: SystemTokens = {};
      if (!isDark) {
        sys['effect.shadow.sm'] = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
        sys['effect.shadow.md'] = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
        sys['effect.shadow.lg'] = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
      } else {
        sys['effect.shadow.sm'] = '0 1px 2px 0 rgba(0, 0, 0, 0.3)';
        sys['effect.shadow.md'] = '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.2)';
        sys['effect.shadow.lg'] = '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.2)';
      }
      return sys;
  }

  getContrast(hex1: string, hex2: string): number {
      return wcagContrast(hex1, hex2);
  }
}

import type { SystemTokens } from './colors-system';
import { formatHex, parse, formatCss } from 'culori';

import mappingData from './data/harmony-mapping.json';

const mapping = mappingData as Record<string, string>;

/**
 * Domain-Driven Semantic Mapper for HarmonyOS
 * Maps ~1000 system resource keys to our 3-Layer Design Tokens.
 */
export class HarmonyMapper {
  private lightTokens: SystemTokens;
  private darkTokens: SystemTokens;

  constructor(lightTokens: SystemTokens, darkTokens: SystemTokens) {
    this.lightTokens = lightTokens;
    this.darkTokens = darkTokens;
  }

  /**
   * Generates the HarmonyOS color.json content
   * @param keys List of ohos_id keys
   * @param mode 'base' (Light) or 'dark'
   */
  generateResource(keys: string[], mode: 'base' | 'dark'): Record<string, string> {
    const result: Record<string, string> = {};
    const contextTokens = mode === 'base' ? this.lightTokens : this.darkTokens;

    keys.forEach(key => {
      // Filter out non-color resources
      if (this.shouldSkipKey(key)) return;

      const targetTokens = contextTokens;

      // 1. Resolve Base Color
      let colorValue = this.resolveSemanticColor(key, targetTokens);

      // 2. Apply Alpha Modifiers (e.g. _transparent)
      if (key.includes('_transparent') || key.includes('_alpha')) {
         colorValue = this.applyAlpha(colorValue, 0.6); // Default transparent alpha
      }
      
      // 3. Handle Disabled
      if (key.includes('_disable')) {
         colorValue = this.applyAlpha(colorValue, 0.4);
      }

      // 4. Store result
      result[key] = colorValue;
    });

    return result;
  }

  private shouldSkipKey(key: string): boolean {
    // Skip Shadows (defined by object/reference, not simple color string)
    if (key.includes('_shadow_')) return true;
    
    // Skip Blur Styles (usually complex effects or enums)
    // Exception: keys ending in '_color' might be valid colors used IN a blur style
    if (key.includes('blur_style') && !key.endsWith('_color')) return true;

    // Skip non-color metrics/dimensions if they appear (just in case)
    if (key.includes('corner_radius') || key.includes('padding') || key.includes('width')) return true;

    return false;
  }

  private safelyGetToken(tokens: SystemTokens, key: string, fallback: string =  '#000000'): string {
      return tokens[key] || fallback;
  }

  private resolveSemanticColor(key: string, tokens: SystemTokens): string {
    const t = (k: string) => this.safelyGetToken(tokens, k);

    // 0. Check Configuration Mapping (Exact Match)
    if (mapping[key]) {
        return t(mapping[key]);
    }

    // Fallback: Preserving original heuristic logic for unmapped keys
    // --- Priority 1: Direct System Colors ---
    if (key.includes('color_primary')) return t('brand.primary');
    if (key.includes('color_secondary')) return t('action.secondary'); // Use Action for secondary to avoid huge hue shifts
    if (key.includes('color_tertiary')) return t('action.tertiary');
    if (key.includes('color_fourth')) return t('action.fourth') || t('action.tertiary');
    
    // --- Priority 2: Functional / Status ---
    if (key.includes('warning')) return t('warning.text'); 
    if (key.includes('alert') || key.includes('error')) return t('error.text');
    if (key.includes('handup') || key.includes('success') || key.includes('connected')) return t('success.text');
    
    // --- Priority 2.5: Special Semantics (Harmony Specific) ---
    // Emphasize -> Brand
    if (key.includes('emphasize') && !key.includes('sub_emphasize')) {
        if (key.includes('contrary')) return t('text.on-brand');
        if (key.includes('bg') || key.includes('background')) return t('brand.primary'); // Background emphasize
        return t('brand.primary'); // Default emphasize -> brand
    }

    // Contrary / Inverse
    if (key.includes('contrary')) {
        if (key.includes('primary')) return t('text.on-brand');
        return t('bg.canvas'); // Generic contrary usually means background for text, or text for background. 
        // But ohos_id_color_foreground_contrary is likely "White" (on dark) or "Black" (on light) -> text.inverse
        if (key.includes('foreground')) return t('text.inverse');
    }

    // Foreground -> Primary Text
    if (key.includes('foreground')) {
        return t('text.primary');
    }

    // --- Priority 3: Component Surfaces ---
    // Text Fields
    if (key.includes('text_field_bg')) return t('bg.canvas'); // Input bg
    
    // Navigation (Titlebar, Toolbar, Tab) -> Usually Surface or Primary variants
    if (key.includes('titlebar_bg')) return t('bg.canvas'); 
    if (key.includes('navigationbar_bg')) return t('bg.canvas');
    if (key.includes('tab_bg')) return t('bg.canvas');
    
    // Containers / Cards
    if (key.includes('card_bg')) return t('bg.container');
    if (key.includes('panel_bg')) return t('bg.container');
    if (key.includes('dialog_bg')) return t('bg.container');
    if (key.includes('toast_bg') || key.includes('toast_container')) return t('bg.container'); // Toast often darker/inverse
    
    // --- Priority 4: Backgrounds (General) ---
    if (key.includes('sub_background')) return t('bg.container');
    if (key.includes('background')) return t('bg.canvas'); // Default BG
    
    // --- Priority 5: Text / Icons ---
    if (key.includes('text_primary')) return t('text.primary');
    if (key.includes('text_secondary')) return t('text.secondary');
    if (key.includes('text_tertiary')) return t('text.tertiary');
    if (key.includes('text_hint')) return t('text.placeholder');
    
    if (key.includes('icon_primary')) return t('text.primary');
    if (key.includes('icon_secondary')) return t('text.secondary');

    // --- Priority 6: Interactive Elements ---
    if (key.includes('button_normal')) return t('action.primary');
    if (key.includes('switch_bg') && !key.includes('off')) return t('action.primary');
    if (key.includes('checkbox')) return t('action.primary');
    if (key.includes('floating_button')) return t('action.primary');
    
    // --- Priority 7: Modifiers (Pressed, Hover) ---
    if (key.includes('pressed') || key.includes('click_effect')) return t('action.primary.pressed');
    if (key.includes('hover')) return t('action.primary.hover');
    
    // Fallback: If nothing matched, use a safe neutral or transparent
    if (key.includes('separator') || key.includes('divider')) return t('border.divider');
    if (key.includes('mask')) return t('bg.mask'); // e.g. mask_thin
    
    // Deep Fallback
    return t('text.primary'); // Visible but safe
  }

  private applyAlpha(colorStr: string, alpha: number): string {
    const c = parse(colorStr);
    if (!c) return colorStr;
    
    // Check if it's P3
    if (colorStr.startsWith('color(display-p3')) {
        c.alpha = alpha;
        return formatCss(c);
    }
    
    // Force Hex Alpha (RRGGBBAA)
    const toHex = (n: number) => {
        const hex = Math.round(n * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };

    if (c.mode === 'rgb') {
        return `#${toHex(c.r)}${toHex(c.g)}${toHex(c.b)}${toHex(alpha)}`;
    }

    // Fallback for other modes -> convert to rgb first
    c.alpha = alpha;
    return formatHex(c);
  }
}

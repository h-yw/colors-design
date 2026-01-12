import { useMemo } from 'react';
import { useThemeStore } from '../store/useThemeStore';
import { TraditionalColorSystem } from '@moonhou/colors-core';
import colorData from '../lib/colors.json';

interface ColorItem {
  name: string;
  hex: string;
  pinyin: string;
  description?: string;
  isCustom?: boolean;
}

export const useActivePalette = () => {
  const { theme, hex, mode, gamut } = useThemeStore();

  const isDark = mode === 'dark';
  const isP3 = gamut === 'p3';

  // 1. Resolve Active Color
  const activeColor = useMemo<ColorItem>(() => {
    // Custom Hex Priority
    if (hex) {
      const safeHex = hex.startsWith('#') ? hex : `#${hex}`;
      return {
        name: `Custom (${safeHex})`,
        hex: safeHex,
        pinyin: 'custom', // Simplified pinyin for custom
        isCustom: true
      };
    }
    // Theme Fallback
    if (theme) {
      const found = (colorData as ColorItem[]).find(c => c.name === theme);
      if (found) return found;
    }
    // Absolute Default
    return (colorData[0] as ColorItem);
  }, [hex, theme]);

  // 2. Instantiate System
  const system = useMemo(() => {
    const data = activeColor.isCustom ? [activeColor] : (colorData as ColorItem[]);
    // @ts-ignore - Assuming Core supports targetGamut in options, checking needed if it fails, 
    // but preserving logic from previous files which used it.
    return new TraditionalColorSystem(data, { targetGamut: isP3 ? 'p3' : 'srgb' });
  }, [activeColor, isP3]);

  // 3. Generate Palette
  const palette = useMemo(() => {
    return system.generatePalette(activeColor.name, isDark);
  }, [system, activeColor.name, isDark]);

  return {
    activeColor,
    system,
    palette,
    isDark,
    isP3
  };
};

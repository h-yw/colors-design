import { useEffect } from 'react';
import { useThemeStore } from '../store/useThemeStore';
import { useActivePalette } from './useActivePalette';

/**
 * Injects CSS Variables and sets Data Attributes based on active palette.
 */
export const useThemeEffects = () => {
    const { mode } = useThemeStore();
    const { palette } = useActivePalette();

    useEffect(() => {
        if (typeof document === 'undefined') return;

        const root = document.documentElement;
        const setProp = (key: string, val: string) => root.style.setProperty(key, val);

        // Inject Tokens
        Object.entries(palette.tokens).forEach(([key, val]) => {
          if (!val) return;
          const cssKey = key.replace(/\./g, '-');
          setProp(`--sys-${cssKey}`, val as string);
        });
        
        // Inject State
        if (palette.state) {
            Object.entries(palette.state).forEach(([key, val]) => {
                // @ts-ignore
              setProp(`--state-${key}`, val as string);
            });
        }
    
        // Toggle Dark Mode Attribute
        if (mode === 'dark') {
          root.setAttribute('data-theme', 'dark');
          root.style.colorScheme = 'dark';
        } else {
          root.removeAttribute('data-theme');
          root.style.colorScheme = 'light';
        }
    
      }, [palette, mode]);
}

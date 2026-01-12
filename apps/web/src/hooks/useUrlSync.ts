import { useEffect, useState } from 'react';
import { useThemeStore } from '../store/useThemeStore';

/**
 * Synchronizes Zustand Store with URL Query Parameters.
 * Bi-directional sync: URL -> Store (on mount), Store -> URL (on update).
 */
export const useUrlSync = () => {
    const { theme, hex, mode, gamut, setAll } = useThemeStore();
    const [isHydrated, setIsHydrated] = useState(false);
  
    // 1. Sync URL on Mount (Hydration)
    useEffect(() => {
      if (typeof window === 'undefined') return;

      const params = new URLSearchParams(window.location.search);
      const urlTheme = params.get('theme');
      const urlHex = params.get('hex');
      const urlMode = params.get('mode') as 'light' | 'dark' | null;
      const urlGamut = params.get('gamut') as 'srgb' | 'p3' | null;
  
      if (urlTheme || urlHex || urlMode || urlGamut) {
          setAll({
              theme: urlTheme || theme,
              hex: urlHex || undefined, 
              mode: urlMode || mode,
              gamut: urlGamut || gamut
          });
      }
      setIsHydrated(true);
    }, []); 
  
    // 2. Sync State TO URL
    useEffect(() => {
      if (!isHydrated || typeof window === 'undefined') return;
  
      const params = new URLSearchParams(window.location.search);
      
      // Clear mutually exclusive
      if (hex) {
        const cleanHex = hex.startsWith('#') ? hex.slice(1) : hex;
        params.set('hex', cleanHex);
        params.delete('theme');
      } else if (theme) {
        params.set('theme', theme);
        params.delete('hex');
      }
  
      if (mode) params.set('mode', mode);
      if (gamut) params.set('gamut', gamut);
  
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState({}, '', newUrl);
  
    }, [theme, hex, mode, gamut, isHydrated]);
};

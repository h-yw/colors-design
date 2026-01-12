import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  theme: string;
  hex?: string;
  mode: 'light' | 'dark';
  gamut: 'srgb' | 'p3';
  
  // Actions
  setTheme: (theme: string) => void;
  setHex: (hex: string) => void;
  setMode: (mode: 'light' | 'dark') => void;
  setGamut: (gamut: 'srgb' | 'p3') => void;
  setAll: (state: Partial<Omit<ThemeState, 'setTheme' | 'setHex' | 'setMode' | 'setGamut' | 'setAll'>>) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: '朱红', // Default
      mode: 'light',
      gamut: 'srgb',

      setTheme: (theme) => set({ theme, hex: undefined }), // Setting theme clears custom hex
      setHex: (hex) => set({ hex, theme: undefined }),     // Setting hex clears theme name
      setMode: (mode) => set({ mode }),
      setGamut: (gamut) => set({ gamut }),
      setAll: (state) => set((prev) => ({ ...prev, ...state })),
    }),
    {
      name: 'bg-theme-storage', // unique name
    }
  )
);

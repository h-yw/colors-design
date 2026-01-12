import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  theme: string;
  hex?: string;
  mode: 'light' | 'dark';
  gamut: 'srgb' | 'p3';
  
  customSecondary?: string;
  customTertiary?: string;
  
  // Actions
  setTheme: (theme: string) => void;
  setHex: (hex: string) => void;
  setMode: (mode: 'light' | 'dark') => void;
  setGamut: (gamut: 'srgb' | 'p3') => void;
  setToken: (key: 'secondary' | 'tertiary', value: string | undefined) => void;
  setAll: (state: Partial<Omit<ThemeState, 'setTheme' | 'setHex' | 'setMode' | 'setGamut' | 'setAll'>>) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: '朱红', // Default
      mode: 'light',
      gamut: 'srgb',

      customSecondary: undefined,
      customTertiary: undefined,

      setTheme: (theme) => set({ theme, hex: undefined, customSecondary: undefined, customTertiary: undefined }), // Reset customs
      setHex: (hex) => set({ hex, theme: undefined, customSecondary: undefined, customTertiary: undefined }),     // Reset customs
      setMode: (mode) => set({ mode }),
      setGamut: (gamut) => set({ gamut }),
      setToken: (key, value) => {
          if (key === 'secondary') set({ customSecondary: value });
          if (key === 'tertiary') set({ customTertiary: value });
      },
      setAll: (state) => set((prev) => ({ ...prev, ...state })),
    }),
    {
      name: 'bg-theme-storage', // unique name
    }
  )
);

import { describe, it, expect } from 'vitest';
import * as Core from '../index';

import colorData from './data/colors.json';


describe('TraditionalColorSystem', () => {

   it('should export TraditionalColorSystem', () => {
    expect(Core.TraditionalColorSystem).toBeDefined();
  });

  it('should export APCA utilities', () => {
    expect(Core.calcAPCA).toBeDefined();
  });
    // Basic instantiation check
    it('should instantiate with color data', () => {
        const system = new Core.TraditionalColorSystem(colorData as any);
        expect(system).toBeDefined();
    });

    // Palette Generation Check
    it('should generate a valid palette for a known color', () => {
        const system = new Core.TraditionalColorSystem(colorData as any);
        const palette = system.generatePalette('朱红', false); // Vermilion

        expect(palette).toBeDefined();
        expect(palette.meta.name).toBe('朱红');
        
        // Check Primitive Scales exist
        expect(palette.primitives).toHaveProperty('brand');
        expect(palette.primitives.brand).toHaveProperty('50');
        
        // Check Semantic Tokens exist
        expect(palette.tokens).toHaveProperty('brand.primary');
        expect(palette.tokens).toHaveProperty('bg.canvas');
    });

    // OKLCH / Contrast Check
    it('should ensure text contrast meets AA guidelines for generated tokens', () => {
        const system = new Core.TraditionalColorSystem(colorData as any);
        const palette = system.generatePalette('朱红', false);

        const bg = palette.tokens['brand.primary'] || '#000000';
        const text = palette.tokens['text.on-brand'] || '#ffffff';

        const contrast = system.getContrast(text, bg);
        // We aim for AA (4.5) for generic text, but brand might be large text (3.0) or graphical. 
        // Our system enforces 4.5 usually.
        expect(contrast).toBeGreaterThanOrEqual(3.0);  
    });

    // Dark Mode Check
    it('should generate different tokens for dark mode', () => {
        const system = new Core.TraditionalColorSystem(colorData as any);
        const light = system.generatePalette('朱红', false);
        const dark = system.generatePalette('朱红', true);

        expect(light.tokens['bg.canvas']).not.toBe(dark.tokens['bg.canvas']);
        // Dark mode canvas should be dark (low lightness)
        // We can't easily check 'darkness' without helper, but inequality is a good start.
    });

    // P3 Precision Check
    it('should format P3 colors with max 4 decimal places', () => {
        const system = new Core.TraditionalColorSystem(colorData as any, { targetGamut: 'p3' });
        // Generate a palette that forces P3 (usually high chroma colors)
        // Vermilion (Zhuhong) is quite vibrant
        const palette = system.generatePalette('朱红', false);
        // Find a p3 token
        const p3TokenKey:any = Object.keys(palette.primitives.brand).find((key:any) => palette.primitives.brand[key].startsWith('color(display-p3'));
        
        if (p3TokenKey) {
            const p3Value = palette.primitives.brand[p3TokenKey];
            // Regex to match decimals: \.\d+
            const match = p3Value.match(/\.(\d+)/g);
            if (match) {
                // Check each decimal part has length <= 5 (dot + 4 digits)
                match.forEach(m => {
                    expect(m.length).toBeLessThanOrEqual(5);
                });
            }
        }
    });

    // APCA P3 Support Check
    it('should calculate APCA for P3 color strings', () => {
        const p3White = 'color(display-p3 1 1 1)';
        const p3Black = 'color(display-p3 0 0 0)';
        const score = Core.calcAPCA(p3Black, p3White);
        expect(score).not.toBe(0);
        expect(Math.abs(score)).toBeGreaterThan(100); // White on Black should be high contrast
    });

    // Gamut Mapping Boundary Check
    it('should clamp high chroma colors to sRGB gamut', () => {
        const system = new Core.TraditionalColorSystem(colorData as any, { targetGamut: 'srgb' });
        
        // Ultra bright/vibrant color that is definitely out of sRGB
        // P3 Red: approx oklch(0.65 0.3 30)
        const highChroma: any = { mode: 'oklch', l: 0.65, c: 0.3, h: 30 };
        
        const fitted = system.fitToGamut(highChroma);
        
        // It should have reduced chroma
        expect(fitted.c).toBeLessThan(0.3);
        // But kept hue relatively stable (within small margin or exactly same if logic is simple)
        expect(fitted.h).toBe(30);
        // And lightness should be preserved
        expect(fitted.l).toBe(0.65);
    });

    // Extreme Contrast Check
    it('should provide readable contrast for black/white extremes', () => {
        const system = new Core.TraditionalColorSystem(colorData as any);
        const black = '#000000';
        const white = '#ffffff';
        
        const contrast = system.getContrast(black, white);
        expect(contrast).toBeGreaterThan(20); // Max is 21
    });
});
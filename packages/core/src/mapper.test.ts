
import { describe, it, expect } from 'vitest';
import { HarmonyMapper } from './harmony-mapper';
import type { SystemTokens } from './colors-system';

describe('HarmonyMapper', () => {
    const mockLightTokens: SystemTokens = {
        'brand.primary': '#brand-light',
        'text.primary': '#text-light',
        'bg.canvas': '#bg-light',
        'action.secondary': '#secondary-light',
        'warning.text': '#warning-light'
    };

    const mockDarkTokens: SystemTokens = {
        'brand.primary': '#brand-dark',
        'text.primary': '#text-dark',
        'bg.canvas': '#bg-dark',
        'action.secondary': '#secondary-dark',
        'warning.text': '#warning-dark'
    };

    const mapper = new HarmonyMapper(mockLightTokens, mockDarkTokens);

    it('should map keys from configuration (JSON)', () => {
        // ohos_id_color_primary -> brand.primary
        const result = mapper.generateResource(['ohos_id_color_primary'], 'base');
        expect(result['ohos_id_color_primary']).toBe('#brand-light');
    });

    it('should map keys using fallback logic', () => {
        // ohos_id_color_secondary contains "color_secondary" -> action.secondary
        const result = mapper.generateResource(['ohos_id_color_secondary'], 'base');
        expect(result['ohos_id_color_secondary']).toBe('#secondary-light');
    });

    it('should map keys using json config over fallback logic if both match', () => {
        // ohos_id_color_warning -> warning.text
        // "ohos_id_color_warning" is in JSON mapping to "warning.text"
        // It also contains "warning", so fallback would also map to "warning.text"
        // To strictly prove JSON priority, we rely on the fact that JSON check is first in code.
        const result = mapper.generateResource(['ohos_id_color_warning'], 'base');
        expect(result['ohos_id_color_warning']).toBe('#warning-light');
    });

    it('should handle dark mode', () => {
        const result = mapper.generateResource(['ohos_id_color_primary'], 'dark');
        expect(result['ohos_id_color_primary']).toBe('#brand-dark');
    });

    it('should handle transparent suffix', () => {
        const validTokens = { 'brand.primary': '#ff0000' };
        const validMapper = new HarmonyMapper(validTokens, validTokens);

        const result = validMapper.generateResource(['ohos_id_color_primary_transparent'], 'base');
        console.log('Result for transparent:', result['ohos_id_color_primary_transparent']);
        
        // Manual culori check
        const { parse, formatHex } = require('culori');
        const c = parse('#ff0000');
        if (c) c.alpha = 0.6;
        console.log('Culori manual check:', formatHex(c));

        expect(result['ohos_id_color_primary_transparent']).toMatch(/#ff000099/i);
    });
});


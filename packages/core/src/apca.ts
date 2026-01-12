// @ts-ignore
import { calcAPCA as apca } from 'apca-w3';
import { converter, useMode, modeP3 } from 'culori';

useMode(modeP3);

const toRgb = converter('rgb');

/**
 * Calculates APCA Contrast (Lc)
 * Returns a value between -108 and +106.
 * Magnitude indicates contrast. Polarity indicates light-on-dark (neg) or dark-on-light (pos).
 */
export function calcAPCA(textColor: string | object, bgColor: string | object): number {
    const txt = toRgb(textColor as any);
    const bg = toRgb(bgColor as any);
    if (!txt || !bg) return 0;
    
    // Explicitly cast to Rgb shape to satisfy TS if inference fails
    const t = txt as { r: number, g: number, b: number };
    const b = bg as { r: number, g: number, b: number };

    const clamp = (v: number) => Math.max(0, Math.min(1, v));
    const tInt: [number, number, number, number] = [Math.round(clamp(t.r) * 255), Math.round(clamp(t.g) * 255), Math.round(clamp(t.b) * 255), 1.0];
    const bInt: [number, number, number, number] = [Math.round(clamp(b.r) * 255), Math.round(clamp(b.g) * 255), Math.round(clamp(b.b) * 255), 1.0];
    
    // The signature is usually apca(txt, bg)
    try {
        const score = apca(tInt, bInt);
        // Returns number or string error?
        return typeof score === 'number' ? score : 0;
    } catch (e) {
        console.warn('APCA Calc Error', e);
        return 0;
    }
}

/**
 * Gets a rating string based on Lc score.
 * Based on APCA silver guidelines.
 */
export function getContrastRating(lc: number): string {
    const score = Math.abs(lc);
    if (score >= 90) return 'Preferred (Body)';
    if (score >= 75) return 'Good (Body)';
    if (score >= 60) return 'Min (Content)';
    if (score >= 45) return 'Min (Large)';
    return 'Fail';
}

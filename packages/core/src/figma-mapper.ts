
import type { GeneratedSystem, Palette } from './colors-system';

interface TokenNode {
  value: string;
  type: string;
  description?: string;
  $type?: string;     // Generic W3C
  $value?: string;    // Generic W3C
}

interface ToneGroup {
  [key: string]: TokenNode | ToneGroup;
}

/**
 * Maps the generated system to Tokens Studio / W3C Format
 */
export function mapToFigma(system: GeneratedSystem) {
    const root: Record<string, any> = {};

    // 1. Primitives (Global Set)
    // Structure: primitives.brand.50
    root['primitives'] = {};
    
    Object.entries(system.primitives).forEach(([name, palette]) => {
        const group: ToneGroup = {};
        Object.entries(palette as Palette).forEach(([level, hex]) => {
            group[level] = {
                value: hex,
                type: 'color'
            };
        });
        root['primitives'][name] = group;
    });

    // 2. Semantics (Light/Dark Mode Set)
    // Structure: sys.brand.primary
    // We need to un-flatten 'brand.primary' -> { brand: { primary: ... } }
    
    const semanticRoot: Record<string, any> = {};
    
    Object.entries(system.tokens).forEach(([key, value]) => {
        // key is like "brand.primary" or "text.on-brand" or "bg.canvas"
        const parts = key.split('.');
        
        let current = semanticRoot;
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            if (i === parts.length - 1) {
                // Leaf
                current[part] = {
                    value: value,
                    type: 'color'
                };
            } else {
                // Branch
                if (!current[part]) current[part] = {};
                current = current[part];
            }
        }
    });

    // In Tokens Studio, usually you have sets like "global" and "light"/"dark".
    // We will return a structure that can be pasted into the "JSON" tab of Tokens Studio.
    // Usually it expects a flat object of Sets locally, or just one file.
    // We will separate them conceptually.
    
    return {
        ...root['primitives'], // Flatten primitives to top level for convenience? 
                               // Or keep them strictly namespaced?
                               // Let's stick to "primitives" and "sys" folders if possible, 
                               // but Tokens Studio standard is often just generic nesting.
        
        // Actually best practice:
        // "core": { ...primitives },
        // "semantic": { ...semanticRoot }
        
        core: root['primitives'],
        sys: semanticRoot
    };
}

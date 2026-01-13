
import * as fs from 'fs';
import * as path from 'path';
import { HarmonyMapper } from '../harmony-mapper';
import { fileURLToPath } from 'url';

// Resolve paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const harmonyJsonPath = path.resolve(__dirname, '../../../../apps/web/public/harmony.json');
const mappingOutputPath = path.resolve(__dirname, '../data/harmony-mapping.json');

// Mock SystemTokens using Proxy to return key as value
const tokenProxy = new Proxy({}, {
    get: (_, prop) => String(prop)
});

async function generate() {
    console.log(`Reading harmony.json from ${harmonyJsonPath}...`);
    const harmonyData = JSON.parse(fs.readFileSync(harmonyJsonPath, 'utf-8'));
    const keys = Object.keys(harmonyData.color);

    console.log(`Found ${keys.length} keys.`);

    // Instantiate Mapper
    const mapper = new HarmonyMapper(tokenProxy as any, tokenProxy as any);

    // Generate Resource (which uses the mapping logic)
    // We want to capture what tokens they resolve to.
    
    // IMPORTANT: To capture the *logic-derived* values properly, we need to temporarily
    // bypass the *existing* JSON mapping if it overrides logic (which check #0 does).
    // Current HarmonyMapper code checks ./data/harmony-mapping.json.
    // However, since we are running this script *before* we overwrite the file with the full set,
    // the current file only has the partial set.
    // The partial set IS correct (manual overrides).
    // The keys NOT in the partial set will fall through to logic.
    // So running as-is is actually fine! It will preserve manual overrides and fill the rest with logic.
    
    const result = mapper.generateResource(keys, 'base');
    
    // The result values will be token keys (e.g., "brand.primary") OR hex values if fallback failed
    // OR "brand.primary" (modified by applyAlpha? proxy strings might be parsed/formatted)
    // Wait, applyAlpha calls parse(colorStr).
    // parse("brand.primary") -> undefined (usually).
    // applyAlpha returns colorStr if !c.
    // So "brand.primary" returns as "brand.primary".
    // Perfect.

    // Construct the mapping
    const fullMapping: Record<string, string> = {};
    
    // Filter out keys we don't want to map or that failed
    Object.entries(result).forEach(([key, tokenKey]) => {
        // If the token key looks like a valid token (contains dot or is known semantic) is best.
        // But our proxy returns everything.
        
        // We probably don't need to save keys that resolve to fallback ("text.primary") IF that was just a broad fallback
        // But defining them explicitly makes the system deterministic and allows removing the heuristic code later!
        
        fullMapping[key] = tokenKey;
    });

    console.log(`Generated ${Object.keys(fullMapping).length} mappings.`);
    
    fs.writeFileSync(mappingOutputPath, JSON.stringify(fullMapping, null, 2));
    console.log(`Wrote to ${mappingOutputPath}`);
}

generate().catch(console.error);

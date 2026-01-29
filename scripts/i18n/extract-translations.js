/**
 * Extract translations from dictionary files
 * Run with: node scripts/i18n/extract-translations.js
 */

const fs = require('fs');
const path = require('path');

// Read files
const moveDictPath = path.join(__dirname, '..', 'moveDictionary.js');
const moveDictContent = fs.readFileSync(moveDictPath, 'utf8');

const itemDictPath = path.join(__dirname, '..', 'itemDictionary.js');
const itemDictContent = fs.readFileSync(itemDictPath, 'utf8');

// Helper to convert camelCase to Title Case
function formatKey(key) {
    return key
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/\b\w/g, c => c.toUpperCase());
}

// Clean up info string - convert ${} to {} placeholders
function cleanInfo(info) {
    if (!info) return null;

    let cleaned = info;

    // Convert ${tagXxx} to {Xxx}
    cleaned = cleaned.replace(/\$\{tag(\w+)\}/g, '{$1}');

    // Convert ${joinWithAnd(...)} to generic text
    cleaned = cleaned.replace(/\$\{joinWithAnd\([^)]+\)\}/g, '(see affected moves)');
    cleaned = cleaned.replace(/\$\{joinWithOr\([^)]+\)\}/g, '{types}');

    // Convert ${this.power().toFixed(2)} and variants to {power}
    cleaned = cleaned.replace(/\$\{this\.power\(\)\.toFixed\(\d+\)\}/g, '{power}');
    cleaned = cleaned.replace(/\$\{this\.power\(\)\}/g, '{power}');
    cleaned = cleaned.replace(/\$\{Math\.floor\(this\.power\(\)\)\}/g, '{power}');

    // Convert held item pokemon reference
    cleaned = cleaned.replace(/\$\{format\(this\.heldBonusPkmn\(\)\)\}/g, '{pokemon}');
    cleaned = cleaned.replace(/\$\{this\.heldBonusPower\(\)\}/g, '{power}');

    // Convert level references
    cleaned = cleaned.replace(/\$\{wildAreaLevel\d+\}/g, '{level}');
    cleaned = cleaned.replace(/\$\{evolutionLevel\d+\}/g, '{level}');

    // Clean up any remaining ${...} - just remove the $
    cleaned = cleaned.replace(/\$\{([^}]+)\}/g, '{$1}');

    return cleaned;
}

// Parse a definition block and extract key info
function parseDefinition(objName, content) {
    const results = {};

    // Match pattern: objName.key = { ... }
    // We need to handle nested braces properly
    const pattern = new RegExp(`${objName}\\.(\\w+)\\s*=\\s*\\{`, 'g');
    let match;

    while ((match = pattern.exec(content)) !== null) {
        const key = match[1];
        const startIdx = match.index + match[0].length;

        // Find matching closing brace
        let braceCount = 1;
        let endIdx = startIdx;

        while (braceCount > 0 && endIdx < content.length) {
            if (content[endIdx] === '{') braceCount++;
            if (content[endIdx] === '}') braceCount--;
            endIdx++;
        }

        const body = content.slice(startIdx, endIdx - 1);

        const entry = { name: formatKey(key) };

        // Extract rename
        const renameMatch = body.match(/rename:\s*[`"']([^`"']+)[`"']/);
        if (renameMatch) {
            entry.name = formatKey(renameMatch[1]);
        }

        // Extract info - handle template literals with backticks
        const infoMatch = body.match(/info:\s*function\s*\(\s*\)\s*\{\s*return\s*`([^`]+)`/);
        if (infoMatch) {
            entry.info = cleanInfo(infoMatch[1]);
        } else {
            // Try with regular quotes
            const infoMatch2 = body.match(/info:\s*function\s*\(\s*\)\s*\{\s*return\s*["']([^"']+)["']/);
            if (infoMatch2) {
                entry.info = cleanInfo(infoMatch2[1]);
            }
        }

        results[key] = entry;
    }

    return results;
}

// Generate JS file content
function generateJsFile(category, lang, data) {
    const entries = Object.entries(data)
        .map(([key, value]) => {
            const props = [];
            if (value.name) props.push(`name: "${value.name.replace(/"/g, '\\"')}"`);
            if (value.info) props.push(`info: "${value.info.replace(/"/g, '\\"')}"`);
            return `    ${key}: { ${props.join(', ')} }`;
        })
        .join(',\n');

    return `// ${lang.toUpperCase()} ${category} translations
// Auto-generated - edit to add/modify translations

i18n.register('${category}', '${lang}', {
${entries}
});
`;
}

// Main
console.log('Extracting translations...');

const abilities = parseDefinition('ability', moveDictContent);
const moves = parseDefinition('move', moveDictContent);

// For items, filter out TMs and hidden items
const allItems = parseDefinition('item', itemDictContent);
const items = {};
for (const [key, value] of Object.entries(allItems)) {
    if (!key.endsWith('Tm')) {
        items[key] = value;
    }
}

// Count items with info
const abilitiesWithInfo = Object.values(abilities).filter(a => a.info).length;
const movesWithInfo = Object.values(moves).filter(m => m.info).length;
const itemsWithInfo = Object.values(items).filter(i => i.info).length;

console.log(`Found ${Object.keys(abilities).length} abilities (${abilitiesWithInfo} with info)`);
console.log(`Found ${Object.keys(moves).length} moves (${movesWithInfo} with info)`);
console.log(`Found ${Object.keys(items).length} items (${itemsWithInfo} with info)`);

// Write EN files
const abilitiesEnPath = path.join(__dirname, 'abilities', 'en.js');
fs.writeFileSync(abilitiesEnPath, generateJsFile('abilities', 'en', abilities));
console.log(`Written: ${abilitiesEnPath}`);

const movesEnPath = path.join(__dirname, 'moves', 'en.js');
fs.writeFileSync(movesEnPath, generateJsFile('moves', 'en', moves));
console.log(`Written: ${movesEnPath}`);

const itemsEnPath = path.join(__dirname, 'items', 'en.js');
fs.writeFileSync(itemsEnPath, generateJsFile('items', 'en', items));
console.log(`Written: ${itemsEnPath}`);

// Create buffs EN file
const buffs = {
    burn: { name: "Burn", info: "Decreases Physical Attack by 50% and deals damage every turn" },
    poisoned: { name: "Poisoned", info: "Decreases Special Attack by 50% and deals damage every turn" },
    sleep: { name: "Sleep", info: "Moves fail to deal damage" },
    freeze: { name: "Freeze", info: "Moves fail to deal damage" },
    confused: { name: "Confused", info: "50% chance for moves to fail to deal damage" },
    paralysis: { name: "Paralysis", info: "25% chance for moves to fail to deal damage and Speed is reduced by 75%" },
    sunny: { name: "Sunny", info: "Increases the damage of Fire-Type moves by 75% and decreases the damage of Water-Type moves by 50%" },
    rainy: { name: "Rainy", info: "Increases the damage of Water-Type moves by 75% and decreases the damage of Fire-Type moves by 50%" },
    sandstorm: { name: "Sandstorm", info: "Increases the damage of Rock and Ground-Type moves by 75%" },
    hail: { name: "Hail", info: "Increases the damage of Ice-Type moves by 75%" },
    foggy: { name: "Foggy", info: "Increases the damage of Dark and Ghost-Type moves by 75%" },
    electricTerrain: { name: "Electric Terrain", info: "Increases the damage of Electric and Steel-Type moves by 75%" },
    grassyTerrain: { name: "Grassy Terrain", info: "Increases the damage of Grass and Bug-Type moves by 75%" },
    mistyTerrain: { name: "Misty Terrain", info: "Increases the damage of Fairy and Psychic-Type moves by 75%" }
};

const buffsEnPath = path.join(__dirname, 'buffs', 'en.js');
fs.writeFileSync(buffsEnPath, generateJsFile('buffs', 'en', buffs));
console.log(`Written: ${buffsEnPath}`);

console.log('\nDone!');

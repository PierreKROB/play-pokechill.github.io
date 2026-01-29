/**
 * Remove info and rename properties from dictionary files
 * Run with: node scripts/i18n/cleanup-dictionaries.js
 */

const fs = require('fs');
const path = require('path');

function cleanupFile(filePath, removeInfo = true) {
    console.log(`\nProcessing: ${path.basename(filePath)}`);

    let content = fs.readFileSync(filePath, 'utf8');
    const originalLength = content.length;

    let infoRemoved = 0;
    let renameRemoved = 0;

    if (removeInfo) {
        // Remove info: function() {return `...`}, - need to handle nested backticks with ${...}
        // Match from "info:" to the closing "}" of the function, then optional comma
        // The backtick string can contain ${...} so we need to be careful

        // Strategy: find "info: function()" then find the matching closing brace
        const lines = content.split('\n');
        const newLines = [];
        let i = 0;

        while (i < lines.length) {
            const line = lines[i];

            // Check if this line contains an info function start
            if (/info:\s*function\s*\(\s*\)\s*\{/.test(line)) {
                // Check if it's a single-line info (ends with } or },)
                if (/info:\s*function\s*\(\s*\)\s*\{.*\}\s*,?\s*$/.test(line)) {
                    // Single line info - remove entire line or just the info part
                    const cleaned = line.replace(/\s*info:\s*function\s*\(\s*\)\s*\{.*\}\s*,?/, '');
                    if (cleaned.trim()) {
                        newLines.push(cleaned);
                    }
                    infoRemoved++;
                } else {
                    // Multi-line info - skip until we find the closing }
                    let braceCount = (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
                    i++;
                    while (i < lines.length && braceCount > 0) {
                        braceCount += (lines[i].match(/\{/g) || []).length;
                        braceCount -= (lines[i].match(/\}/g) || []).length;
                        i++;
                    }
                    infoRemoved++;
                    continue; // Skip adding this line
                }
            } else {
                newLines.push(line);
            }
            i++;
        }

        content = newLines.join('\n');
    }

    // Remove rename: `...`, or rename: "...", or rename: '...'
    // These are always single-line
    const renamePattern = /^\s*rename:\s*[`"'][^`"']*[`"']\s*,?\s*$/gm;
    const renameMatches = content.match(renamePattern);
    if (renameMatches) {
        renameRemoved = renameMatches.length;
    }
    content = content.replace(renamePattern, '');

    // Also handle rename on same line as other properties
    const inlineRenamePattern = /rename:\s*[`"'][^`"']*[`"']\s*,\s*/g;
    const inlineMatches = content.match(inlineRenamePattern);
    if (inlineMatches) {
        renameRemoved += inlineMatches.length;
    }
    content = content.replace(inlineRenamePattern, '');

    // Clean up any resulting issues
    content = content.replace(/,\s*,/g, ',');
    content = content.replace(/,(\s*\})/g, '$1');
    content = content.replace(/\{\s*,/g, '{');

    // Clean up multiple empty lines
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

    // Write back
    fs.writeFileSync(filePath, content);

    const newLength = content.length;
    console.log(`  - Removed ${infoRemoved} info functions`);
    console.log(`  - Removed ${renameRemoved} rename properties`);
    console.log(`  - File size: ${originalLength} → ${newLength} bytes (${Math.round((1 - newLength/originalLength) * 100)}% reduction)`);
}

// Main
console.log('=== Dictionary Cleanup ===');
console.log('Removing info and rename properties...\n');

const scriptsDir = path.join(__dirname, '..');

// Clean moveDictionary.js (abilities + moves)
cleanupFile(path.join(scriptsDir, 'moveDictionary.js'), true);

// Clean itemDictionary.js
cleanupFile(path.join(scriptsDir, 'itemDictionary.js'), true);

// Clean pkmnDictionary.js (only rename, no info)
cleanupFile(path.join(scriptsDir, 'pkmnDictionary.js'), false);

console.log('\n=== Done! ===');
console.log('All text content has been moved to i18n files.');
console.log('Dictionary files now only contain game logic.');

import * as fs from 'fs';
import * as path from 'path';

const jsbFile = path.join(process.cwd(), 'src/lib/jsb-metadata.ts');
let content = fs.readFileSync(jsbFile, 'utf-8');

function cleanKey(title: string): string {
  return title.toLowerCase()
    .replace(/\([^)]*\)/g, '')
    .replace(/["'`,.-]/g, ' ')
    .replace(/\s+(a|the)\s*$/i, '')
    .replace(/^(a|the)\s+/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Just match the JSB1_SONGS dictionary and JSB2_SONGS array/set and clean the keys
// Actually, it's easier to just do it via regex on the file content if possible, or just parse it.
// Let's just let the normalizer at runtime handle it! The lookup keys in JSB1_SONGS are already mostly lowercase.
// Wait, if the lookup keys in JSB1_SONGS contain punctuation (like "it's all right with me"), and the `normalize` function removes punctuation from the *input*, then `JSB1_SONGS["its all right with me"]` will be undefined!
// So the keys in JSB1_SONGS MUST also be normalized.

// Let's write a quick script to re-generate the file with cleaned keys.
// But wait, it's faster for me to just overwrite jsb-metadata.ts completely.

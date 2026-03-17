import { fetchHtml } from './fetcher';
import { parseSongPage } from './parser';
import { normalizeSong } from './normalizer';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'https://chords-scales.online';
const DATA_DIR = path.join(process.cwd(), 'data');

async function testExtraction(id: string) {
  console.log(`Fetching song ID: ${id}`);
  const html = await fetchHtml(`${BASE_URL}/chord_display.php?id=${id}`);
  
  const rawData = parseSongPage(html, id);
  console.log(`Title: ${rawData.title}`);
  console.log(`Composer: ${rawData.composer}`);
  console.log(`Key: ${rawData.key}`);
  console.log(`TimeSignature: ${rawData.timeSignature}`);
  console.log(`Transpose Options: ${rawData.transposeOptions.length}`);
  rawData.transposeOptions.forEach(o => console.log(`  ${o.value}: ${o.label}`));
  console.log(`Raw Notes Length: ${rawData.allNotes.length}`);
  
  const normalized = normalizeSong(rawData);
  
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const outFile = path.join(DATA_DIR, `song_${id}.json`);
  fs.writeFileSync(outFile, JSON.stringify(normalized, null, 2), 'utf-8');
  console.log(`Saved normalized data to ${outFile}`);
}

testExtraction('13').catch(console.error);

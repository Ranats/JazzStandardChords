/**
 * Batch extractor: Fetches ALL songs from chords-scales.online
 * and saves them as individual JSON files in data/
 * 
 * Usage: npx tsx src/lib/extractor/extract-all.ts
 */

import { fetchHtml } from './fetcher';
import { parseSongList, parseSongPage } from './parser';
import { normalizeSong } from './normalizer';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'https://chords-scales.online';
const DATA_DIR = path.join(process.cwd(), 'data');

// Delay between requests to avoid overloading the server
const DELAY_MS = 500;

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  // Ensure data directory exists
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // Step 1: Get the song list
  console.log('Fetching song list...');
  const listHtml = await fetchHtml(`${BASE_URL}/song-list.php`);
  const songList = parseSongList(listHtml);
  console.log(`Found ${songList.length} songs.`);

  // Save the song list index
  fs.writeFileSync(
    path.join(DATA_DIR, 'song-index.json'),
    JSON.stringify(songList, null, 2),
    'utf-8'
  );
  console.log('Saved song-index.json');

  // Step 2: Fetch each song
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < songList.length; i++) {
    const { id, title } = songList[i];
    const outFile = path.join(DATA_DIR, `song_${id}.json`);

    // Skip if already fetched
    if (fs.existsSync(outFile)) {
      console.log(`[${i + 1}/${songList.length}] Skip (cached): ${title}`);
      successCount++;
      continue;
    }

    try {
      console.log(`[${i + 1}/${songList.length}] Fetching: ${title} (id=${id})...`);
      const html = await fetchHtml(`${BASE_URL}/chord_display.php?id=${id}`);
      const raw = parseSongPage(html, id);
      const normalized = normalizeSong(raw);

      fs.writeFileSync(outFile, JSON.stringify(normalized, null, 2), 'utf-8');
      successCount++;
    } catch (e: any) {
      console.error(`  FAILED: ${e.message}`);
      failCount++;
    }

    // Be polite: wait between requests
    await sleep(DELAY_MS);
  }

  console.log(`\nDone! Success: ${successCount}, Failed: ${failCount}`);
}

main().catch(console.error);

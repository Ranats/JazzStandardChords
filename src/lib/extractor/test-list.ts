import { fetchHtml } from './fetcher';
import { parseSongList } from './parser';

const BASE_URL = 'https://chords-scales.online';

async function testList() {
  console.log(`Fetching song list...`);
  const html = await fetchHtml(`${BASE_URL}/song-list.php`);
  
  const list = parseSongList(html);
  console.log(`Extracted ${list.length} songs from the list.`);
  if (list.length > 0) {
    console.log(`First 5 songs:`, list.slice(0, 5));
  }
}

testList().catch(console.error);

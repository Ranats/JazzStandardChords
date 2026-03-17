import * as cheerio from 'cheerio';

export interface RawSongData {
  id: string;
  title: string;
  composer: string;
  key: string;
  allNotes: any[];
}

export function parseSongList(html: string): { id: string; title: string }[] {
  const $ = cheerio.load(html);
  const songs: { id: string; title: string }[] = [];

  // <a> tags containing "chord_display.php?id="
  $('a[href*="chord_display.php?id="]').each((_, element) => {
    const el = $(element);
    const href = el.attr('href') || '';
    const match = href.match(/id=(\d+)/);
    if (match) {
      const id = match[1];
      const title = el.text().trim();
      songs.push({ id, title });
    }
  });

  return songs;
}

export function parseSongPage(html: string, id: string): RawSongData {
  const $ = cheerio.load(html);
  
  // Extract Title: <h1>...</h1>
  const title = $('h1.title').text().trim();
  
  // Extract Composer and Original Key: <h2>Composer / <span>Key: <form><select>...
  // Getting Composer Text before the span
  const h2Node = $('h2.subtitle');
  const h2Text = h2Node.clone().children().remove().end().text().trim();
  const composerMatch = h2Text.match(/^(.*?)\s*\//);
  const composer = composerMatch ? composerMatch[1].trim() : '';

  // Getting Key from the selected option in the select box
  let originalKey = '';
  // Try to find selected option first
  const selectedOption = h2Node.find('select[name="transpose"] option[selected]');
  if (selectedOption.length > 0) {
    const text = selectedOption.text();
    // Usually looks like "Gm（原曲キー）"
    const keyMatch = text.match(/^([A-Z][a-z]?[#b]?m?)/);
    if (keyMatch) {
      originalKey = keyMatch[1];
    }
  } else {
    // fallback if no selected attribute
    const allOptions = h2Node.find('select[name="transpose"] option');
    allOptions.each((_, el) => {
      if ($(el).text().includes('原曲キー')) {
         const keyMatch = $(el).text().match(/^([A-Z][a-z]?[#b]?m?)/);
         if (keyMatch) originalKey = keyMatch[1];
      }
    });
  }

  // Extract allNotes JSON using Regex
  // The line usually looks like: const allNotes = [{"section":"A",...}];
  let allNotes: any[] = [];
  const regex = /const\s+allNotes\s*=\s*(\[.*\]);/;
  const match = html.match(regex);
  if (match && match[1]) {
    try {
      allNotes = JSON.parse(match[1]);
    } catch (e) {
      console.error(`Failed to parse allNotes JSON for id ${id}`);
    }
  }

  return {
    id,
    title,
    composer,
    key: originalKey,
    allNotes
  };
}

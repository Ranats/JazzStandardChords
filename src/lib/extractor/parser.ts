import * as cheerio from 'cheerio';

export interface TransposeOptionRaw {
  value: number;
  label: string;
}

export interface RawSongData {
  id: string;
  title: string;
  composer: string;
  key: string;
  timeSignature: string;
  transposeOptions: TransposeOptionRaw[];
  allNotes: any[];
}

export function parseSongList(html: string): { id: string; title: string }[] {
  const $ = cheerio.load(html);
  const songs: { id: string; title: string }[] = [];

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
  
  const title = $('h1.title').text().trim();
  
  const h2Node = $('h2.subtitle');
  const h2Text = h2Node.clone().children().remove().end().text().trim();
  const composerMatch = h2Text.match(/^(.*?)\s*\//);
  const composer = composerMatch ? composerMatch[1].trim() : '';

  // Extract transpose options from select
  let originalKey = '';
  const transposeOptions: TransposeOptionRaw[] = [];
  const allOptions = h2Node.find('select[name="transpose"] option');
  allOptions.each((_, el) => {
    const optEl = $(el);
    const val = parseInt(optEl.attr('value') || '0', 10);
    const label = optEl.text().trim();
    transposeOptions.push({ value: val, label });
    if (optEl.attr('selected') !== undefined || label.includes('原曲キー')) {
      const keyMatch = label.match(/^([A-G][a-z]?[#b]?m?)/);
      if (keyMatch) originalKey = keyMatch[1];
    }
  });

  // Extract time signature from ld+json
  let timeSignature = '4/4';
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const json = JSON.parse($(el).html() || '');
      if (json.tempo) {
        timeSignature = json.tempo;
      }
    } catch {}
  });

  // Extract allNotes JSON
  let allNotes: any[] = [];
  const regex = /const\s+allNotes\s*=\s*(\[.*?\]);/s;
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
    timeSignature,
    transposeOptions,
    allNotes
  };
}

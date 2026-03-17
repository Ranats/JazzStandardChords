import fs from 'fs';
import path from 'path';
import SongList from './SongList';
import { getJSBInfo, formatJSBLabel } from '@/lib/jsb-metadata';

interface SongEntry {
  id: string;
  title: string;
  jsb?: string; // e.g. "黒本1 p.20" or "黒本2"
  jsbBook?: number;
}

export default function Home() {
  const indexPath = path.join(process.cwd(), 'data', 'song-index.json');
  let rawSongs: { id: string; title: string }[] = [];
  
  if (fs.existsSync(indexPath)) {
    rawSongs = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
  }

  const EXCLUDE_TITLES = [
    "26-2", "500 Miles High", "502 Blues", "52nd Street Theme", "9.20 Special"
  ];

  // Enrich with JSB info and Filter
  const songs: SongEntry[] = rawSongs
    .filter(s => !EXCLUDE_TITLES.includes(s.title))
    .map(s => {
      const info = getJSBInfo(s.title);
      return {
        ...s,
        jsb: formatJSBLabel(info),
        jsbBook: info?.book
      };
    })
    .sort((a, b) => a.title.localeCompare(b.title));

  return <SongList songs={songs} />;
}

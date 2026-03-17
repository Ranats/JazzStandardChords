import React from 'react';
import fs from 'fs';
import path from 'path';
import { NormalizedSong } from '@/lib/extractor/normalizer';
import SongViewer from './SongViewer';

export default async function SongPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  
  const filePath = path.join(process.cwd(), 'data', `song_${id}.json`);
  
  if (!fs.existsSync(filePath)) {
      return (
        <main className="min-h-screen p-8 bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center text-center">
            <h1 className="text-3xl font-bold mb-4">Song Not Found</h1>
            <p className="text-zinc-500">Could not locate data for song ID: {id}</p>
        </main>
      );
  }
  
  const rawData = fs.readFileSync(filePath, 'utf-8');
  const song: NormalizedSong = JSON.parse(rawData);
  
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans">
      <SongViewer initialSong={song} />
    </main>
  );
}

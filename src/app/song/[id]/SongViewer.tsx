'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ChevronLeft, ZoomIn, ZoomOut, Settings2 } from 'lucide-react';
import { transposeSong } from '@/lib/transpose/transposer';
import ScoreBoard, { Density } from '@/components/ScoreBoard';
import { getJSBInfo, formatJSBLabel } from '@/lib/jsb-metadata';
import AmazonLinks from '@/components/AmazonLinks';
import ThemeToggle from '@/components/ThemeToggle';
import { NormalizedSong } from '@/lib/extractor/normalizer';

export default function SongViewer({ initialSong }: { initialSong: NormalizedSong }) {
  const [transposeStep, setTransposeStep] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(1.0);
  const [density, setDensity] = useState<Density>('standard');

  const song = useMemo(() => {
    return transposeSong(initialSong, transposeStep);
  }, [initialSong, transposeStep]);

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.1, 2.0));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.1, 0.5));

  const searchQuery = `${initialSong.title} backing track`;

  // Use the original site's transpose options if available
  const transposeOptions = initialSong.transposeOptions || [];

  return (
    <div className="w-full h-full flex flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-600 dark:text-zinc-400">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 leading-tight">
                  {song.title}
                </h1>
                {(() => {
                  const info = getJSBInfo(song.title);
                  if (!info) return null;
                  return (
                    <span className={`flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded border ${
                      info.book === 1 
                      ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800' 
                      : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    }`}>
                      {formatJSBLabel(info)}
                    </span>
                  );
                })()}
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {song.composer} • Key: <strong className="text-indigo-600 dark:text-indigo-400">{song.key}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Transpose Controls - Desktop */}
            <div className="hidden sm:flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800/50 rounded-lg p-1">
              <span className="text-xs font-medium px-2 text-zinc-500">Key</span>
              <select
                value={transposeStep}
                onChange={(e) => setTransposeStep(Number(e.target.value))}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded text-sm px-2 py-1 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {transposeOptions.length > 0 ? (
                  transposeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))
                ) : (
                  [...Array(25)].map((_, i) => {
                    const val = i - 12;
                    return (
                      <option key={val} value={val}>
                        {val > 0 ? `+${val}` : val === 0 ? 'Original' : val}
                      </option>
                    );
                  })
                )}
              </select>
            </div>
            {/* Theme toggle — inline in header to avoid overlap */}
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile secondary toolbar */}
        <div className="sm:hidden border-t border-zinc-200 dark:border-zinc-800 px-4 py-2 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Key</span>
            <select
              value={transposeStep}
              onChange={(e) => setTransposeStep(Number(e.target.value))}
              className="bg-white dark:bg-zinc-800 border-none rounded shadow-sm text-sm px-2 py-1 outline-none font-medium"
            >
              {transposeOptions.length > 0 ? (
                transposeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))
              ) : (
                [...Array(25)].map((_, i) => {
                  const val = i - 12;
                  return (
                    <option key={val} value={val}>
                      {val > 0 ? `+${val}` : val === 0 ? 'Orig' : val}
                    </option>
                  );
                })
              )}
            </select>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={handleZoomOut} className="p-1.5 rounded bg-white dark:bg-zinc-800 shadow-sm disabled:opacity-50">
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono w-10 text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={handleZoomIn} className="p-1.5 rounded bg-white dark:bg-zinc-800 shadow-sm">
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>
      
      {/* Desktop Toolbar */}
      <div className="hidden sm:flex max-w-7xl mx-auto w-full px-6 py-4 items-center justify-between">
         <div className="flex items-center gap-4">
           <div className="flex items-center rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm p-1">
             <button onClick={handleZoomOut} className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700">
               <ZoomOut className="w-4 h-4" />
             </button>
             <span className="text-sm font-mono w-12 text-center">{Math.round(zoom * 100)}%</span>
             <button onClick={handleZoomIn} className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700">
               <ZoomIn className="w-4 h-4" />
             </button>
           </div>
           
           <div className="flex items-center gap-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm rounded-lg p-1">
              <Settings2 className="w-4 h-4 text-zinc-400 ml-2" />
              <select 
                value={density} 
                onChange={e => setDensity(e.target.value as Density)}
                className="bg-transparent text-sm p-1 outline-none"
              >
                <option value="compact">Compact</option>
                <option value="standard">Standard</option>
                <option value="large">Large</option>
              </select>
           </div>
         </div>
      </div>

      {/* Score Area */}
      <div className="flex-1 overflow-y-auto mb-10 sm:max-w-7xl sm:mx-auto w-full sm:px-6">
        <div className="bg-white dark:bg-zinc-900 sm:rounded-2xl sm:border border-zinc-200 dark:border-zinc-800 shadow-sm p-2 sm:p-6 min-h-[500px] mb-6">
          <ScoreBoard song={song} density={density} zoom={zoom} />
        </div>

        {/* Backing Track Section (YouTube Search Embed) */}
        <div className="bg-white dark:bg-zinc-900 sm:rounded-2xl sm:border border-zinc-200 dark:border-zinc-800 shadow-sm p-4 sm:p-6">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            Backing Track (再生機能)
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
            YouTube上のバッキングトラックを検索・再生します。譜面を見ながら練習にお役立てください。
          </p>
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 shadow-inner group">
              <iframe
                src={`https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(searchQuery)}&autoplay=0`}
                className="absolute inset-0 w-full h-full border-0 transition-opacity group-hover:opacity-90 grayscale-[20%] group-hover:grayscale-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                 <p className="text-white text-xs font-medium bg-black/60 px-3 py-1.5 rounded-full">埋め込み再生不可の場合は下記ボタンをお試しください</p>
              </div>
            </div>
          
          <div className="mt-4 flex justify-center">
            <a 
              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${song.title} backing track`)}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FF0000] hover:bg-[#CC0000] text-white font-bold transition-all shadow-lg active:scale-95 text-sm"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 4-8 4z"/></svg>
              YouTube Appで検索結果を開く
            </a>
          </div>
        </div>

        <div className="mt-8 mb-12">
          <AmazonLinks />
        </div>
      </div>
    </div>
  );
}

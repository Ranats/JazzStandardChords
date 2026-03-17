'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Music, Search, PenLine } from 'lucide-react';
import AmazonLinks from '@/components/AmazonLinks';
import ThemeToggle from '@/components/ThemeToggle';

interface SongEntry {
  id: string;
  title: string;
  jsb?: string;
  jsbBook?: number;
}

const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function SongList({ songs }: { songs: SongEntry[] }) {
  const [search, setSearch] = useState('');
  const [alphaFilter, setAlphaFilter] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = songs;
    if (alphaFilter) {
      list = list.filter(s => s.title.toUpperCase().startsWith(alphaFilter));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(s => s.title.toLowerCase().includes(q));
    }
    return list;
  }, [songs, alphaFilter, search]);

  // What letters actually have songs?
  const availableLetters = useMemo(() => {
    const set = new Set<string>();
    songs.forEach(s => {
      const first = s.title.charAt(0).toUpperCase();
      if (/[A-Z]/.test(first)) set.add(first);
    });
    return set;
  }, [songs]);

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 sm:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Top bar with theme toggle */}
        <div className="flex justify-end mb-4">
          <ThemeToggle />
        </div>
        <header className="mb-10 text-center">
          <div className="inline-flex items-center justify-center p-3 mb-4 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
            <Music className="w-8 h-8" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Jazz Standard Chords
          </h1>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            スマホで読めるジャズ譜面アプリ — {songs.length}曲収録
          </p>
        </header>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
              type="text"
              placeholder="曲名を検索..."
              value={search}
              onChange={e => { setSearch(e.target.value); setAlphaFilter(null); }}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm text-base"
            />
          </div>
          
          <Link 
            href="/editor"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-lg shadow-indigo-200 dark:shadow-none active:scale-95 whitespace-nowrap text-sm sm:text-base"
          >
            <PenLine className="w-5 h-5" />
            オリジナル譜面を作成
          </Link>
        </div>

        {/* Alphabet Filter */}
        <div className="flex flex-wrap gap-1 mb-6 justify-center">
          <button
            onClick={() => setAlphaFilter(null)}
            className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors ${
              !alphaFilter
                ? 'bg-indigo-600 text-white'
                : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-700'
            }`}
          >
            ALL
          </button>
          {ALPHA.map(letter => {
            const hasItems = availableLetters.has(letter);
            return (
              <button
                key={letter}
                disabled={!hasItems}
                onClick={() => setAlphaFilter(letter === alphaFilter ? null : letter)}
                className={`px-2 py-1 text-xs font-bold rounded-md transition-colors ${
                  alphaFilter === letter
                    ? 'bg-indigo-600 text-white'
                    : hasItems
                      ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-700'
                      : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-300 dark:text-zinc-700 cursor-not-allowed'
                }`}
              >
                {letter}
              </button>
            );
          })}
        </div>

        {/* Song List */}
        <section className="bg-white dark:bg-zinc-900/50 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-4 sm:p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {alphaFilter ? `"${alphaFilter}" から始まる曲` : 'Song Library'}
            </h2>
            <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              {filtered.length} / {songs.length} 曲
            </div>
          </div>
          
          {filtered.length === 0 ? (
            <p className="text-sm text-zinc-400 py-8 text-center">該当する曲はありません</p>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {filtered.map((song) => (
                <li key={song.id}>
                  <Link 
                    href={`/song/${song.id}`}
                    className="group flex items-center p-3 sm:p-4 rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/20 hover:bg-zinc-100 hover:dark:bg-zinc-800 transition-all active:scale-[0.98]"
                  >
                    <span className="w-8 flex-shrink-0 text-xs font-medium text-zinc-400">{song.id.padStart(3, '0')}</span>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-zinc-900 dark:text-zinc-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors text-sm sm:text-base">
                        {song.title}
                      </span>
                    </div>
                    {song.jsb && (
                      <span className={`ml-2 flex-shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded whitespace-nowrap ${
                        song.jsbBook === 1 
                        ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800' 
                        : 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      }`}>
                        {song.jsb}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <AmazonLinks />

        {/* Footer */}
        <footer className="mt-16 pb-12 border-t border-zinc-200 dark:border-zinc-800 pt-8 text-center text-xs text-zinc-500 space-y-4">
          <div className="flex justify-center gap-4">
            <Link href="/terms" className="hover:text-indigo-600 transition-colors">利用規約</Link>
            <Link href="/privacy" className="hover:text-indigo-600 transition-colors">プライバシーポリシー</Link>
          </div>
          <p>© 2026 Jazz Standard Chords. Created for educational purposes.</p>
        </footer>
      </div>
    </main>
  );
}

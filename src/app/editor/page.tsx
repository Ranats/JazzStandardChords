'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, Plus, Trash2, Download, Save, Eye, Printer } from 'lucide-react';
import ScoreBoard from '@/components/ScoreBoard';
import { getTones } from '@/lib/chord-utils';
import { NormalizedSong } from '@/lib/extractor/normalizer';

interface MeasureData {
  number: number;
  chords: string[]; // typically 1 or 2 chords per measure
  volta?: string; // "1" or "2"
  repeatStart?: boolean;
  repeatEnd?: boolean;
}

export default function ScoreEditor() {
  const [isMounted, setIsMounted] = useState(false);
  const [title, setTitle] = useState('New Song');
  const [measures, setMeasures] = useState<MeasureData[]>([
    { number: 1, chords: ['Cmaj7'] },
    { number: 2, chords: ['A7'] },
    { number: 3, chords: ['Dm7'] },
    { number: 4, chords: ['G7'] },
  ]);
  const [key, setKey] = useState('C');
  const [composer, setComposer] = useState('Unknown');
  const [isFullPreview, setIsFullPreview] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem('jazz-editor-draft');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.measures) setMeasures(data.measures);
        if (data.title) setTitle(data.title);
        if (data.key) setKey(data.key);
        if (data.composer) setComposer(data.composer);
      } catch {
        console.error('Failed to load draft');
      }
    }
  }, []);

  // Auto-save to localStorage
  useEffect(() => {
    localStorage.setItem('jazz-editor-draft', JSON.stringify({ title, measures, key, composer }));
  }, [title, measures, key, composer]);

  const addMeasure = () => {
    const nextNum = measures.length + 1;
    setMeasures([...measures, { number: nextNum, chords: [''] }]);
  };

  const removeMeasure = (index: number) => {
    const newMeasures = measures.filter((_, i) => i !== index)
      .map((m, i) => ({ ...m, number: i + 1 }));
    setMeasures(newMeasures);
  };

  const updateChord = (mIdx: number, cIdx: number, val: string) => {
    const newMeasures = [...measures];
    newMeasures[mIdx].chords[cIdx] = val;
    setMeasures(newMeasures);
  };

  const addChordToMeasure = (mIdx: number) => {
    const newMeasures = [...measures];
    if (newMeasures[mIdx].chords.length < 4) {
      newMeasures[mIdx].chords.push('');
      setMeasures(newMeasures);
    }
  };

  const removeChordFromMeasure = (mIdx: number, cIdx: number) => {
    const newMeasures = [...measures];
    newMeasures[mIdx].chords = newMeasures[mIdx].chords.filter((_, i) => i !== cIdx);
    if (newMeasures[mIdx].chords.length === 0) newMeasures[mIdx].chords = [''];
    setMeasures(newMeasures);
  };

  const toggleVolta = (idx: number, val: string) => {
    const newMeasures = [...measures];
    newMeasures[idx].volta = newMeasures[idx].volta === val ? undefined : val;
    setMeasures(newMeasures);
  };

  const toggleRepeatStart = (idx: number) => {
    const newMeasures = [...measures];
    newMeasures[idx].repeatStart = !newMeasures[idx].repeatStart;
    setMeasures(newMeasures);
  };

  const toggleRepeatEnd = (idx: number) => {
    const newMeasures = [...measures];
    newMeasures[idx].repeatEnd = !newMeasures[idx].repeatEnd;
    setMeasures(newMeasures);
  };

  const downloadJson = () => {
    const data = { title, composer, key, measures };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Convert editor state to NormalizedSong for ScoreBoard
  const songPreview: NormalizedSong = {
    id: 'preview',
    title,
    composer,
    key,
    timeSignature: '4/4',
    sections: [
      {
        label: null,
        measures: measures.map(m => ({
          ...m,
          chords: m.chords.map(c => ({
            symbol: c,
            beats: m.chords.length === 1 ? 4 : (m.chords.length === 2 ? 2 : 1),
            tones: getTones(c)
          })),
          barlineBegin: m.repeatStart ? 'REPEAT_BEGIN' : 'SINGLE',
          barlineEnd: m.repeatEnd ? 'REPEAT_END' : 'SINGLE',
        }))
      }
    ]
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 sm:p-8 font-sans pb-32">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link 
              href="/"
              className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Score Editor</h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">オリジナル譜面の作成・保存</p>
            </div>
          </div>
          
          <div className="flex gap-2 print:hidden">
            <button 
              onClick={downloadJson}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all shadow-sm"
            >
              <Download className="w-4 h-4" />
              JSON出力
            </button>
          </div>
        </header>

        {/* CSS for PDF Printing */}
        <style jsx global>{`
          @media print {
            .print\\:hidden { display: none !important; }
            body { background: white !important; }
            .score-print-only { display: block !important; margin: 0 auto; width: 100% !important; }
            .max-w-6xl { max-width: 100% !important; padding: 0 !important; }
            .lg\\:grid-cols-3 { grid-template-columns: 1fr !important; }
            .shadow-sm, .shadow-2xl { shadow: none !important; border: none !important; }
          }
        `}</style>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
          {/* 1. Basic Info (Mobile: 1st, PC: Left Top) */}
          <section className="lg:col-span-1 bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm order-1">
            <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4">基本情報</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1">曲名</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1">Key</label>
                  <input 
                    type="text" 
                    value={key} 
                    onChange={e => setKey(e.target.value)}
                    placeholder="C, Eb, F..."
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 mb-1">作曲者</label>
                  <input 
                    type="text" 
                    value={composer} 
                    onChange={e => setComposer(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* 2. Preview Panel (Mobile: 2nd, PC: Right Side) */}
          <div className={`${isFullPreview ? 'lg:col-span-3' : 'lg:col-span-2 lg:row-span-2'} space-y-6 transition-all duration-300 order-2`}>
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm h-auto score-print-only relative group min-h-[400px]">
              <div className="flex items-center justify-between mb-8 print:hidden">
                <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Preview</h2>
                <div className="flex gap-2">
                   <button 
                      onClick={() => setIsFullPreview(!isFullPreview)}
                      className="flex items-center gap-1 px-3 py-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full text-[10px] font-bold text-zinc-600 dark:text-zinc-400 transition-colors uppercase"
                    >
                      <Eye className="w-3 h-3" />
                      {isFullPreview ? 'エディタを表示' : '全画面表示'}
                    </button>
                   <div className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-[10px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-tighter">Live</div>
                </div>
              </div>
              
              <div className="text-center mb-10">
                <h3 className="text-3xl font-black text-zinc-900 dark:text-zinc-100 mb-1">{title}</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{composer} • Key: {key}</p>
              </div>

              <div className="w-full">
                <ScoreBoard 
                  song={songPreview}
                  zoom={1.1} 
                  density="standard"
                />
              </div>
            </div>
            
            <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl p-4 text-xs text-indigo-600/80 dark:text-indigo-400/80 print:hidden text-center">
              <p>💡 ヒント: 1小節に多くのコードを入れる場合は、ズームを下げると配置が安定します。保存はブラウザのLocalStorageに自動で行われます。</p>
            </div>
          </div>

          {/* 3. Measure List (Mobile: 3rd, PC: Left Bottom) */}
          <section className="lg:col-span-1 bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm max-h-[60vh] overflow-y-auto order-3 print:hidden">
            <div className="flex items-center justify-between mb-4 sticky top-0 bg-white dark:bg-zinc-900 pb-2 z-10">
              <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider">小節リスト</h2>
              <button 
                onClick={addMeasure}
                className="p-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              {measures.map((m, mIdx) => (
                <div key={mIdx} className="p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black text-zinc-300 dark:text-zinc-700">M.{m.number}</span>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => toggleRepeatStart(mIdx)}
                        className={`text-[10px] px-1.5 py-0.5 rounded border ${m.repeatStart ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 border-indigo-200' : 'text-zinc-400 border-zinc-200 dark:border-zinc-800'}`}
                      >
                        ||:
                      </button>
                      <button 
                        onClick={() => toggleRepeatEnd(mIdx)}
                        className={`text-[10px] px-1.5 py-0.5 rounded border ${m.repeatEnd ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 border-indigo-200' : 'text-zinc-400 border-zinc-200 dark:border-zinc-800'}`}
                      >
                        :||
                      </button>
                      <button 
                        onClick={() => toggleVolta(mIdx, '1')}
                        className={`text-[10px] px-1.5 py-0.5 rounded border ${m.volta === '1' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 border-amber-200' : 'text-zinc-400 border-zinc-200 dark:border-zinc-800'}`}
                      >
                        1.
                      </button>
                      <button 
                        onClick={() => toggleVolta(mIdx, '2')}
                        className={`text-[10px] px-1.5 py-0.5 rounded border ${m.volta === '2' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 border-amber-200' : 'text-zinc-400 border-zinc-200 dark:border-zinc-800'}`}
                      >
                        2.
                      </button>
                      <button 
                        onClick={() => removeMeasure(mIdx)}
                        className="p-1 text-zinc-300 hover:text-red-500 transition-colors ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {m.chords.map((chord, cIdx) => (
                      <div key={cIdx} className="relative group">
                        <input 
                          type="text" 
                          value={chord} 
                          placeholder="Chord..."
                          onChange={e => updateChord(mIdx, cIdx, e.target.value)}
                          className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        {m.chords.length > 1 && (
                          <button 
                            onClick={() => removeChordFromMeasure(mIdx, cIdx)}
                            className="absolute -right-1 -top-1 w-4 h-4 bg-zinc-200 dark:bg-zinc-800 rounded-full text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                    {m.chords.length < 4 && (
                      <button 
                        onClick={() => addChordToMeasure(mIdx)}
                        className="flex items-center justify-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg py-1 hover:bg-zinc-100 transition-colors"
                      >
                        <Plus className="w-3 h-3 text-zinc-400" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
      
      {/* Floating Action Bar */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-lg bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl shadow-2xl p-4 flex items-center justify-between z-50 print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
            <Save className="w-5 h-5" />
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-tight">Draft Saved</p>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-tight">LocalStorage auto-save active</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-6 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold transition-all shadow-lg active:scale-95 text-sm"
          >
            <Printer className="w-4 h-4" />
            PDF印刷
          </button>
        </div>
      </div>
    </div>
  );
}

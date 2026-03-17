'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

// Hook to access + control theme
export function useTheme() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark') {
      document.documentElement.classList.add('dark');
      setDark(true);
    } else if (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
      setDark(true);
    }
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return { dark, toggle };
}

// Inline button — use inside a flex header row
export default function ThemeToggle({ className = '' }: { className?: string }) {
  const { dark, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      aria-label="テーマ切替"
      className={`p-2 rounded-full bg-white/80 dark:bg-zinc-800/80 backdrop-blur border border-zinc-200 dark:border-zinc-700 shadow-sm hover:scale-105 active:scale-95 transition-all ${className}`}
    >
      {dark ? (
        <Sun className="w-5 h-5 text-amber-400" />
      ) : (
        <Moon className="w-5 h-5 text-zinc-500" />
      )}
    </button>
  );
}

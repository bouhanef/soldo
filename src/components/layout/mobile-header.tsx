'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export function MobileHeader() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
  }, []);

  function toggleTheme() {
    const next = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', next ? 'dark' : 'light');
    setDark(next);
  }

  return (
    <header className="md:hidden sticky top-0 z-20 flex h-12 items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4">
      <span className="text-sm font-semibold tracking-tight">Soldo</span>
      <button
        onClick={toggleTheme}
        aria-label="Toggle theme"
        className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors duration-150"
      >
        {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>
    </header>
  );
}

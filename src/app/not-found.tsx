import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 text-center">
      <p className="text-xs font-mono text-zinc-400">404</p>
      <p className="text-sm font-medium">Page not found</p>
      <Link
        href="/"
        className="text-sm text-zinc-500 underline underline-offset-4 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
      >
        Go home
      </Link>
    </div>
  );
}

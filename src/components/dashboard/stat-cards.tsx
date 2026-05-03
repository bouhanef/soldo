'use client';

import { Skeleton } from '@/components/ui/skeleton';
import type { Stats } from '@/types';

const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' });

interface Props {
  stats: Stats | null;
  loading: boolean;
}

interface CardProps {
  label: string;
  value: React.ReactNode;
  sub?: string;
}

function Card({ label, value, sub }: CardProps) {
  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-5 py-4 space-y-1">
      <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
      {sub && <p className="text-xs text-zinc-400">{sub}</p>}
    </div>
  );
}

export function StatCards({ stats, loading }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const activeMonths = stats.monthlyTotals.filter((m) => m.total > 0).length;
  const avgPerMonth = activeMonths > 0 ? stats.totalYear / activeMonths : 0;
  const topCategory = stats.byCategory[0] ?? null;

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <Card
        label="Total spent"
        value={fmt.format(stats.totalYear)}
        sub={`${stats.year}`}
      />
      <Card
        label="Monthly avg"
        value={fmt.format(avgPerMonth)}
        sub={activeMonths > 0 ? `over ${activeMonths} active month${activeMonths > 1 ? 's' : ''}` : 'no data'}
      />
      <Card
        label="Entries"
        value={stats.count.toLocaleString('en-US')}
        sub="expenses logged"
      />
      <Card
        label="Top category"
        value={
          topCategory ? (
            <span className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: topCategory.color }}
              />
              {topCategory.name}
            </span>
          ) : (
            '—'
          )
        }
        sub={topCategory ? fmt.format(topCategory.total) : undefined}
      />
    </div>
  );
}

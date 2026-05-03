'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import type { CategoryStat } from '@/types';

const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' });
const pct = (value: number, total: number) =>
  total > 0 ? `${Math.round((value / total) * 100)}%` : '0%';

interface Props {
  data: CategoryStat[];
  loading: boolean;
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number; payload: CategoryStat }[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 shadow-md text-sm">
      <p className="text-zinc-400 mb-0.5">{d.name}</p>
      <p className="font-semibold tabular-nums">{fmt.format(d.value)}</p>
    </div>
  );
}

export function CategoryDonutChart({ data, loading }: Props) {
  if (loading) return <Skeleton className="h-72 w-full rounded-lg" />;

  const total = data.reduce((s, d) => s + d.total, 0);

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 flex items-center justify-center h-72">
        <p className="text-sm text-zinc-400">No data for this period</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
      <p className="text-sm font-medium text-zinc-500 mb-4">By category</p>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius="52%"
            outerRadius="80%"
            dataKey="total"
            nameKey="name"
            paddingAngle={2}
            strokeWidth={0}
          >
            {data.map((entry) => (
              <Cell key={entry.categoryId} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="mt-3 space-y-1.5">
        {data.map((d) => (
          <div key={d.categoryId} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
              <span className="truncate text-zinc-600 dark:text-zinc-300">{d.name}</span>
            </span>
            <span className="tabular-nums text-zinc-400 shrink-0 text-xs">
              {pct(d.total, total)} · {fmt.format(d.total)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

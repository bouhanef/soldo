'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import type { MonthlyTotal } from '@/types';

const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface Props {
  data: MonthlyTotal[];
  loading: boolean;
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 shadow-md text-sm">
      <p className="text-zinc-400 mb-0.5">{label}</p>
      <p className="font-semibold tabular-nums">{fmt.format(payload[0].value)}</p>
    </div>
  );
}

export function MonthlyBarChart({ data, loading }: Props) {
  if (loading) return <Skeleton className="h-56 w-full rounded-lg" />;

  const chartData = data.map((d, i) => ({
    label: MONTH_LABELS[i],
    total: d.total,
  }));

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
      <p className="text-sm font-medium text-zinc-500 mb-4">Monthly spending</p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }} barCategoryGap="35%">
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-zinc-100 dark:text-zinc-800" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: 'currentColor' }}
            className="text-zinc-400"
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: 'currentColor' }}
            className="text-zinc-400"
            tickFormatter={(v) => `€${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'currentColor', className: 'text-zinc-50 dark:text-zinc-800' }} />
          <Bar dataKey="total" fill="currentColor" className="text-zinc-900 dark:text-zinc-100" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

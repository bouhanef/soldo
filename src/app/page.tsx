'use client';

import { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import { StatCards } from '@/components/dashboard/stat-cards';
import { MonthlyBarChart } from '@/components/dashboard/monthly-bar-chart';
import { CategoryDonutChart } from '@/components/dashboard/category-donut-chart';
import type { Stats } from '@/types';

function yearOptions() {
  const current = new Date().getFullYear();
  return Array.from({ length: 5 }, (_, i) => current - i);
}

export default function DashboardPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setStats(null);
    fetch(`/api/stats?year=${year}`)
      .then((r) => r.json())
      .then((json) => {
        setStats(json.data ?? null);
        setLoading(false);
      });
  }, [year]);

  const years = yearOptions();

  return (
    <div className="px-4 py-8 max-w-5xl mx-auto space-y-6 sm:px-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <Select
          value={String(year)}
          onValueChange={(v) => { if (v) setYear(Number(v)); }}
        >
          <SelectTrigger className="w-28">
            <span>{year}</span>
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stat cards */}
      <StatCards stats={stats} loading={loading} />

      {/* Monthly bar chart */}
      <MonthlyBarChart
        data={stats?.monthlyTotals ?? []}
        loading={loading}
      />

      {/* Category breakdown */}
      <CategoryDonutChart
        data={stats?.byCategory ?? []}
        loading={loading}
      />
    </div>
  );
}

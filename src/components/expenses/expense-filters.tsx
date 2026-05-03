'use client';

import { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Category, Source } from '@/types';

export interface Filters {
  month: string;
  categoryId: string;
  sourceId: string;
}

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

function monthOptions() {
  const options: { value: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    options.push({ value, label });
  }
  return options;
}

export function ExpenseFilters({ filters, onChange }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [sources, setSources] = useState<Source[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then((r) => r.json()),
      fetch('/api/sources').then((r) => r.json()),
    ]).then(([cats, srcs]) => {
      setCategories((cats.data ?? []).filter((c: Category) => c.isActive));
      setSources((srcs.data ?? []).filter((s: Source) => s.isActive));
    });
  }, []);

  const months = monthOptions();

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <Select
        value={filters.month}
        onValueChange={(v) => onChange({ ...filters, month: v })}
      >
        <SelectTrigger>
          <SelectValue placeholder="All months" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All months</SelectItem>
          {months.map((m) => (
            <SelectItem key={m.value} value={m.value}>
              {m.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.categoryId}
        onValueChange={(v) => onChange({ ...filters, categoryId: v })}
      >
        <SelectTrigger>
          <SelectValue placeholder="All categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All categories</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat._id} value={cat._id}>
              <span className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                {cat.name}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.sourceId}
        onValueChange={(v) => onChange({ ...filters, sourceId: v })}
      >
        <SelectTrigger>
          <SelectValue placeholder="All sources" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All sources</SelectItem>
          {sources.map((src) => (
            <SelectItem key={src._id} value={src._id}>
              {src.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

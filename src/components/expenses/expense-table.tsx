'use client';

import { useState } from 'react';
import { Pencil, Trash2, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ExpenseForm } from './expense-form';
import { cn } from '@/lib/utils';
import type { Expense, Sort, SortBy } from '@/types';

const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' });

interface Props {
  expenses: Expense[];
  loading: boolean;
  onRefresh: () => void;
  sort: Sort;
  onSort: (by: SortBy) => void;
}

function SortIcon({ active, dir }: { active: boolean; dir: Sort['dir'] }) {
  if (!active) return <ArrowUpDown className="w-3 h-3 shrink-0 opacity-30" />;
  return dir === 'asc'
    ? <ArrowUp className="w-3 h-3 shrink-0" />
    : <ArrowDown className="w-3 h-3 shrink-0" />;
}

function SortableHeader({
  label, column, sort, onSort, className,
}: {
  label: string;
  column: SortBy;
  sort: Sort;
  onSort: (by: SortBy) => void;
  className?: string;
}) {
  const active = sort.by === column;
  return (
    <th
      onClick={() => onSort(column)}
      className={cn(
        'px-4 py-3 font-medium text-zinc-500 cursor-pointer select-none group',
        className
      )}
    >
      <span className={cn('inline-flex items-center gap-1.5 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors', active && 'text-zinc-800 dark:text-zinc-200')}>
        {label}
        <SortIcon active={active} dir={sort.dir} />
      </span>
    </th>
  );
}

export function ExpenseTable({ expenses, loading, onRefresh, sort, onSort }: Props) {
  const [editTarget, setEditTarget] = useState<Expense | null>(null);

  async function handleDelete(expense: Expense) {
    const res = await fetch(`/api/expenses/${expense._id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Expense deleted');
      onRefresh();
    } else {
      toast.error('Failed to delete expense');
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="py-16 text-center text-sm text-zinc-400">
        No expenses found. Add your first one.
      </div>
    );
  }

  return (
    <>
      {/* Mobile: sort bar + card list */}
      <div className="md:hidden space-y-3">
        <div className="flex items-center gap-1 text-xs text-zinc-400">
          <span className="mr-1">Sort:</span>
          {(['date', 'amount'] as SortBy[]).map((col) => {
            const active = sort.by === col;
            return (
              <button
                key={col}
                onClick={() => onSort(col)}
                className={cn(
                  'inline-flex items-center gap-1 px-2.5 py-1 rounded-md border transition-colors duration-150 capitalize',
                  active
                    ? 'border-zinc-300 dark:border-zinc-600 text-zinc-800 dark:text-zinc-100 bg-zinc-50 dark:bg-zinc-800'
                    : 'border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
                )}
              >
                {col}
                {active && (
                  sort.dir === 'asc'
                    ? <ArrowUp className="w-3 h-3" />
                    : <ArrowDown className="w-3 h-3" />
                )}
              </button>
            );
          })}
        </div>

        <div className="divide-y divide-zinc-100 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-lg">
          {expenses.map((expense) => (
            <div key={expense._id} className="flex items-start justify-between px-4 py-3 gap-3">
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: expense.categoryId.color }}
                  />
                  <span className="text-sm font-medium truncate">{expense.categoryId.name}</span>
                </div>
                <div className="text-xs text-zinc-400 flex items-center gap-2">
                  <span>{new Date(expense.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <span>·</span>
                  <span>{expense.sourceId.name}</span>
                </div>
                {expense.comment && (
                  <p className="text-xs text-zinc-400 truncate">{expense.comment}</p>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-sm font-mono font-medium tabular-nums">
                  {fmt.format(expense.amount)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setEditTarget(expense)}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-zinc-400 hover:text-red-500"
                  onClick={() => handleDelete(expense)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop: table with sortable headers */}
      <div className="hidden md:block border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
              <SortableHeader label="Date" column="date" sort={sort} onSort={onSort} className="text-left" />
              <th className="px-4 py-3 text-left font-medium text-zinc-500">Category</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-500">Source</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-500">Comment</th>
              <SortableHeader label="Amount" column="amount" sort={sort} onSort={onSort} className="text-right" />
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {expenses.map((expense) => (
              <tr key={expense._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors duration-150">
                <td className="px-4 py-3 text-zinc-500 whitespace-nowrap">
                  {new Date(expense.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: expense.categoryId.color }}
                    />
                    {expense.categoryId.name}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-500">{expense.sourceId.name}</td>
                <td className="px-4 py-3 text-zinc-400 max-w-xs truncate">{expense.comment ?? '—'}</td>
                <td className="px-4 py-3 text-right font-mono font-medium tabular-nums">
                  {fmt.format(expense.amount)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setEditTarget(expense)}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-zinc-400 hover:text-red-500"
                      onClick={() => handleDelete(expense)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit sheet */}
      <Sheet open={!!editTarget} onOpenChange={(o) => !o && setEditTarget(null)}>
        <SheetContent side="bottom" className="rounded-t-2xl sm:side-right max-h-[90dvh] overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>Edit expense</SheetTitle>
          </SheetHeader>
          {editTarget && (
            <div className="px-4 pb-4">
              <ExpenseForm
                expense={editTarget}
                onSaved={() => { setEditTarget(null); onRefresh(); }}
                onCancel={() => setEditTarget(null)}
              />
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

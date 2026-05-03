'use client';

import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
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
import type { Expense } from '@/types';

const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' });

interface Props {
  expenses: Expense[];
  loading: boolean;
  onRefresh: () => void;
}

export function ExpenseTable({ expenses, loading, onRefresh }: Props) {
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
      {/* Mobile: card list */}
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-lg md:hidden">
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

      {/* Desktop: table */}
      <div className="hidden md:block border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
              <th className="px-4 py-3 text-left font-medium text-zinc-500">Date</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-500">Category</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-500">Source</th>
              <th className="px-4 py-3 text-left font-medium text-zinc-500">Comment</th>
              <th className="px-4 py-3 text-right font-medium text-zinc-500">Amount</th>
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

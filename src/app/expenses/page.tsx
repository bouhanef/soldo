'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ExpenseFilters, type Filters } from '@/components/expenses/expense-filters';
import { ExpenseTable } from '@/components/expenses/expense-table';
import { ExpenseForm } from '@/components/expenses/expense-form';
import type { Expense } from '@/types';

const currentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export default function ExpensesPage() {
  const [filters, setFilters] = useState<Filters>({
    month: currentMonth(),
    categoryId: 'all',
    sourceId: 'all',
  });
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.month !== 'all') params.set('month', filters.month);
    if (filters.categoryId !== 'all') params.set('categoryId', filters.categoryId);
    if (filters.sourceId !== 'all') params.set('sourceId', filters.sourceId);
    params.set('limit', '100');

    const res = await fetch(`/api/expenses?${params}`);
    const json = await res.json();
    setExpenses(json.data ?? []);
    setTotal(json.total ?? 0);
    setLoading(false);
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  function handleExport() {
    const params = new URLSearchParams();
    if (filters.month !== 'all') params.set('month', filters.month);
    if (filters.categoryId !== 'all') params.set('categoryId', filters.categoryId);
    if (filters.sourceId !== 'all') params.set('sourceId', filters.sourceId);
    window.location.href = `/api/expenses/export?${params}`;
  }

  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' });

  return (
    <div className="px-4 py-8 max-w-5xl mx-auto space-y-6 sm:px-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Expenses</h1>
          {!loading && (
            <p className="text-sm text-zinc-500 mt-1">
              {total} {total === 1 ? 'entry' : 'entries'} · {fmt.format(totalAmount)}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 sm:mr-1.5" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Sheet open={addOpen} onOpenChange={setAddOpen}>
            <SheetTrigger render={<Button size="sm" />}>
              <Plus className="w-4 h-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Add expense</span>
            </SheetTrigger>
            <SheetContent side="bottom" className="rounded-t-2xl max-h-[90dvh] overflow-y-auto">
              <SheetHeader className="mb-4">
                <SheetTitle>Add expense</SheetTitle>
              </SheetHeader>
              <div className="px-4 pb-4">
                <ExpenseForm
                  onSaved={() => { setAddOpen(false); load(); }}
                  onCancel={() => setAddOpen(false)}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Filters */}
      <ExpenseFilters filters={filters} onChange={setFilters} />

      {/* List */}
      <ExpenseTable expenses={expenses} loading={loading} onRefresh={load} />
    </div>
  );
}

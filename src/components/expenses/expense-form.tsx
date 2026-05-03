'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Category, Source, Expense } from '@/types';

interface Props {
  expense?: Expense;
  onSaved: () => void;
  onCancel?: () => void;
}

export function ExpenseForm({ expense, onSaved, onCancel }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [sources, setSources] = useState<Source[]>([]);

  const [date, setDate] = useState<Date | undefined>(
    expense ? new Date(expense.date) : new Date()
  );
  const [calOpen, setCalOpen] = useState(false);
  const [categoryId, setCategoryId] = useState(expense?.categoryId._id ?? '');
  const [sourceId, setSourceId] = useState(expense?.sourceId._id ?? '');
  const [amount, setAmount] = useState(expense ? String(expense.amount) : '');
  const [comment, setComment] = useState(expense?.comment ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then((r) => r.json()),
      fetch('/api/sources').then((r) => r.json()),
    ]).then(([cats, srcs]) => {
      setCategories((cats.data ?? []).filter((c: Category) => c.isActive));
      setSources((srcs.data ?? []).filter((s: Source) => s.isActive));
    });
  }, []);

  async function handleSubmit() {
    if (!date || !categoryId || !sourceId || !amount) {
      toast.error('Please fill in all required fields');
      return;
    }
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) {
      toast.error('Amount must be a positive number');
      return;
    }

    setSaving(true);
    const body = {
      date: date.toISOString(),
      categoryId,
      sourceId,
      amount: parsed,
      comment: comment.trim() || undefined,
    };

    const url = expense ? `/api/expenses/${expense._id}` : '/api/expenses';
    const method = expense ? 'PATCH' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    setSaving(false);
    if (res.ok) {
      toast.success(expense ? 'Expense updated' : 'Expense added');
      onSaved();
    } else {
      toast.error(expense ? 'Failed to update expense' : 'Failed to add expense');
    }
  }

  return (
    <div className="space-y-5">
      {/* Date */}
      <div className="space-y-1.5">
        <Label>Date</Label>
        <Popover open={calOpen} onOpenChange={setCalOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-full justify-start text-left font-normal',
                !date && 'text-zinc-400'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
              {date ? format(date, 'PPP') : 'Pick a date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => { setDate(d); setCalOpen(false); }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Amount */}
      <div className="space-y-1.5">
        <Label>Amount (€)</Label>
        <Input
          type="number"
          inputMode="decimal"
          placeholder="0.00"
          min="0"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      {/* Category */}
      <div className="space-y-1.5">
        <Label>Category</Label>
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
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
      </div>

      {/* Source */}
      <div className="space-y-1.5">
        <Label>Source</Label>
        <Select value={sourceId} onValueChange={setSourceId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a source" />
          </SelectTrigger>
          <SelectContent>
            {sources.map((src) => (
              <SelectItem key={src._id} value={src._id}>
                {src.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Comment */}
      <div className="space-y-1.5">
        <Label>
          Comment <span className="text-zinc-400 font-normal">(optional)</span>
        </Label>
        <Input
          placeholder="e.g. Weekly groceries"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        {onCancel && (
          <Button variant="outline" onClick={onCancel} className="w-full sm:w-auto">
            Cancel
          </Button>
        )}
        <Button
          onClick={handleSubmit}
          disabled={saving}
          className="w-full sm:w-auto"
        >
          {saving ? 'Saving…' : expense ? 'Update expense' : 'Add expense'}
        </Button>
      </div>
    </div>
  );
}

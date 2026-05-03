'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import type { Category } from '@/types';

export function CategoriesTab() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [addOpen, setAddOpen] = useState(false);
  const [addName, setAddName] = useState('');
  const [addColor, setAddColor] = useState('#6366f1');
  const [addSaving, setAddSaving] = useState(false);

  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch('/api/categories');
    const json = await res.json();
    setCategories(json.data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleAdd() {
    if (!addName.trim()) return;
    setAddSaving(true);
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: addName.trim(), color: addColor }),
    });
    setAddSaving(false);
    if (res.ok) {
      toast.success('Category created');
      setAddOpen(false);
      setAddName('');
      setAddColor('#6366f1');
      load();
    } else {
      toast.error('Failed to create category');
    }
  }

  function openEdit(cat: Category) {
    setEditTarget(cat);
    setEditName(cat.name);
    setEditColor(cat.color);
  }

  async function handleEdit() {
    if (!editTarget || !editName.trim()) return;
    setEditSaving(true);
    const res = await fetch(`/api/categories/${editTarget._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName.trim(), color: editColor }),
    });
    setEditSaving(false);
    if (res.ok) {
      toast.success('Category updated');
      setEditTarget(null);
      load();
    } else {
      toast.error('Failed to update category');
    }
  }

  async function handleDelete(cat: Category) {
    const res = await fetch(`/api/categories/${cat._id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Category removed');
      load();
    } else {
      toast.error('Failed to remove category');
    }
  }

  const active = categories.filter((c) => c.isActive);
  const inactive = categories.filter((c) => !c.isActive);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-zinc-500">{active.length} active</p>
        </div>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="w-4 h-4 mr-1" />
          Add category
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : active.length === 0 ? (
        <p className="text-sm text-zinc-400 py-8 text-center">No categories yet.</p>
      ) : (
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-md">
          {active.map((cat) => (
            <div key={cat._id} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-sm font-medium">{cat.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(cat)}>
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-zinc-400 hover:text-red-500"
                  onClick={() => handleDelete(cat)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {inactive.length > 0 && (
        <p className="text-xs text-zinc-400">{inactive.length} inactive (hidden)</p>
      )}

      {/* Add dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input
                placeholder="e.g. Restaurants"
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Color</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={addColor}
                  onChange={(e) => setAddColor(e.target.value)}
                  className="h-9 w-12 cursor-pointer rounded border border-zinc-200 dark:border-zinc-700 bg-transparent p-0.5"
                />
                <span className="text-sm text-zinc-500 font-mono">{addColor}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={addSaving || !addName.trim()}>
              {addSaving ? 'Saving…' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editTarget} onOpenChange={(o) => !o && setEditTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleEdit()}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Color</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={editColor}
                  onChange={(e) => setEditColor(e.target.value)}
                  className="h-9 w-12 cursor-pointer rounded border border-zinc-200 dark:border-zinc-700 bg-transparent p-0.5"
                />
                <span className="text-sm text-zinc-500 font-mono">{editColor}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>Cancel</Button>
            <Button onClick={handleEdit} disabled={editSaving || !editName.trim()}>
              {editSaving ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

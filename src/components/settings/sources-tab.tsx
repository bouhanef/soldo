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
import type { Source } from '@/types';

export function SourcesTab() {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);

  const [addOpen, setAddOpen] = useState(false);
  const [addName, setAddName] = useState('');
  const [addSaving, setAddSaving] = useState(false);

  const [editTarget, setEditTarget] = useState<Source | null>(null);
  const [editName, setEditName] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch('/api/sources');
    const json = await res.json();
    setSources(json.data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleAdd() {
    if (!addName.trim()) return;
    setAddSaving(true);
    const res = await fetch('/api/sources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: addName.trim() }),
    });
    setAddSaving(false);
    if (res.ok) {
      toast.success('Source created');
      setAddOpen(false);
      setAddName('');
      load();
    } else {
      toast.error('Failed to create source');
    }
  }

  function openEdit(src: Source) {
    setEditTarget(src);
    setEditName(src.name);
  }

  async function handleEdit() {
    if (!editTarget || !editName.trim()) return;
    setEditSaving(true);
    const res = await fetch(`/api/sources/${editTarget._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName.trim() }),
    });
    setEditSaving(false);
    if (res.ok) {
      toast.success('Source updated');
      setEditTarget(null);
      load();
    } else {
      toast.error('Failed to update source');
    }
  }

  async function handleDelete(src: Source) {
    const res = await fetch(`/api/sources/${src._id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Source removed');
      load();
    } else {
      toast.error('Failed to remove source');
    }
  }

  const active = sources.filter((s) => s.isActive);
  const inactive = sources.filter((s) => !s.isActive);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">{active.length} active</p>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="w-4 h-4 mr-1" />
          Add source
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : active.length === 0 ? (
        <p className="text-sm text-zinc-400 py-8 text-center">No sources yet.</p>
      ) : (
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-md">
          {active.map((src) => (
            <div key={src._id} className="flex items-center justify-between px-4 py-3">
              <span className="text-sm font-medium">{src.name}</span>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(src)}>
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-zinc-400 hover:text-red-500"
                  onClick={() => handleDelete(src)}
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
            <DialogTitle>New source</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input
                placeholder="e.g. Revolut"
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              />
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
            <DialogTitle>Edit source</DialogTitle>
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

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { dbConnect } from '@/lib/db';
import Expense from '@/lib/models/expense';

const PatchSchema = z.object({
  date: z.string().min(1).optional(),
  categoryId: z.string().min(1).optional(),
  sourceId: z.string().min(1).optional(),
  amount: z.number().positive().optional(),
  comment: z.string().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = PatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 });
    }

    await dbConnect();
    const update = { ...parsed.data } as Record<string, unknown>;
    if (parsed.data.date) update.date = new Date(parsed.data.date);

    const data = await Expense.findByIdAndUpdate(id, update, { new: true }).populate(
      'categoryId sourceId'
    );
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({ data });
  } catch (err) {
    console.error('[PATCH /api/expenses/:id]', err);
    return NextResponse.json({ error: 'Failed to update expense' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    await dbConnect();
    const data = await Expense.findByIdAndDelete(id);
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ data });
  } catch (err) {
    console.error('[DELETE /api/expenses/:id]', err);
    return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { dbConnect } from '@/lib/db';
import Expense from '@/lib/models/expense';

function toDateOnly(iso: string): Date {
  const d = new Date(iso);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

const CreateSchema = z.object({
  date: z.string().min(1),
  categoryId: z.string().min(1),
  sourceId: z.string().min(1),
  amount: z.number().positive(),
  comment: z.string().optional(),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month');       // YYYY-MM
    const categoryId = searchParams.get('categoryId');
    const sourceId = searchParams.get('sourceId');
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20')));
    const sortBy = searchParams.get('sortBy') === 'amount' ? 'amount' : 'date';
    const sortDir = searchParams.get('sortDir') === 'desc' ? -1 : 1;

    await dbConnect();

    const filter: Record<string, unknown> = {};

    if (month) {
      const [year, mon] = month.split('-').map(Number);
      filter.date = {
        $gte: new Date(Date.UTC(year, mon - 1, 1)),
        $lt: new Date(Date.UTC(year, mon, 1)),
      };
    }
    if (categoryId) filter.categoryId = categoryId;
    if (sourceId) filter.sourceId = sourceId;

    const total = await Expense.countDocuments(filter);
    const data = await Expense.find(filter)
      .populate('categoryId sourceId')
      .sort({ [sortBy]: sortDir, createdAt: sortDir })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({ data, total, page, limit });
  } catch (err) {
    console.error('[GET /api/expenses]', err);
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = CreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 });
    }

    await dbConnect();
    const expense = await Expense.create({
      ...parsed.data,
      date: toDateOnly(parsed.data.date),
    });
    const data = await expense.populate('categoryId sourceId');
    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/expenses]', err);
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 });
  }
}

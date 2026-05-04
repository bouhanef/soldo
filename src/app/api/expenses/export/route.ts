import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Expense from '@/lib/models/expense';
import type { IExpense } from '@/lib/models/expense';
import type { ICategory } from '@/lib/models/category';
import type { ISource } from '@/lib/models/source';

type PopulatedExpense = Omit<IExpense, 'categoryId' | 'sourceId'> & {
  categoryId: ICategory;
  sourceId: ISource;
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month');
    const categoryId = searchParams.get('categoryId');
    const sourceId = searchParams.get('sourceId');

    await dbConnect();

    const sortBy = searchParams.get('sortBy') === 'amount' ? 'amount' : 'date';
    const sortDir = searchParams.get('sortDir') === 'desc' ? -1 : 1;

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

    const expenses = (await Expense.find(filter)
      .populate('categoryId sourceId')
      .sort({ [sortBy]: sortDir, createdAt: sortDir })) as unknown as PopulatedExpense[];

    const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' });

    const rows = [
      ['Date', 'Category', 'Source', 'Amount', 'Comment'],
      ...expenses.map((e) => [
        new Date(e.date).toISOString().slice(0, 10),
        e.categoryId?.name ?? '',
        e.sourceId?.name ?? '',
        fmt.format(e.amount),
        e.comment ?? '',
      ]),
    ];

    const csv = rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="expenses-${month ?? 'all'}.csv"`,
      },
    });
  } catch (err) {
    console.error('[GET /api/expenses/export]', err);
    return NextResponse.json({ error: 'Failed to export expenses' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Expense from '@/lib/models/expense';

export async function GET(req: NextRequest) {
  await dbConnect();

  const yearParam = req.nextUrl.searchParams.get('year');
  const year = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear();

  if (isNaN(year) || year < 2000 || year > 2100) {
    return NextResponse.json({ error: 'Invalid year' }, { status: 400 });
  }

  const start = new Date(Date.UTC(year, 0, 1));
  const end = new Date(Date.UTC(year + 1, 0, 1));
  const matchStage = { $match: { date: { $gte: start, $lt: end } } };

  const [monthlyRaw, byCategoryRaw, bySourceRaw, countRaw] = await Promise.all([
    Expense.aggregate([
      matchStage,
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$date', timezone: 'UTC' } },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { _id: 1 } },
    ]),

    Expense.aggregate([
      matchStage,
      { $group: { _id: '$categoryId', total: { $sum: '$amount' } } },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: '$category' },
      {
        $project: {
          _id: 0,
          categoryId: { $toString: '$_id' },
          name: '$category.name',
          color: '$category.color',
          total: 1,
        },
      },
      { $sort: { total: -1 } },
    ]),

    Expense.aggregate([
      matchStage,
      { $group: { _id: '$sourceId', total: { $sum: '$amount' } } },
      {
        $lookup: {
          from: 'sources',
          localField: '_id',
          foreignField: '_id',
          as: 'source',
        },
      },
      { $unwind: '$source' },
      {
        $project: {
          _id: 0,
          sourceId: { $toString: '$_id' },
          name: '$source.name',
          total: 1,
        },
      },
      { $sort: { total: -1 } },
    ]),

    Expense.aggregate([matchStage, { $count: 'total' }]),
  ]);

  // Fill all 12 months so the chart always has a full year
  const monthlyMap = new Map<string, number>(
    monthlyRaw.map((r: { _id: string; total: number }) => [r._id, r.total])
  );
  const monthlyTotals = Array.from({ length: 12 }, (_, i) => {
    const m = String(i + 1).padStart(2, '0');
    const key = `${year}-${m}`;
    return { month: key, total: monthlyMap.get(key) ?? 0 };
  });

  const totalYear = monthlyTotals.reduce((sum, m) => sum + m.total, 0);
  const count: number = countRaw[0]?.total ?? 0;

  return NextResponse.json({
    data: {
      year,
      totalYear,
      count,
      monthlyTotals,
      byCategory: byCategoryRaw,
      bySource: bySourceRaw,
    },
  });
}

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { dbConnect } from '@/lib/db';
import Category from '@/lib/models/category';

const CreateSchema = z.object({
  name: z.string().min(1),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color'),
});

export async function GET() {
  try {
    await dbConnect();
    const data = await Category.find().sort({ name: 1 });
    return NextResponse.json({ data });
  } catch (err) {
    console.error('[GET /api/categories]', err);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
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
    const data = await Category.create(parsed.data);
    return NextResponse.json({ data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}

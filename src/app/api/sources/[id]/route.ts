import { NextResponse } from 'next/server';
import { z } from 'zod';
import { dbConnect } from '@/lib/db';
import Source from '@/lib/models/source';

const PatchSchema = z.object({
  name: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
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
    const data = await Source.findByIdAndUpdate(id, parsed.data, { new: true });
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: 'Failed to update source' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    await dbConnect();

    // Soft delete — never hard delete (sources are referenced by expenses)
    const data = await Source.findByIdAndUpdate(id, { isActive: false }, { new: true });
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: 'Failed to delete source' }, { status: 500 });
  }
}

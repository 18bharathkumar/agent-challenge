import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { projectsStore } from '../../../../lib/projects';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const item = projectsStore.find((p) => p.id === id);
    if (!item) return NextResponse.json({ error: 'not found' }, { status: 404 });
    return NextResponse.json(item.toJSON(), { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: 'failed to get project' }, { status: 500 });
  }
}

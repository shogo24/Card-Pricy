import { NextRequest, NextResponse } from 'next/server';
import { scryfallGetCard } from '@/lib/scryfall';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const card = await scryfallGetCard(id);
  if (!card) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ card });
}

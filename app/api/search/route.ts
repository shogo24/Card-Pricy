import { NextRequest, NextResponse } from 'next/server';
import { scryfallSearch } from '@/lib/scryfall';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') || '';
  const cards = await scryfallSearch(q);
  return NextResponse.json({ cards });
}

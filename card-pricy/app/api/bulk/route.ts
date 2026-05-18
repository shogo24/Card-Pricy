import { NextRequest, NextResponse } from 'next/server';
import { scryfallBulkSearch } from '@/lib/scryfall';

export async function POST(req: NextRequest) {
  const { names } = await req.json();
  const result = await scryfallBulkSearch(names);
  return NextResponse.json(result);
}

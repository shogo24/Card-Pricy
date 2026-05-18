import { NextRequest, NextResponse } from 'next/server';
import { scryfallAutocomplete } from '@/lib/scryfall';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') || '';
  const names = await scryfallAutocomplete(q);
  return NextResponse.json({ names });
}

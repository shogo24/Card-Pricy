'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, AlertTriangle, Loader } from 'lucide-react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import CardDetails from '@/components/CardDetails';
import CardVariationsModal from '@/components/CardVariationsModal';
import { MTGCard } from '@/lib/types';
import { useAppStore } from '@/lib/store';
import { formatPrice } from '@/lib/currency';

function parseBulkLine(line: string) {
  const trimmed = line.trim();
  const match = trimmed.match(/^(\d+)\s+(.*)$/);

  if (!match) {
    return { query: trimmed, count: 1 };
  }

  const count = Math.max(1, parseInt(match[1], 10) || 1);
  const query = match[2].trim();
  return { query, count };
}

function BulkResults() {
  const router = useRouter();
  const params = useSearchParams();
  const raw = params.get('q') || '';
  const bulkEntries = raw.split('\n').map(parseBulkLine).filter(entry => entry.query);
  const names = bulkEntries.flatMap(entry => Array.from({ length: entry.count }, () => entry.query));
  const hasQuery = raw.trim().length > 0;

  const [found, setFound] = useState<MTGCard[]>([]);
  const [missing, setMissing] = useState<string[]>([]);
  const [loadedRaw, setLoadedRaw] = useState('');
  const [selectedCardName, setSelectedCardName] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<MTGCard | null>(null);
  const { currency, list } = useAppStore();
  const loading = hasQuery && raw !== loadedRaw;

  const listCounts = list.reduce((acc, entry) => {
    const key = entry.card.name.toLowerCase();
    acc[key] = (acc[key] || 0) + entry.quantity;
    return acc;
  }, {} as Record<string, number>);

  useEffect(() => {
    if (names.length === 0) return;
    fetch('/api/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ names }),
    })
      .then(r => r.json())
      .then(data => {
        setFound(data.found || []);
        setMissing(data.missing || []);
      })
        .catch(() => setMissing(names))
      .finally(() => setLoadedRaw(raw));
  }, [raw, names]);

  const visibleCards = found;

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <main className="max-w-300 mx-auto px-6 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 bg-transparent border-none cursor-pointer font-sans text-ink-secondary text-sm mb-6 p-0"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <h1 className="font-display text-[28px] font-extrabold mb-2">Bulk Search Results</h1>

        {!hasQuery ? (
          <div className="text-center py-15 text-ink-muted">
            <p className="text-lg">Enter one or more card names to start a bulk search.</p>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center py-20 gap-4 text-ink-muted">
            <Loader size={32} className="animate-spin text-crimson" />
            <p className="text-[15px]">Resolving {names.length} card{names.length !== 1 ? 's' : ''} via Scryfall...</p>
            <p className="text-[13px] text-ink-muted">This may take a moment for large lists</p>
          </div>
        ) : (
          <>
            <p className="text-ink-muted text-sm mb-6">
              {found.length} of {names.length} cards found
            </p>

            {missing.length > 0 && (
              <div className="animate-fadeIn bg-[#FEF3C7] border border-[#FCD34D] rounded-xl px-5 py-4 mb-6 flex gap-3">
                <AlertTriangle size={18} className="text-[#92400E] shrink-0 mt-px" />
                <div>
                  <p className="font-bold text-sm text-[#92400E] mb-1.5">
                    {missing.length} card{missing.length !== 1 ? 's' : ''} could not be found
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {missing.map(name => (
                      <span
                        key={name}
                        className="px-2.5 py-0.5 rounded-full bg-[#FEF9C3] border border-[#FCD34D] text-xs text-[#78350F]"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {found.length === 0 ? (
              <div className="text-center py-15 text-ink-muted">
                <p className="text-lg">No cards found. Check your card names and try again.</p>
              </div>
            ) : (
              <div className="stagger-children grid gap-4 grid-cols-[repeat(auto-fill,minmax(160px,1fr))]">
                {visibleCards.map((card, index) => {
                  const availablePrices = card.prices.filter(p => p.nm !== null).map(p => p.nm!);
                  const lowestNm = availablePrices.length > 0 ? Math.min(...availablePrices) : null;
                  const listCount = listCounts[card.name.toLowerCase()] || 0;
                  return (
                    <button
                      key={`${card.id}-${index}`}
                      onClick={() => setSelectedCardName(card.name)}
                      className={`bg-card rounded-xl overflow-hidden cursor-pointer text-left p-0 flex flex-col border ${
                        listCount > 0 ? 'border-crimson-ring' : 'border-line'
                      }`}
                    >
                      <div className="relative pt-[139%] bg-cream-dark w-full">
                        <Image
                          src={card.imageUrl}
                          alt={card.name}
                          fill
                          sizes="160px"
                          className="object-cover"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                        />
                        {listCount > 0 && (
                          <div
                            className="absolute inset-0 pointer-events-none"
                            style={{ background: 'linear-gradient(180deg, rgba(139,26,43,0.10) 0%, rgba(139,26,43,0.03) 35%, rgba(0,0,0,0) 100%)' }}
                          />
                        )}
                        {listCount > 0 && (
                          <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-crimson-soft-strong text-white text-[11px] font-bold shadow-[0_4px_12px_rgba(0,0,0,0.18)]">
                            In list · x{listCount}
                          </div>
                        )}
                      </div>
                      <div className="px-3 pt-2.5 pb-3">
                        <div className="text-[13px] font-semibold text-ink leading-tight mb-1">{card.name}</div>
                        <div className="text-[11px] text-ink-muted mb-1.5">
                          {card.set} · {card.setCode} #{card.collectorNumber}{card.finish === 'foil' ? ' · Foil' : card.finish === 'both' ? ' · Foil / Nonfoil' : ''}
                        </div>
                        <div className="text-[13px] font-bold text-crimson">
                          {lowestNm !== null ? formatPrice(lowestNm, currency) : 'N/A'}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>

      {selectedCardName && (
        <CardVariationsModal
          cardName={selectedCardName}
          onClose={() => setSelectedCardName(null)}
          onSelectVariation={(card) => {
            setSelectedCardName(null);
            setSelectedCard(card);
          }}
        />
      )}

      {selectedCard && (
        <CardDetails card={selectedCard} onClose={() => setSelectedCard(null)} isModal />
      )}
    </div>
  );
}

export default function BulkPage() {
  return <Suspense><BulkResults /></Suspense>;
}

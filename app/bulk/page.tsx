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

function BulkResults() {
  const router = useRouter();
  const params = useSearchParams();
  const raw = params.get('q') || '';
  const names = raw.split('\n').map(n => n.trim()).filter(Boolean);
  const hasQuery = raw.trim().length > 0;

  const [found, setFound] = useState<MTGCard[]>([]);
  const [missing, setMissing] = useState<string[]>([]);
  const [loadedRaw, setLoadedRaw] = useState('');
  const [selectedCardName, setSelectedCardName] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<MTGCard | null>(null);
  const { currency } = useAppStore();
  const loading = hasQuery && raw !== loadedRaw;

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

  // Group cards by name and get one representative per name
  const uniqueCards = Array.from(
    new Map(found.map(card => [card.name, card])).values()
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <Navbar />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24, padding: 0 }}>
          <ArrowLeft size={16} /> Back
        </button>

        <h1 className="font-display" style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Bulk Search Results</h1>

        {!hasQuery ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: 18 }}>Enter one or more card names to start a bulk search.</p>
          </div>
        ) : loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 0', gap: 16, color: 'var(--text-muted)' }}>
            <Loader size={32} className="animate-spin" style={{ color: 'var(--crimson)' }} />
            <p style={{ fontSize: 15 }}>Resolving {names.length} card{names.length !== 1 ? 's' : ''} via Scryfall...</p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>This may take a moment for large lists</p>
          </div>
        ) : (
          <>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
              {found.length} of {names.length} cards found
            </p>

            {missing.length > 0 && (
              <div className="animate-fadeIn" style={{ background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: 12, padding: '16px 20px', marginBottom: 24, display: 'flex', gap: 12 }}>
                <AlertTriangle size={18} style={{ color: '#92400E', flexShrink: 0, marginTop: 1 }} />
                <div>
                  <p style={{ fontWeight: 700, fontSize: 14, color: '#92400E', marginBottom: 6 }}>
                    {missing.length} card{missing.length !== 1 ? 's' : ''} could not be found
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {missing.map(name => (
                      <span key={name} style={{ padding: '2px 10px', borderRadius: 99, background: '#FEF9C3', border: '1px solid #FCD34D', fontSize: 12, color: '#78350F' }}>
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {found.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                <p style={{ fontSize: 18 }}>No cards found. Check your card names and try again.</p>
              </div>
            ) : (
              <div className="stagger-children" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                gap: 16,
              }}>
                {uniqueCards.map((card) => {
                  const availablePrices = card.prices.filter(p => p.nm !== null).map(p => p.nm!);
                  const lowestNm = availablePrices.length > 0 ? Math.min(...availablePrices) : null;
                  return (
                    <button
                      key={card.id}
                      onClick={() => setSelectedCardName(card.name)}
                      style={{
                        background: 'var(--card-bg)',
                        border: '1px solid var(--border)',
                        borderRadius: 12,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        textAlign: 'left',
                        padding: 0,
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <div style={{ position: 'relative', paddingTop: '139%', background: 'var(--cream-dark)', width: '100%' }}>
                        <Image
                          src={card.imageUrl}
                          alt={card.name}
                          fill
                          sizes="160px"
                          style={{ objectFit: 'cover' }}
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                        />
                      </div>
                      <div style={{ padding: '10px 12px 12px' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: 4 }}>{card.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>{card.set}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--crimson)' }}>
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

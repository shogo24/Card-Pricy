'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader } from 'lucide-react';
import { useState, useEffect, Suspense } from 'react';
import Navbar from '@/components/Navbar';
import CardGrid from '@/components/CardGrid';
import CardDetails from '@/components/CardDetails';
import { MTGCard } from '@/lib/types';
import { useAppStore } from '@/lib/store';

function SearchResults() {
  const router = useRouter();
  const params = useSearchParams();
  const q = params.get('q') || '';
  const { addRecentSearch } = useAppStore();

  const [cards, setCards] = useState<MTGCard[]>([]);
  const [loadedQuery, setLoadedQuery] = useState('');
  const [error, setError] = useState('');
  const [selectedCard, setSelectedCard] = useState<MTGCard | null>(null);
  const loading = q !== loadedQuery;

  useEffect(() => {
    if (!q) return;
    fetch(`/api/search?q=${encodeURIComponent(q)}`)
      .then(r => r.json())
      .then(data => {
        const results: MTGCard[] = data.cards || [];
        setCards(results);
        // Save the user's search term so Recently Searched matches what they typed.
        if (results.length > 0) {
          const first = results[0];
          const nm = first.prices.find(p => p.nm !== null)?.nm ?? 0;
          addRecentSearch({ name: q, price: nm, change: +(Math.random() * 4 - 2).toFixed(1), timestamp: Date.now() });
        }
      })
      .catch(() => setError('Failed to fetch results. Please try again.'))
      .finally(() => setLoadedQuery(q));
  }, [q, addRecentSearch]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <Navbar />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24, padding: 0 }}>
          <ArrowLeft size={16} /> Back
        </button>

        <div style={{ marginBottom: 24 }}>
          <h1 className="font-display" style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
            {q ? `Results for "${q}"` : 'Search Results'}
          </h1>
          {!loading && (
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
              {error ? '' : `${cards.length} printing${cards.length !== 1 ? 's' : ''} found`}
            </p>
          )}
        </div>

        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 0', gap: 16, color: 'var(--text-muted)' }}>
            <Loader size={32} className="animate-spin" style={{ color: 'var(--crimson)' }} />
            <p style={{ fontSize: 15 }}>Searching Scryfall...</p>
          </div>
        )}

        {error && (
          <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 12, padding: '16px 20px', color: '#991B1B', fontSize: 14 }}>
            {error}
          </div>
        )}

        {!loading && !error && cards.length === 0 && q && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: 18, marginBottom: 8 }}>No cards found for &quot;{q}&quot;</p>
            <p style={{ fontSize: 14 }}>Try a different search term or check spelling</p>
          </div>
        )}

        {!loading && cards.length > 0 && (
          <CardGrid cards={cards} onCardClick={setSelectedCard} />
        )}
      </main>

      {selectedCard && (
        <CardDetails card={selectedCard} onClose={() => setSelectedCard(null)} isModal />
      )}
    </div>
  );
}

export default function SearchPage() {
  return <Suspense><SearchResults /></Suspense>;
}

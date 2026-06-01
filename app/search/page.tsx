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
    <div className="min-h-screen bg-cream">
      <Navbar />
      <main className="max-w-300 mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 bg-transparent border-none cursor-pointer font-sans text-ink-secondary text-sm mb-4 sm:mb-6 p-0"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="mb-4 sm:mb-6">
          <h1 className="font-display text-2xl sm:text-[28px] font-extrabold mb-1 wrap-break-word">
            {q ? `Results for "${q}"` : 'Search Results'}
          </h1>
          {!loading && (
            <p className="text-ink-muted text-sm">
              {error ? '' : `${cards.length} printing${cards.length !== 1 ? 's' : ''} found`}
            </p>
          )}
        </div>

        {loading && (
          <div className="flex flex-col items-center py-20 gap-4 text-ink-muted">
            <Loader size={32} className="animate-spin text-crimson" />
            <p className="text-[15px]">Searching Scryfall...</p>
          </div>
        )}

        {error && (
          <div className="bg-[#FEE2E2] border border-[#FCA5A5] rounded-xl px-5 py-4 text-[#991B1B] text-sm">
            {error}
          </div>
        )}

        {!loading && !error && cards.length === 0 && q && (
          <div className="text-center py-20 text-ink-muted">
            <p className="text-lg mb-2">No cards found for &quot;{q}&quot;</p>
            <p className="text-sm">Try a different search term or check spelling</p>
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

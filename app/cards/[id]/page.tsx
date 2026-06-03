'use client';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Loader } from 'lucide-react';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import CardDetails from '@/components/CardDetails';
import { MTGCard } from '@/lib/types';

export default function CardPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [card, setCard] = useState<MTGCard | null>(null);
  const [loadedId, setLoadedId] = useState('');
  const [error, setError] = useState('');
  const loading = Boolean(id) && id !== loadedId;

  useEffect(() => {
    if (!id) return;
    fetch(`/api/card/${id}`)
      .then(r => {
        if (!r.ok) throw new Error('Not found');
        return r.json();
      })
      .then(data => setCard(data.card))
      .catch(() => setError('Card not found or failed to load.'))
      .finally(() => setLoadedId(id));
  }, [id]);

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <div className="max-w-300 mx-auto pt-4 sm:pt-6 px-4 sm:px-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 bg-transparent border-none cursor-pointer font-sans text-ink-secondary text-sm p-0"
        >
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      {loading && (
        <div className="flex flex-col items-center py-16 sm:py-25 gap-4 text-ink-muted">
          <Loader size={32} className="animate-spin text-crimson" />
          <p>Loading card data...</p>
        </div>
      )}

      {error && (
        <div className="max-w-150 mx-auto mt-10 sm:mt-15 text-center px-4 sm:px-6">
          <h1 className="font-display text-2xl sm:text-[28px] mb-3">Card Not Found</h1>
          <p className="text-ink-muted text-[15px]">{error}</p>
        </div>
      )}

      {card && <CardDetails card={card} />}
    </div>
  );
}

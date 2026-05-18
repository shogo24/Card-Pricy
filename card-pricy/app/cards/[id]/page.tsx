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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/card/${id}`)
      .then(r => {
        if (!r.ok) throw new Error('Not found');
        return r.json();
      })
      .then(data => setCard(data.card))
      .catch(() => setError('Card not found or failed to load.'))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <Navbar />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 24px 0' }}>
        <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', color: 'var(--text-secondary)', fontSize: 14, padding: 0 }}>
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '100px 0', gap: 16, color: 'var(--text-muted)' }}>
          <Loader size={32} className="animate-spin" style={{ color: 'var(--crimson)' }} />
          <p>Loading card data...</p>
        </div>
      )}

      {error && (
        <div style={{ maxWidth: 600, margin: '60px auto', textAlign: 'center', padding: '0 24px' }}>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, marginBottom: 12 }}>Card Not Found</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>{error}</p>
        </div>
      )}

      {card && <CardDetails card={card} />}
    </div>
  );
}

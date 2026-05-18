'use client';
import { useState, useEffect } from 'react';
import { X, Loader } from 'lucide-react';
import Image from 'next/image';
import { MTGCard } from '@/lib/types';
import { useAppStore } from '@/lib/store';
import { formatPrice } from '@/lib/currency';

interface CardVariationsModalProps {
  cardName: string;
  onClose: () => void;
  onSelectVariation: (card: MTGCard) => void;
}

export default function CardVariationsModal({ cardName, onClose, onSelectVariation }: CardVariationsModalProps) {
  const [variations, setVariations] = useState<MTGCard[]>([]);
  const [loadedCardName, setLoadedCardName] = useState('');
  const { currency } = useAppStore();
  const loading = cardName !== loadedCardName;

  useEffect(() => {
    fetch(`/api/search?q=${encodeURIComponent(cardName)}`)
      .then(r => r.json())
      .then(data => setVariations(data.cards || []))
      .catch(() => setVariations([]))
      .finally(() => setLoadedCardName(cardName));
  }, [cardName]);

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="animate-scaleIn" style={{ background: 'var(--card-bg)', borderRadius: 20, padding: 32, maxWidth: 1000, width: '100%', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <X size={16} />
        </button>

        <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 800, marginBottom: 24 }}>{cardName}</h2>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0', gap: 16, color: 'var(--text-muted)' }}>
            <Loader size={32} className="animate-spin" style={{ color: 'var(--crimson)' }} />
            <p>Loading card variations...</p>
          </div>
        ) : variations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            <p>No variations found</p>
          </div>
        ) : (
          <div className="stagger-children" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: 12,
          }}>
            {variations.map((card) => {
              const availablePrices = card.prices.filter(p => p.nm !== null).map(p => p.nm!);
              const lowestNm = availablePrices.length > 0 ? Math.min(...availablePrices) : null;
              return (
                <button
                  key={card.id}
                  onClick={() => onSelectVariation(card)}
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
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--crimson)';
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ position: 'relative', paddingTop: '139%', background: 'var(--cream-dark)', width: '100%' }}>
                    <Image
                      src={card.imageUrl}
                      alt={card.name}
                      fill
                      sizes="140px"
                      style={{ objectFit: 'cover' }}
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                  <div style={{ padding: '8px 10px 10px' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{card.set}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--crimson)' }}>
                      {lowestNm !== null ? formatPrice(lowestNm, currency) : 'N/A'}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

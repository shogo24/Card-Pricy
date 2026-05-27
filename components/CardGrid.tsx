'use client';
import { MTGCard } from '@/lib/types';
import Image from 'next/image';
import { useAppStore } from '@/lib/store';
import { formatPrice } from '@/lib/currency';

interface CardGridProps {
  cards: MTGCard[];
  onCardClick: (card: MTGCard) => void;
}

const RARITY_COLOR: Record<string, string> = {
  common: '#6B7280',
  uncommon: '#9CA3AF',
  rare: '#D4A017',
  mythic: '#E57C23',
};

export default function CardGrid({ cards, onCardClick }: CardGridProps) {
  const { currency, list } = useAppStore();

  const listCounts = list.reduce((acc, entry) => {
    acc[entry.card.id] = (acc[entry.card.id] || 0) + entry.quantity;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="stagger-children" style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
      gap: 16,
    }}>
      {cards.map((card) => {
        const availablePrices = card.prices.filter(p => p.nm !== null).map(p => p.nm!);
        const lowestNm = availablePrices.length > 0 ? Math.min(...availablePrices) : null;
        const listCount = listCounts[card.id] || 0;
        return (
          <button
            key={card.id}
            onClick={() => onCardClick(card)}
            className="card-hover"
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border)',
              borderColor: listCount > 0 ? 'rgba(139,26,43,0.35)' : 'var(--border)',
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
                sizes="(max-width: 768px) 50vw, 160px"
                style={{ objectFit: 'cover' }}
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
              />
              {listCount > 0 && (
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(139,26,43,0.10) 0%, rgba(139,26,43,0.03) 35%, rgba(0,0,0,0) 100%)', pointerEvents: 'none' }} />
              )}
              {listCount > 0 && (
                <div style={{ position: 'absolute', top: 8, right: 8, padding: '4px 8px', borderRadius: 999, background: 'rgba(139,26,43,0.92)', color: '#fff', fontSize: 11, fontWeight: 700, boxShadow: '0 4px 12px rgba(0,0,0,0.18)' }}>
                  In list · x{listCount}
                </div>
              )}
              <div style={{
                position: 'absolute', top: 8, left: 8,
                background: RARITY_COLOR[card.rarity],
                width: 8, height: 8, borderRadius: '50%',
                boxShadow: '0 0 4px currentColor',
              }} />
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
  );
}

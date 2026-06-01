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
      className="fixed inset-0 bg-black/60 z-100 flex items-center justify-center p-6"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="animate-scaleIn bg-card rounded-[20px] p-8 max-w-250 w-full max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-cream border border-line rounded-lg w-8 h-8 cursor-pointer flex items-center justify-center"
        >
          <X size={16} />
        </button>

        <h2 className="font-display text-2xl font-extrabold mb-6">{cardName}</h2>

        {loading ? (
          <div className="flex flex-col items-center py-15 gap-4 text-ink-muted">
            <Loader size={32} className="animate-spin text-crimson" />
            <p>Loading card variations...</p>
          </div>
        ) : variations.length === 0 ? (
          <div className="text-center py-10 text-ink-muted">
            <p>No variations found</p>
          </div>
        ) : (
          <div className="stagger-children grid gap-3 grid-cols-[repeat(auto-fill,minmax(140px,1fr))]">
            {variations.map((card) => {
              const availablePrices = card.prices.filter(p => p.nm !== null).map(p => p.nm!);
              const lowestNm = availablePrices.length > 0 ? Math.min(...availablePrices) : null;
              return (
                <button
                  key={card.id}
                  onClick={() => onSelectVariation(card)}
                  className="bg-card border border-line rounded-xl overflow-hidden cursor-pointer text-left p-0 flex flex-col transition-all duration-150 hover:border-crimson hover:-translate-y-0.5"
                >
                  <div className="relative pt-[139%] bg-cream-dark w-full">
                    <Image
                      src={card.imageUrl}
                      alt={card.name}
                      fill
                      sizes="140px"
                      className="object-cover"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                  <div className="px-2.5 pt-2 pb-2.5">
                    <div className="text-[11px] text-ink-muted mb-1">{card.set}</div>
                    <div className="text-[11px] font-bold text-crimson">
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

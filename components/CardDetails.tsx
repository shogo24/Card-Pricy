'use client';
import { useState } from 'react';
import { X, Plus, Minus, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import { MTGCard, Condition } from '@/lib/types';
import { useAppStore } from '@/lib/store';
import { formatPrice } from '@/lib/currency';

interface CardDetailsProps {
  card: MTGCard;
  onClose?: () => void;
  isModal?: boolean;
}

const CONDITIONS: { key: Condition; label: string }[] = [
  { key: 'nm', label: 'Near Mint' },
  { key: 'played', label: 'Played' },
  { key: 'damaged', label: 'Damaged' },
];

const LEGALITY_COLORS: Record<string, { bg: string; text: string }> = {
  legal: { bg: '#D1FAE5', text: '#065F46' },
  not_legal: { bg: '#F3F4F6', text: '#6B7280' },
  banned: { bg: '#FEE2E2', text: '#991B1B' },
  restricted: { bg: '#FEF3C7', text: '#92400E' },
};

const SECTION_LABEL = 'text-[12px] uppercase tracking-[0.08em] text-ink-muted mb-2.5 font-semibold';
const TOGGLE_BTN_BASE = 'flex-1 px-1 py-2 rounded-lg border-2 font-semibold text-[12px] cursor-pointer font-sans transition-all';

export default function CardDetails({ card, onClose, isModal }: CardDetailsProps) {
  const [condition, setCondition] = useState<Condition>('nm');
  const [finish, setFinish] = useState<'foil' | 'nonfoil'>(card.finish === 'foil' ? 'foil' : 'nonfoil');
  const [qty, setQty] = useState(1);
  const [selectedVendor, setSelectedVendor] = useState<string>(card.prices[0]?.vendor || '');
  const [customPrice, setCustomPrice] = useState<string>('');
  const { addToList, currency } = useAppStore();
  const [added, setAdded] = useState(false);

  const getVendorPrice = (price: (typeof card.prices)[number]) => {
    if (finish === 'foil') {
      return price.foil ?? null;
    }
    return price[condition];
  };

  const handleAdd = () => {
    const price = customPrice ? parseFloat(customPrice) : undefined;
    addToList(card, qty, condition, finish, selectedVendor, price, currency);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const legalities = Object.entries(card.legalities);

  const handleVendorSelect = (vendor: string, inStock: boolean) => {
    if (inStock) {
      setSelectedVendor(vendor);
    }
    setCustomPrice('');
  };

  const container = (
    <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 md:gap-8 h-full">
      <div className="max-w-70 mx-auto w-full md:max-w-none md:mx-0">
        <Image
          src={card.imageUrl}
          alt={card.name}
          width={280}
          height={392}
          sizes="(max-width: 768px) 280px, 280px"
          className="w-full h-auto rounded-2xl shadow-lg"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-6">
        <div>
          <h1 className="font-display text-2xl sm:text-[28px] font-extrabold mb-1">{card.name}</h1>
          {card.alternateArt && <p className="text-ink-muted text-[13px] mb-3">{card.alternateArt}</p>}
          <div className="grid grid-cols-2 gap-y-2 gap-x-6 mb-5 text-[13px]">
            {[
              ['Set', card.set],
              ['Type', card.typeLine],
              ['Released', card.releaseDate],
              ['Rarity', card.rarity.charAt(0).toUpperCase() + card.rarity.slice(1)],
              ['Finish', card.finish === 'both' ? 'Foil / Non-Foil' : card.finish === 'foil' ? 'Foil' : 'Non-Foil'],
              ['Artist', card.artist],
              ['Collector #', card.collectorNumber],
              ['Mana Cost', card.manaCost],
            ].map(([label, val]) => (
              <div key={label}>
                <span className="text-ink-muted block text-[11px] uppercase tracking-wider mb-0.5">{label}</span>
                <span className="font-medium">{val}</span>
              </div>
            ))}
          </div>
          {card.oracleText && (
            <div className="bg-cream border border-line rounded-[10px] px-4 py-3 mb-5 text-[13px] leading-relaxed whitespace-pre-line text-ink-secondary">
              {card.oracleText}
            </div>
          )}
          <h3 className={SECTION_LABEL}>Legality</h3>
          <div className="flex flex-wrap gap-1.5">
            {legalities.map(([format, status]) => {
              const s = LEGALITY_COLORS[status] || LEGALITY_COLORS['not_legal'];
              return (
                <span
                  key={format}
                  className="px-2.5 py-0.75 rounded-full text-[11px] font-semibold"
                  style={{ background: s.bg, color: s.text }}
                >
                  {format.charAt(0).toUpperCase() + format.slice(1)}: {status.replace('_', ' ')}
                </span>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className={SECTION_LABEL}>Condition</h3>
          <div className="flex gap-2 mb-5">
            {CONDITIONS.map(c => {
              const active = condition === c.key;
              return (
                <button
                  key={c.key}
                  onClick={() => setCondition(c.key)}
                  className={`${TOGGLE_BTN_BASE} ${
                    active
                      ? 'border-crimson bg-crimson-soft text-crimson'
                      : 'border-line bg-transparent text-ink-secondary'
                  }`}
                >{c.label}</button>
              );
            })}
          </div>

          {card.finish === 'both' && (
            <>
              <h3 className={SECTION_LABEL}>Finish</h3>
              <div className="flex gap-2 mb-5">
                {([
                  { key: 'nonfoil', label: 'Non-Foil' },
                  { key: 'foil', label: 'Foil' },
                ] as const).map(option => {
                  const active = finish === option.key;
                  return (
                    <button
                      key={option.key}
                      onClick={() => setFinish(option.key)}
                      className={`${TOGGLE_BTN_BASE} ${
                        active
                          ? 'border-crimson bg-crimson-soft text-crimson'
                          : 'border-line bg-transparent text-ink-secondary'
                      }`}
                    >{option.label}</button>
                  );
                })}
              </div>
            </>
          )}

          <h3 className={SECTION_LABEL}>Vendors</h3>
          <div className="flex flex-col gap-2 mb-5">
            {card.prices.map(p => {
              const price = getVendorPrice(p);
              const active = selectedVendor === p.vendor && !customPrice;
              return (
                <button
                  key={p.vendor}
                  onClick={() => handleVendorSelect(p.vendor, p.inStock)}
                  disabled={!p.inStock}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-[10px] border-2 font-sans transition-all ${
                    active
                      ? 'border-crimson bg-[rgba(139,26,43,0.04)]'
                      : 'border-line bg-card'
                  } ${p.inStock ? 'cursor-pointer opacity-100' : 'cursor-not-allowed opacity-50'}`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${p.inStock ? 'bg-success' : 'bg-[#9CA3AF]'}`} />
                    <span className="font-semibold text-[13px]">{p.vendor}</span>
                  </div>
                  <div className="text-right">
                    {price !== null ? (
                      <span className="font-bold text-[15px] text-crimson">{formatPrice(price, currency)}</span>
                    ) : (
                      <span className="text-[12px] text-ink-muted">N/A</span>
                    )}
                    <div className={`text-[10px] ${p.inStock ? 'text-success' : 'text-ink-muted'}`}>
                      {p.inStock ? 'In Stock' : 'Out of Stock'}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <h3 className={SECTION_LABEL}>Custom Price ({currency})</h3>
          <div className="flex gap-2 mb-5">
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="Enter custom price..."
              value={customPrice}
              onChange={e => setCustomPrice(e.target.value)}
              className={`flex-1 px-3.5 py-2.5 rounded-[10px] border-2 font-sans text-[13px] text-ink outline-none transition-all ${
                customPrice ? 'border-crimson bg-[rgba(139,26,43,0.04)]' : 'border-line bg-card'
              }`}
            />
            {customPrice && (
              <button
                onClick={() => setCustomPrice('')}
                className="px-3.5 py-2.5 rounded-[10px] border border-line bg-card cursor-pointer font-sans text-[13px] text-ink-secondary transition-all"
              >
                Clear
              </button>
            )}
          </div>
          <h3 className={SECTION_LABEL}>Quantity</h3>
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="w-9 h-9 rounded-lg border border-line bg-cream cursor-pointer flex items-center justify-center"
            >
              <Minus size={14} />
            </button>
            <span className="font-bold text-xl min-w-8 text-center">{qty}</span>
            <button
              onClick={() => setQty(qty + 1)}
              className="w-9 h-9 rounded-lg border border-line bg-cream cursor-pointer flex items-center justify-center"
            >
              <Plus size={14} />
            </button>
          </div>
          <button
            onClick={handleAdd}
            className="w-full p-3.5 rounded-[10px] border-none cursor-pointer text-[15px] flex items-center justify-center gap-2 bg-crimson text-white font-semibold transition-colors hover:bg-crimson-dark active:scale-[0.98]"
          >
            <ShoppingCart size={18} />
            {added ? 'Added!' : 'Add to List'}
          </button>
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div
        className="fixed inset-0 bg-black/60 z-100 flex items-center justify-center p-3 sm:p-6"
        onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
      >
        <div className="animate-scaleIn bg-card rounded-2xl sm:rounded-[20px] p-4 sm:p-6 md:p-8 pt-12 sm:pt-6 md:pt-8 max-w-225 w-full max-h-[92vh] overflow-y-auto relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-cream border border-line rounded-lg w-9 h-9 sm:w-8 sm:h-8 cursor-pointer flex items-center justify-center"
          >
            <X size={16} />
          </button>
          {container}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-300 mx-auto px-4 sm:px-6 py-6 sm:py-8 animate-fadeIn">
      {container}
    </div>
  );
}

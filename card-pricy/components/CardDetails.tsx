'use client';
import { useState } from 'react';
import { X, Plus, Minus, ShoppingCart } from 'lucide-react';
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

export default function CardDetails({ card, onClose, isModal }: CardDetailsProps) {
  const [condition, setCondition] = useState<Condition>('nm');
  const [qty, setQty] = useState(1);
  const [selectedVendor, setSelectedVendor] = useState<string>(card.prices[0]?.vendor || '');
  const [customPrice, setCustomPrice] = useState<string>('');
  const { addToList, currency } = useAppStore();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    const price = customPrice ? parseFloat(customPrice) : undefined;
    addToList(card, qty, condition, selectedVendor, price, currency);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const legalities = Object.entries(card.legalities);

  const container = (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 32, height: '100%' }}>
      <div>
        <img
          src={card.imageUrl}
          alt={card.name}
          style={{ width: '100%', borderRadius: 16, boxShadow: 'var(--shadow-lg)' }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 800, marginBottom: 4 }}>{card.name}</h1>
          {card.alternateArt && <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 12 }}>{card.alternateArt}</p>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px', marginBottom: 20, fontSize: 13 }}>
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
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>{label}</span>
                <span style={{ fontWeight: 500 }}>{val}</span>
              </div>
            ))}
          </div>
          {card.oracleText && (
            <div style={{ background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-line', color: 'var(--text-secondary)' }}>
              {card.oracleText}
            </div>
          )}
          <h3 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 10, fontWeight: 600 }}>Legality</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {legalities.map(([format, status]) => {
              const s = LEGALITY_COLORS[status] || LEGALITY_COLORS['not_legal'];
              return (
                <span key={format} style={{ padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600, background: s.bg, color: s.text }}>
                  {format.charAt(0).toUpperCase() + format.slice(1)}: {status.replace('_', ' ')}
                </span>
              );
            })}
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 10, fontWeight: 600 }}>Condition</h3>
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {CONDITIONS.map(c => (
              <button
                key={c.key}
                onClick={() => setCondition(c.key)}
                style={{
                  flex: 1, padding: '8px 4px', borderRadius: 8, border: '2px solid',
                  borderColor: condition === c.key ? 'var(--crimson)' : 'var(--border)',
                  background: condition === c.key ? 'rgba(139,26,43,0.06)' : 'transparent',
                  color: condition === c.key ? 'var(--crimson)' : 'var(--text-secondary)',
                  fontWeight: 600, fontSize: 12, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                  transition: 'all 0.15s',
                }}
              >{c.label}</button>
            ))}
          </div>
          <h3 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 10, fontWeight: 600 }}>Vendors</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {card.prices.map(p => {
              const price = p[condition];
              return (
                <button
                  key={p.vendor}
                  onClick={() => { p.inStock && setSelectedVendor(p.vendor); setCustomPrice(''); }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 14px', borderRadius: 10, border: '2px solid',
                    borderColor: selectedVendor === p.vendor && !customPrice ? 'var(--crimson)' : 'var(--border)',
                    background: selectedVendor === p.vendor && !customPrice ? 'rgba(139,26,43,0.04)' : 'var(--card-bg)',
                    cursor: p.inStock ? 'pointer' : 'not-allowed', opacity: p.inStock ? 1 : 0.5,
                    fontFamily: 'DM Sans, sans-serif', transition: 'all 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.inStock ? 'var(--success)' : '#9CA3AF' }} />
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{p.vendor}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {price !== null ? (
                      <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--crimson)' }}>{formatPrice(price, currency)}</span>
                    ) : (
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>N/A</span>
                    )}
                    <div style={{ fontSize: 10, color: p.inStock ? 'var(--success)' : 'var(--text-muted)' }}>
                      {p.inStock ? 'In Stock' : 'Out of Stock'}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <h3 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 10, fontWeight: 600 }}>Custom Price ({currency})</h3>
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="Enter custom price..."
              value={customPrice}
              onChange={e => setCustomPrice(e.target.value)}
              style={{
                flex: 1, padding: '10px 14px', borderRadius: 10, border: '2px solid',
                borderColor: customPrice ? 'var(--crimson)' : 'var(--border)',
                background: customPrice ? 'rgba(139,26,43,0.04)' : 'var(--card-bg)',
                fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: 'var(--text-primary)',
                outline: 'none', transition: 'all 0.15s',
              }}
            />
            {customPrice && (
              <button
                onClick={() => setCustomPrice('')}
                style={{
                  padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)',
                  background: 'var(--card-bg)', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                  fontSize: 13, color: 'var(--text-secondary)', transition: 'all 0.15s',
                }}
              >
                Clear
              </button>
            )}
          </div>
          <h3 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 10, fontWeight: 600 }}>Quantity</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--cream)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Minus size={14} />
            </button>
            <span style={{ fontWeight: 700, fontSize: 20, minWidth: 32, textAlign: 'center' }}>{qty}</span>
            <button onClick={() => setQty(qty + 1)} style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--cream)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Plus size={14} />
            </button>
          </div>
          <button
            onClick={handleAdd}
            className="btn-primary"
            style={{ width: '100%', padding: '14px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
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
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
      >
        <div className="animate-scaleIn" style={{ background: 'var(--card-bg)', borderRadius: 20, padding: 32, maxWidth: 900, width: '100%', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} />
          </button>
          {container}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }} className="animate-fadeIn">
      {container}
    </div>
  );
}

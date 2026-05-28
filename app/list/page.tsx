'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trash2, Copy, Download } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useAppStore } from '@/lib/store';
import { convertPrice, convertCurrencyPrice } from '@/lib/currency';

export default function ListPage() {
  const router = useRouter();
  const { list, removeFromList, updateQuantity, clearList, currency } = useAppStore();
  const [copied, setCopied] = useState(false);

  const getUnitPrice = (entry: (typeof list)[number]) => {
    const priceObj = entry.card.prices.find(v => v.vendor === entry.selectedVendor) || entry.card.prices[0];
    const effectiveFinish = entry.finish ?? (entry.card.finish === 'foil' ? 'foil' : 'nonfoil');
    const vendorPrice = effectiveFinish === 'foil' ? priceObj?.foil ?? null : priceObj?.[entry.condition] ?? 0;

    if (entry.customPrice !== undefined) {
      return convertCurrencyPrice(entry.customPrice, entry.customPriceCurrency ?? currency, currency) ?? 0;
    }

    return convertPrice(vendorPrice, currency) ?? 0;
  };

  const formatLocalPrice = (amount: number) => {
    const symbol = currency === 'CAD' ? 'C$' : currency === 'EUR' ? '€' : '$';
    return `${symbol}${amount.toFixed(2)}`;
  };

  const total = list.reduce((sum, entry) => {
    return sum + getUnitPrice(entry) * entry.quantity;
  }, 0);

  const listText = list.map(e => {
    const totalPrice = getUnitPrice(e) * e.quantity;
    return `${e.quantity}x ${e.card.name} (${e.card.set}) [${e.condition.toUpperCase()}] - ${formatLocalPrice(totalPrice)}`;
  }).join('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(listText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    const csv = ['Quantity,Card Name,Set,Condition,Unit Price,Total'].concat(
      list.map(e => {
        const convertedPrice = getUnitPrice(e);
        const convertedTotal = convertedPrice * e.quantity;
        return `${e.quantity},"${e.card.name}","${e.card.set}",${e.condition.toUpperCase()},${(convertedPrice||0).toFixed(2)},${(convertedTotal||0).toFixed(2)}`;
      })
    ).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'card-pricy-list.csv'; a.click();
  };

  const handleClearList = () => {
    if (window.confirm('Clear the entire list? This cannot be undone.')) {
      clearList();
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <Navbar />
      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px' }}>
        <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24, padding: 0 }}>
          <ArrowLeft size={16} /> Back
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <h1 className="font-display" style={{ fontSize: 32, fontWeight: 800, marginBottom: 4 }}>Card Pricy – List</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{list.reduce((s, e) => s + e.quantity, 0)} cards · {list.length} unique</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, fontWeight: 700, color: 'var(--crimson)' }}>{formatLocalPrice(total)}</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total</span>
          </div>
        </div>

        <div className="surface animate-fadeIn" style={{ overflow: 'hidden' }}>
          {list.length === 0 ? (
            <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: 18, marginBottom: 8 }}>Your list is empty</p>
              <p style={{ fontSize: 14 }}>Search for cards and add them to your list</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 160px 100px 80px 80px 40px', gap: 8, padding: '12px 20px', borderBottom: '2px solid var(--cream-dark)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', fontWeight: 700 }}>
                <span>Qty</span>
                <span>Card Name</span>
                <span>Set</span>
                <span>Condition</span>
                <span>Unit</span>
                <span>Total</span>
                <span></span>
              </div>

              {/* Rows */}
              <div className="stagger-children">
                {list.map((entry, i) => {
                  const unitPrice = getUnitPrice(entry);
                  const rowTotal = (unitPrice || 0) * entry.quantity;
                  const rowKey = [entry.card.id, entry.condition, entry.finish ?? 'none', entry.selectedVendor ?? 'none', entry.customPrice ?? 'none', entry.customPriceCurrency ?? 'none'].join('|');

                  return (
                    <div key={rowKey} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 160px 100px 80px 80px 40px', gap: 8, padding: '14px 20px', borderBottom: i < list.length - 1 ? '1px solid var(--cream-dark)' : 'none', alignItems: 'center' }}>
                      {/* Qty */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <input
                          type="number" min={1} value={entry.quantity}
                          onChange={e => updateQuantity(entry, parseInt(e.target.value) || 1)}
                          style={{ width: 48, padding: '4px 6px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 13, fontFamily: 'DM Sans, sans-serif', textAlign: 'center', background: 'var(--cream)', outline: 'none' }}
                        />
                      </div>

                      {/* Name */}
                      <button
                        onClick={() => router.push(`/cards/${entry.card.id}`)}
                        style={{ textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}
                      >
                        {entry.card.name}
                      </button>

                      {/* Set */}
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{entry.card.set}</span>

                      {/* Condition */}
                      <span style={{ fontSize: 12, textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>{entry.condition}{entry.finish ? ` · ${entry.finish}` : ''}</span>

                      {/* Unit price */}
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{formatLocalPrice(unitPrice || 0)}</span>

                      {/* Total */}
                      <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--crimson)' }}>{formatLocalPrice(rowTotal)}</span>

                      {/* Remove */}
                      <button onClick={() => removeFromList(entry)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4, borderRadius: 6, transition: 'color 0.15s' }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--crimson)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  );
                })}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderTop: '2px solid var(--cream-dark)', gap: 16, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <button onClick={handleCopy} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--card-bg)', cursor: 'pointer' }}>
                      <Copy size={15} />
                      {copied ? 'Copied!' : 'Copy List'}
                    </button>
                    <button onClick={handleExport} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--card-bg)', cursor: 'pointer' }}>
                      <Download size={15} />
                      Export CSV
                    </button>
                    <button onClick={handleClearList} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, border: '1px solid #FCA5A5', background: '#FEF2F2', cursor: 'pointer', color: '#991B1B' }}>
                      <Trash2 size={15} />
                      Clear List
                    </button>
                  </div>
                  <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, fontWeight: 700 }}>
                    Total: <span style={{ color: 'var(--crimson)' }}>{formatLocalPrice(total)}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

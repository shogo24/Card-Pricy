'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trash2, Copy, Download } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useAppStore } from '@/lib/store';
import { convertPrice, convertCurrencyPrice } from '@/lib/currency';

const ROW_GRID = 'grid grid-cols-[60px_1fr_160px_100px_80px_80px_40px] gap-2';

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
    <div className="min-h-screen bg-cream">
      <Navbar />
      <main className="max-w-250 mx-auto px-6 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 bg-transparent border-none cursor-pointer font-sans text-ink-secondary text-sm mb-6 p-0"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="font-display text-[32px] font-extrabold mb-1">Card Pricy – List</h1>
            <p className="text-ink-muted text-sm">{list.reduce((s, e) => s + e.quantity, 0)} cards · {list.length} unique</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-display text-2xl font-bold text-crimson">{formatLocalPrice(total)}</span>
            <span className="text-xs text-ink-muted">Total</span>
          </div>
        </div>

        <div className="bg-card border border-line rounded-xl shadow-sm animate-fadeIn overflow-hidden">
          {list.length === 0 ? (
            <div className="px-6 py-15 text-center text-ink-muted">
              <p className="text-lg mb-2">Your list is empty</p>
              <p className="text-sm">Search for cards and add them to your list</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className={`${ROW_GRID} px-5 py-3 border-b-2 border-cream-dark text-[11px] uppercase tracking-[0.06em] text-ink-muted font-bold`}>
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
                    <div
                      key={rowKey}
                      className={`${ROW_GRID} px-5 py-3.5 items-center ${
                        i < list.length - 1 ? 'border-b border-cream-dark' : ''
                      }`}
                    >
                      {/* Qty */}
                      <div className="flex items-center gap-1">
                        <input
                          type="number" min={1} value={entry.quantity}
                          onChange={e => updateQuantity(entry, parseInt(e.target.value) || 1)}
                          className="w-12 px-1.5 py-1 border border-line rounded-md text-[13px] font-sans text-center bg-cream outline-none"
                        />
                      </div>

                      {/* Name */}
                      <button
                        onClick={() => router.push(`/cards/${entry.card.id}`)}
                        className="text-left bg-transparent border-none cursor-pointer font-sans"
                      >
                        {entry.card.name}
                      </button>

                      {/* Set */}
                      <span className="text-[13px] text-ink-secondary">{entry.card.set}</span>

                      {/* Condition */}
                      <span className="text-xs uppercase text-ink-muted font-semibold">{entry.condition}{entry.finish ? ` · ${entry.finish}` : ''}</span>

                      {/* Unit price */}
                      <span className="font-semibold text-sm">{formatLocalPrice(unitPrice || 0)}</span>

                      {/* Total */}
                      <span className="font-bold text-sm text-crimson">{formatLocalPrice(rowTotal)}</span>

                      {/* Remove */}
                      <button
                        onClick={() => removeFromList(entry)}
                        className="bg-transparent border-none cursor-pointer text-ink-muted flex items-center justify-center p-1 rounded-md transition-colors hover:text-crimson"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  );
                })}

                <div className="flex justify-between items-center px-5 py-4 border-t-2 border-cream-dark gap-4 flex-wrap">
                  <div className="flex gap-3 flex-wrap">
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-2 px-3.5 py-2.5 rounded-[10px] border border-line bg-card cursor-pointer"
                    >
                      <Copy size={15} />
                      {copied ? 'Copied!' : 'Copy List'}
                    </button>
                    <button
                      onClick={handleExport}
                      className="flex items-center gap-2 px-3.5 py-2.5 rounded-[10px] border border-line bg-card cursor-pointer"
                    >
                      <Download size={15} />
                      Export CSV
                    </button>
                    <button
                      onClick={handleClearList}
                      className="flex items-center gap-2 px-3.5 py-2.5 rounded-[10px] border border-[#FCA5A5] bg-[#FEF2F2] cursor-pointer text-[#991B1B]"
                    >
                      <Trash2 size={15} />
                      Clear List
                    </button>
                  </div>
                  <div className="font-display text-xl font-bold">
                    Total: <span className="text-crimson">{formatLocalPrice(total)}</span>
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

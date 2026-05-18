'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { List } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Currency } from '@/lib/types';

export default function Navbar() {
  const { currency, setCurrency, list } = useAppStore();
  const router = useRouter();
  const currencies: Currency[] = ['CAD', 'USD', 'EUR'];

  return (
    <nav style={{ background: 'var(--card-bg)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <img src="/CardPricyLogo.png" alt="Card Pricy Logo" style={{ width: 28, height: 28 }} />
          <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: 20, color: 'var(--crimson)' }}>Card Pricy</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, color: 'var(--text-secondary)' }}>
            {currencies.map((c, i) => (
              <span key={c} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {i > 0 && <span style={{ color: 'var(--border)' }}>|</span>}
                <button
                  onClick={() => setCurrency(c)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px',
                    borderRadius: 4, fontWeight: currency === c ? 700 : 400,
                    color: currency === c ? 'var(--text-primary)' : 'var(--text-muted)',
                    fontSize: 14, fontFamily: 'DM Sans, sans-serif',
                  }}
                >{c}</button>
              </span>
            ))}
          </div>
          <button
            onClick={() => router.push('/list')}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 14, position: 'relative' }}
          >
            <List size={16} />
            List
            {list.length > 0 && (
              <span style={{
                position: 'absolute', top: -6, right: -6, background: 'var(--cream)', color: 'var(--crimson)',
                borderRadius: '50%', width: 18, height: 18, fontSize: 11, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--crimson)'
              }}>{list.reduce((s, e) => s + e.quantity, 0)}</span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}

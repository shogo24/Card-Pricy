'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { List } from 'lucide-react';
import Image from 'next/image';
import { useAppStore } from '@/lib/store';
import { Currency } from '@/lib/types';

export default function Navbar() {
  const { currency, setCurrency, list } = useAppStore();
  const router = useRouter();
  const currencies: Currency[] = ['CAD', 'USD', 'EUR'];

  return (
    <nav className="bg-card border-b border-line sticky top-0 z-50">
      <div className="max-w-300 mx-auto px-6 h-15 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <Image src="/CardPricyLogo.png" alt="Card Pricy Logo" width={28} height={28} priority />
          <span className="font-display font-bold text-xl text-crimson">Card Pricy</span>
        </Link>
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-1.5 text-sm text-ink-secondary">
            {currencies.map((c, i) => (
              <span key={c} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-line">|</span>}
                <button
                  onClick={() => setCurrency(c)}
                  className={`bg-transparent border-none cursor-pointer px-1 py-0.5 rounded text-sm font-sans ${
                    currency === c ? 'font-bold text-ink' : 'font-normal text-ink-muted'
                  }`}
                >{c}</button>
              </span>
            ))}
          </div>
          <button
            onClick={() => router.push('/list')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border-none cursor-pointer text-sm relative bg-crimson text-white font-semibold transition-colors hover:bg-crimson-dark active:scale-[0.98]"
          >
            <List size={16} />
            List
            {list.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-cream text-crimson rounded-full w-4.5 h-4.5 text-[11px] font-bold flex items-center justify-center border border-crimson">
                {list.reduce((s, e) => s + e.quantity, 0)}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}

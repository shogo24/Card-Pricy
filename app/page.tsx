'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Clock, Database, Loader } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useAppStore } from '@/lib/store';

const SURFACE = 'bg-card border border-line rounded-xl shadow-sm';

export default function HomePage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [bulkText, setBulkText] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const { recentSearches } = useAppStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSuggestions = useCallback(async (val: string) => {
    if (val.length < 2) { setSuggestions([]); setShowSuggestions(false); return; }
    setLoadingSuggestions(true);
    try {
      const res = await fetch(`/api/autocomplete?q=${encodeURIComponent(val)}`);
      const data = await res.json();
      setSuggestions((data.names || []).slice(0, 8));
      setShowSuggestions(true);
    } catch {
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  }, []);

  const handleQueryChange = useCallback((val: string) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 200);
  }, [fetchSuggestions]);

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  const handleSearch = () => {
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (name: string) => {
    setQuery(name);
    setShowSuggestions(false);
    router.push(`/search?q=${encodeURIComponent(name)}`);
  };

  const handleBulkSearch = () => {
    if (!bulkText.trim()) return;
    router.push(`/bulk?q=${encodeURIComponent(bulkText)}`);
  };

  const bulkCount = bulkText.split('\n').filter(l => l.trim()).length;

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <main className="max-w-275 mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <h1 className="font-display animate-fadeIn text-3xl sm:text-[40px] font-extrabold mb-6 sm:mb-8 text-ink">
          Card Pricy – Search
        </h1>

        {/* Search bar */}
        <div className="animate-fadeIn relative mb-8 z-30">
          <div className="flex shadow-md rounded-xl">
            <div className="flex-1 relative bg-card rounded-l-xl border border-r-0 border-line flex items-center">
              {loadingSuggestions
                ? <Loader size={16} className="animate-spin absolute left-4 text-ink-muted" />
                : <Search size={18} className="absolute left-4 text-ink-muted" />
              }
              <input
                ref={inputRef}
                type="text"
                placeholder="Search any Magic card..."
                value={query}
                onChange={e => handleQueryChange(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                className="w-full pl-12 pr-4 py-4.5 bg-transparent border-none outline-none text-base font-sans text-ink"
              />
            </div>
            <button
              onClick={handleSearch}
              className="bg-crimson text-white font-semibold transition-colors hover:bg-crimson-dark active:scale-[0.98] px-5 sm:px-9 rounded-r-xl border-none cursor-pointer text-base whitespace-nowrap"
            >
              Search
            </button>
          </div>

          {/* Suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="animate-fadeIn absolute top-full inset-x-0 bg-card border border-t-0 border-line rounded-b-xl z-20 shadow-md overflow-hidden">
              {suggestions.map((name, i) => (
                <button
                  key={name}
                  onMouseDown={() => handleSuggestionClick(name)}
                  className={`w-full flex items-center gap-2.5 px-5 py-2.75 bg-transparent border-none cursor-pointer font-sans text-left transition-colors hover:bg-cream ${
                    i < suggestions.length - 1 ? 'border-b border-cream-dark' : ''
                  }`}
                >
                  <Search size={13} className="text-ink-muted shrink-0" />
                  <span className="text-sm font-medium">{name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bottom panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bulk Search */}
          <div className={`${SURFACE} animate-fadeIn p-6 opacity-0 [animation-delay:0.1s]`}>
            <h2 className="font-bold text-lg mb-1">Bulk Search</h2>
            <p className="text-[13px] text-ink-muted mb-3.5">One card name per line</p>
            <textarea
              placeholder={"Lightning Bolt\nBlack Lotus\nCounterspell\nSol Ring"}
              value={bulkText}
              onChange={e => setBulkText(e.target.value)}
              className="w-full h-55 p-4 border border-line rounded-[10px] bg-cream resize-none outline-none font-sans text-sm text-ink leading-[1.8]"
            />
            <div className="flex justify-between items-center mt-3">
              <span className="text-xs text-ink-muted">
                {bulkCount} card{bulkCount !== 1 ? 's' : ''}
              </span>
              <button
                onClick={handleBulkSearch}
                className="bg-crimson text-white font-semibold transition-colors hover:bg-crimson-dark active:scale-[0.98] px-7 py-2.5 rounded-lg border-none cursor-pointer text-sm"
              >
                Search
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {/* Recently Searched */}
            <div className={`${SURFACE} animate-fadeIn p-6 opacity-0 [animation-delay:0.15s]`}>
              <div className="flex items-center gap-2 mb-4">
                <Clock size={16} className="text-ink-muted" />
                <h2 className="font-bold text-lg">Recently Searched</h2>
              </div>
              <div className="flex flex-col">
                {recentSearches.slice(0, 6).map((item, i) => (
                  <button
                    key={`${item.name}-${i}`}
                    onClick={() => router.push(`/search?q=${encodeURIComponent(item.name)}`)}
                    className={`flex justify-between items-center py-2.5 bg-transparent border-none cursor-pointer font-sans text-left ${
                      i < Math.min(recentSearches.length, 6) - 1 ? 'border-b border-cream-dark' : ''
                    }`}
                  >
                    <span className="font-medium text-sm text-ink">{item.name}</span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-ink-muted mt-3">Data provided by Scryfall</p>
            </div>

            {/* Data Sources */}
            <div className={`${SURFACE} animate-fadeIn p-5 opacity-0 [animation-delay:0.2s]`}>
              <div className="flex items-center gap-2 mb-3">
                <Database size={15} className="text-ink-muted" />
                <h3 className="font-semibold text-sm text-ink-secondary">Live Data Sources</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: 'Scryfall', status: 'live', href: 'https://scryfall.com/' },
                  { name: 'TCGPlayer', status: 'via Scryfall', href: 'https://www.tcgplayer.com/' },
                  { name: 'Cardmarket', status: 'via Scryfall', href: 'https://www.cardmarket.com/' },
                ].map(src => (
                  <a
                    key={src.name}
                    href={src.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="px-3 py-1 rounded-full bg-cream border border-line text-xs text-ink-secondary no-underline inline-flex items-center"
                  >
                    <span className="font-bold">{src.name}</span>
                    <span className="text-ink-muted ml-1">· {src.status}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

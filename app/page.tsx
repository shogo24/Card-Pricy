'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Clock, Database, Loader } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useAppStore } from '@/lib/store';

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

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <Navbar />
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px' }}>
        <h1 className="font-display animate-fadeIn" style={{ fontSize: 40, fontWeight: 800, marginBottom: 32, color: 'var(--text-primary)' }}>
          Card Pricy – Search
        </h1>

        {/* Search bar */}
        <div className="animate-fadeIn" style={{ position: 'relative', marginBottom: 32, zIndex: 30 }}>
          <div style={{ display: 'flex', boxShadow: 'var(--shadow-md)', borderRadius: 12 }}>
            <div style={{ flex: 1, position: 'relative', background: 'var(--card-bg)', borderRadius: '12px 0 0 12px', border: '1px solid var(--border)', borderRight: 'none', display: 'flex', alignItems: 'center' }}>
              {loadingSuggestions
                ? <Loader size={16} className="animate-spin" style={{ position: 'absolute', left: 16, color: 'var(--text-muted)' }} />
                : <Search size={18} style={{ position: 'absolute', left: 16, color: 'var(--text-muted)' }} />
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
                style={{ width: '100%', padding: '18px 16px 18px 48px', background: 'transparent', border: 'none', outline: 'none', fontSize: 16, fontFamily: 'DM Sans, sans-serif', color: 'var(--text-primary)' }}
              />
            </div>
            <button onClick={handleSearch} className="btn-primary" style={{ padding: '0 36px', borderRadius: '0 12px 12px 0', border: 'none', cursor: 'pointer', fontSize: 16, whiteSpace: 'nowrap' }}>
              Search
            </button>
          </div>

          {/* Suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="animate-fadeIn" style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--card-bg)', border: '1px solid var(--border)', borderTop: 'none', borderRadius: '0 0 12px 12px', zIndex: 20, boxShadow: 'var(--shadow-md)', overflow: 'hidden' }}>
              {suggestions.map((name, i) => (
                <button
                  key={name}
                  onMouseDown={() => handleSuggestionClick(name)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 20px', background: 'none', border: 'none', borderBottom: i < suggestions.length - 1 ? '1px solid var(--cream-dark)' : 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', textAlign: 'left', transition: 'background 0.1s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--cream)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                >
                  <Search size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bottom panels */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Bulk Search */}
          <div className="surface animate-fadeIn" style={{ padding: 24, animationDelay: '0.1s', opacity: 0 }}>
            <h2 style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>Bulk Search</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>One card name per line</p>
            <textarea
              placeholder={"Lightning Bolt\nBlack Lotus\nCounterspell\nSol Ring"}
              value={bulkText}
              onChange={e => setBulkText(e.target.value)}
              style={{ width: '100%', height: 220, padding: 16, border: '1px solid var(--border)', borderRadius: 10, background: 'var(--cream)', resize: 'none', outline: 'none', fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.8 }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {bulkText.split('\n').filter(l => l.trim()).length} card{bulkText.split('\n').filter(l => l.trim()).length !== 1 ? 's' : ''}
              </span>
              <button onClick={handleBulkSearch} className="btn-primary" style={{ padding: '10px 28px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 14 }}>
                Search
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Recently Searched */}
            <div className="surface animate-fadeIn" style={{ padding: 24, animationDelay: '0.15s', opacity: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <Clock size={16} style={{ color: 'var(--text-muted)' }} />
                <h2 style={{ fontWeight: 700, fontSize: 18 }}>Recently Searched</h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {recentSearches.slice(0, 6).map((item, i) => (
                  <button
                    key={`${item.name}-${i}`}
                    onClick={() => router.push(`/search?q=${encodeURIComponent(item.name)}`)}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', background: 'none', border: 'none', borderBottom: i < Math.min(recentSearches.length, 6) - 1 ? '1px solid var(--cream-dark)' : 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', textAlign: 'left' }}
                  >
                    <span style={{ fontWeight: 500, fontSize: 14, color: 'var(--text-primary)' }}>{item.name}</span>
                  </button>
                ))}
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12 }}>Data provided by Scryfall</p>
            </div>

            {/* Data Sources */}
            <div className="surface animate-fadeIn" style={{ padding: 20, animationDelay: '0.2s', opacity: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Database size={15} style={{ color: 'var(--text-muted)' }} />
                <h3 style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-secondary)' }}>Live Data Sources</h3>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {[
                  { name: 'Scryfall', status: 'live' },
                  { name: 'TCGPlayer', status: 'via Scryfall' },
                  { name: 'Cardmarket', status: 'via Scryfall' },
                ].map(src => (
                  <span key={src.name} style={{ padding: '4px 12px', borderRadius: 99, background: 'var(--cream)', border: '1px solid var(--border)', fontSize: 12, color: 'var(--text-secondary)' }}>
                    <span style={{ fontWeight: 700 }}>{src.name}</span>
                    <span style={{ color: 'var(--text-muted)', marginLeft: 4 }}>· {src.status}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

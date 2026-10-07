'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Minus, Coins } from 'lucide-react';
import { useApi, API_URL } from '@/lib/api';
import { inr, fmtTime, cls } from '@/lib/format';

/** Live gold/silver rate card. Uses SSE with polling fallback. Compact slider on mobile, full strip on desktop. */
export function useLiveRates() {
  const { data, mutate } = useApi('/rates', { refreshInterval: 30000 });
  const [live, setLive] = useState(null);
  useEffect(() => {
    let es;
    try {
      es = new EventSource(`${API_URL}/rates/stream`);
      es.addEventListener('rates', (e) => { try { setLive(JSON.parse(e.data)); } catch {} });
      es.onerror = () => { es.close(); };
    } catch {}
    return () => es?.close();
  }, [mutate]);
  return live || data || null;
}

const Trend = ({ t, size = 14 }) => t === 'UP' ? <TrendingUp size={size} /> : t === 'DOWN' ? <TrendingDown size={size} /> : <Minus size={size} />;

export default function RateTicker({ compact = false }) {
  const rates = useLiveRates();
  const [i, setI] = useState(0);
  const items = rates?.items || [];
  useEffect(() => { if (!items.length) return; const t = setInterval(() => setI((x) => (x + 1) % items.length), 4000); return () => clearInterval(t); }, [items.length]);
  const cur = items[i];

  return (
    <section id="rates" className={cls('rounded-2xl bg-primary p-4 text-white shadow-soft', compact ? '' : 'sm:p-5')}>
      <div className="mb-3 flex items-center justify-between">
        <p className="flex items-center gap-2 text-sm font-semibold"><Coins size={18} className="text-accent" />Current Gold / Silver Rate</p>
        <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold"><span className="live-dot h-2 w-2 rounded-full bg-emerald-400" />{rates?.isLive ? 'Live' : 'Published'}</span>
      </div>
      {!rates ? <div className="skeleton h-16 rounded-xl bg-white/10" /> : (
        <>
          {/* mobile slider */}
          <div className={cls('flex items-center gap-2', compact ? '' : 'lg:hidden')}>
            <button onClick={() => setI((i - 1 + items.length) % items.length)} className="rounded-full p-1.5 hover:bg-white/10" aria-label="Previous"><ChevronLeft size={20} /></button>
            <div className="flex flex-1 items-center justify-between rounded-xl bg-white/10 px-4 py-3">
              <div><p className="text-xs opacity-80">{cur.label} <span className="ml-1 rounded bg-accent/20 px-1.5 py-0.5 text-[10px] font-bold text-accent">{cur.purity}</span></p><p className="text-xl font-bold">{inr(cur.pricePerGram, { decimals: cur.metal === 'SILVER' ? 2 : 0 })} <span className="text-xs font-normal opacity-70">/ gm</span></p></div>
              <div className={cls('flex items-center gap-1 text-xs font-semibold', cur.trend === 'UP' ? 'text-emerald-300' : cur.trend === 'DOWN' ? 'text-rose-300' : 'text-cream/70')}><Trend t={cur.trend} />{cur.change > 0 ? '+' : ''}{cur.change}</div>
            </div>
            <button onClick={() => setI((i + 1) % items.length)} className="rounded-full p-1.5 hover:bg-white/10" aria-label="Next"><ChevronRight size={20} /></button>
          </div>
          {/* desktop strip */}
          {!compact && <div className="hidden grid-cols-5 gap-3 lg:grid">
            {items.map((it) => (
              <div key={it.key} className="rounded-xl bg-white/10 px-4 py-3">
                <p className="text-xs opacity-80">{it.label} <span className="ml-1 rounded bg-accent/20 px-1.5 py-0.5 text-[10px] font-bold text-accent">{it.purity}</span></p>
                <p className="mt-0.5 text-xl font-bold">{inr(it.pricePerGram, { decimals: it.metal === 'SILVER' ? 2 : 0 })}<span className="text-xs font-normal opacity-70"> / gm</span></p>
                <p className={cls('mt-0.5 flex items-center gap-1 text-xs font-semibold', it.trend === 'UP' ? 'text-emerald-300' : it.trend === 'DOWN' ? 'text-rose-300' : 'text-cream/70')}><Trend t={it.trend} size={13} />{it.change > 0 ? '+' : ''}{it.change} ({it.changePct}%)</p>
              </div>))}
          </div>}
          <div className="mt-3 flex items-center justify-between text-[11px] opacity-75"><span>Updated {fmtTime(rates.updatedAt)} • {rates.source}</span><Link href="/digi-gold" className="font-semibold text-accent hover:underline">Buy 24K Digi Gold</Link></div>
        </>
      )}
    </section>
  );
}

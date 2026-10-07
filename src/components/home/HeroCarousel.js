'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Img, Skeleton } from '@/components/ui/Bits';
import { cls } from '@/lib/format';

const AUTOPLAY_MS = 5000;

export default function HeroCarousel({ banners }) {
  const [i, setI] = useState(0);
  const ref = useRef(null);
  const settleTimer = useRef(null);
  const paused = useRef(false);
  const n = banners?.length || 0;

  // Scroll the track whenever the index changes (programmatic or via dots/arrows)
  const goTo = useCallback((idx) => {
    const el = ref.current; if (!el || !n) return;
    const next = ((idx % n) + n) % n;
    setI(next);
    el.scrollTo({ left: next * el.clientWidth, behavior: 'smooth' });
  }, [n]);

  // Autoplay, restarted after every slide change and skipped while the user is interacting
  useEffect(() => {
    if (n < 2) return;
    const t = setInterval(() => { if (!paused.current) goTo(i + 1); }, AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [i, n, goTo]);

  // After a user swipe settles, adopt the slide that is actually in view
  const onScroll = () => {
    clearTimeout(settleTimer.current);
    settleTimer.current = setTimeout(() => {
      const el = ref.current; if (!el) return;
      const idx = Math.round(el.scrollLeft / el.clientWidth);
      setI((cur) => (idx !== cur ? idx : cur));
    }, 120);
  };
  // Keep the current slide aligned on resize/orientation change
  useEffect(() => {
    const onResize = () => { const el = ref.current; if (el) el.scrollTo({ left: i * el.clientWidth }); };
    window.addEventListener('resize', onResize); return () => window.removeEventListener('resize', onResize);
  }, [i]);

  if (!banners) return <Skeleton className="aspect-[4/3] w-full sm:aspect-[21/8]" />;
  if (!n) return null;

  return (
    <div className="group/hero relative overflow-hidden rounded-2xl shadow-soft" onMouseEnter={() => { paused.current = true; }} onMouseLeave={() => { paused.current = false; }} onTouchStart={() => { paused.current = true; }} onTouchEnd={() => { paused.current = false; }}>
      <div ref={ref} onScroll={onScroll} className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain">
        {banners.map((b) => (
          <div key={b.id} className="relative aspect-[4/3] w-full shrink-0 snap-start sm:aspect-[21/8]">
            <picture><source media="(max-width: 640px)" srcSet={b.mobileImageUrl || b.imageUrl} /><Img src={b.imageUrl} alt={b.title} className="h-full w-full object-cover" /></picture>
            <div className="absolute inset-0 bg-gradient-to-r from-primary-dark/80 via-primary-dark/40 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-12">
              <p className="eyebrow mb-2 text-accent-light">{b.subtitle}</p>
              <h2 className="max-w-md font-heading text-2xl font-semibold leading-tight text-white sm:text-4xl lg:text-5xl">{b.title}</h2>
              {b.ctaText && <Link href={b.ctaLink || '/jewellery'} className="btn-accent mt-5 w-fit">{b.ctaText}</Link>}
            </div>
          </div>))}
      </div>
      {n > 1 && (
        <>
          <button onClick={() => goTo(i - 1)} aria-label="Previous slide" className="absolute left-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/80 p-2 text-primary opacity-0 shadow transition hover:bg-white group-hover/hero:opacity-100 sm:block"><ChevronLeft size={20} /></button>
          <button onClick={() => goTo(i + 1)} aria-label="Next slide" className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/80 p-2 text-primary opacity-0 shadow transition hover:bg-white group-hover/hero:opacity-100 sm:block"><ChevronRight size={20} /></button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">{banners.map((_, k) => <button key={k} onClick={() => goTo(k)} aria-label={`Slide ${k + 1}`} className={cls('h-1.5 rounded-full transition-all', k === i ? 'w-6 bg-accent' : 'w-1.5 bg-white/60')} />)}</div>
        </>
      )}
    </div>
  );
}

'use client';
import Link from 'next/link';
import { Coins, PiggyBank, Lock, Landmark, Award, Truck, RefreshCw, ShieldCheck } from 'lucide-react';
import { Img, Skeleton, SectionHeader } from '@/components/ui/Bits';
import ProductCard from '@/components/product/ProductCard';
import { useConfig } from '@/context/ConfigContext';

export function CategoryRow({ categories }) {
  return (
    <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-4 sm:px-0 md:grid-cols-7 lg:grid-cols-7">
      {(categories || Array.from({ length: 7 })).slice(0, 14).map((c, k) => c ? (
        <Link key={c.id} href={`/jewellery?category=${c.slug}`} className="group w-28 shrink-0 sm:w-auto">
          <div className="aspect-square overflow-hidden rounded-2xl bg-cream"><Img src={c.imageUrl} alt={c.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /></div>
          <p className="mt-2 text-center text-sm font-semibold text-ink">{c.name}</p>
        </Link>) : <Skeleton key={k} className="aspect-square w-28 shrink-0 sm:w-auto" />)}
    </div>
  );
}

export function SchemeTiles() {
  const { config } = useConfig();
  const tiles = [
    { href: '/digi-gold', title: 'Digi Gold', hi: 'डिजी गोल्ड', text: `Start from ₹${config.digiGold.minAmount || 100}`, I: Coins },
    { href: '/ema', title: config.ema.title, hi: config.ema.titleHi, text: '11 + 1 month plan', I: PiggyBank },
    { href: '/book-my-gold', title: 'Book My Gold', hi: 'रेट लॉक', text: `${config.bookGold.validityDays || 30}-day rate lock`, I: Lock },
    { href: '/advance-gold', title: 'Advance Gold', hi: 'एडवांस गोल्ड', text: 'Deposit now, buy later', I: Landmark },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {tiles.map((t) => (
        <Link key={t.href} href={t.href} className="group relative overflow-hidden rounded-2xl bg-primary p-4 text-white shadow-soft transition hover:-translate-y-0.5">
          <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-accent/20 transition group-hover:scale-125" />
          <div className="mb-6 grid h-11 w-11 place-items-center rounded-full bg-cream text-primary"><t.I size={22} /></div>
          <p className="text-base font-bold leading-tight">{t.title}</p>
          {t.hi && <p className="text-xs text-accent-light">{t.hi}</p>}
          <p className="mt-1 text-xs opacity-80">{t.text}</p>
        </Link>))}
    </div>
  );
}

export function ProductRail({ eyebrow, title, link, products, cols = 4 }) {
  return (
    <section>
      <SectionHeader eyebrow={eyebrow} title={title} link={link} />
      <div className={`no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:px-0 md:grid-cols-3 lg:grid-cols-${cols}`}>
        {(products || Array.from({ length: cols })).map((p, k) => p ? <div key={p.id} className="w-44 shrink-0 sm:w-auto"><ProductCard product={p} /></div> : <Skeleton key={k} className="aspect-[3/4] w-44 shrink-0 sm:w-auto" />)}
      </div>
    </section>
  );
}

export function StripBanners({ banners }) {
  if (!banners?.length) return null;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {banners.map((b) => (
        <Link key={b.id} href={b.ctaLink || '/jewellery'} className="group relative overflow-hidden rounded-2xl">
          <div className="aspect-[16/7]"><Img src={b.imageUrl} alt={b.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /></div>
          <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/85 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5 text-white"><p className="text-xs text-accent-light">{b.subtitle}</p><p className="font-heading text-xl font-semibold">{b.title}</p>{b.ctaText && <span className="mt-2 inline-block text-sm font-semibold underline">{b.ctaText}</span>}</div>
        </Link>))}
    </div>
  );
}

export function CollectionsGrid({ collections }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
      {(collections || Array.from({ length: 5 })).map((c, k) => c ? (
        <Link key={c.id} href={`/jewellery?collection=${c.slug}`} className="group relative overflow-hidden rounded-2xl">
          <div className="aspect-[4/5]"><Img src={c.imageUrl} alt={c.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /></div>
          <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/80 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4 text-white"><p className="text-[11px] uppercase tracking-wider text-accent-light">{c.tagline}</p><p className="font-heading text-lg font-semibold">{c.name}</p></div>
        </Link>) : <Skeleton key={k} className="aspect-[4/5]" />)}
    </div>
  );
}

const BADGE_ICONS = { certificate: Award, truck: Truck, refresh: RefreshCw, lock: ShieldCheck };
export function TrustBadges() {
  const { config } = useConfig();
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {config.trustBadges.map((b) => { const I = BADGE_ICONS[b.icon] || ShieldCheck; return (
        <div key={b.title} className="card flex items-start gap-3 p-4"><div className="rounded-xl bg-cream p-2.5 text-primary"><I size={20} /></div><div><p className="text-sm font-bold text-primary">{b.title}</p><p className="text-xs text-muted">{b.text}</p></div></div>); })}
    </div>
  );
}

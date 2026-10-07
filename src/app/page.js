'use client';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { useApi } from '@/lib/api';
import { useConfig } from '@/context/ConfigContext';
import { SectionHeader } from '@/components/ui/Bits';
import HeroCarousel from '@/components/home/HeroCarousel';
import RateTicker from '@/components/home/RateTicker';
import { CategoryRow, SchemeTiles, ProductRail, StripBanners, CollectionsGrid, TrustBadges } from '@/components/home/HomeBlocks';

export default function HomePage() {
  const { config, apiDown } = useConfig();
  const { data: hero } = useApi('/banners?placement=hero');
  const { data: strip } = useApi('/banners?placement=strip');
  const { data: categories } = useApi('/categories');
  const { data: collections } = useApi('/collections');
  const { data: home } = useApi('/products/home');

  return (
    <div className="section space-y-10 py-4 sm:py-6">
      {apiDown && <div className="rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">Cannot reach the API at {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}. Start the backend with <code>npm run dev</code> in JewelleryDummyBackend.</div>}
      <HeroCarousel banners={hero} />
      <RateTicker />
      <section><SectionHeader eyebrow="Explore" title="Shop by category" link="/jewellery" /><CategoryRow categories={categories} /></section>
      <section><SectionHeader eyebrow="Gold and savings" title="Grow your gold with us" /><SchemeTiles /></section>
      <ProductRail eyebrow="Just in" title="New Arrivals" link="/jewellery?tag=new" products={home?.newArrivals} />
      <StripBanners banners={strip} />
      <ProductRail eyebrow="Loved by all" title="Best Sellers" link="/jewellery?tag=bestseller" products={home?.bestSellers} />
      <section><SectionHeader eyebrow="Curated" title="Explore collections" /><CollectionsGrid collections={collections} /></section>
      <ProductRail eyebrow="Trending now" title="Trending" link="/jewellery?tag=trending" products={home?.trending} />
      <section><SectionHeader eyebrow="Why Kanak" title="Shop with confidence" /><TrustBadges /></section>
      <section className="rounded-2xl bg-cream p-6 text-center sm:p-10">
        <p className="eyebrow">Concierge</p>
        <h2 className="mt-1 font-heading text-2xl font-semibold text-primary sm:text-3xl">Looking for something special?</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted">Share a design or a budget on WhatsApp and our team will send custom quotes, video previews and showroom appointments.</p>
        <div className="mt-5 flex flex-wrap justify-center gap-3"><a href={config.contact.whatsappUrl} target="_blank" rel="noreferrer" className="btn-whatsapp"><MessageCircle size={18} />Chat on WhatsApp</a><Link href="/contact" className="btn-outline">Visit a showroom</Link></div>
      </section>
    </div>
  );
}

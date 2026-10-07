'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Heart, MessageCircle, ShoppingBag, Sparkles, ShieldCheck, ChevronDown, Share2 } from 'lucide-react';
import { useApi, post } from '@/lib/api';
import { Img, Skeleton, Badge, SectionHeader } from '@/components/ui/Bits';
import PriceBreakdown from '@/components/product/PriceBreakdown';
import ProductCard from '@/components/product/ProductCard';
import { TrustBadges } from '@/components/home/HomeBlocks';
import { useWishlist } from '@/components/product/useWishlist';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { inr, cls } from '@/lib/format';

export default function ProductPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { data: p, error } = useApi(`/products/${slug}`, { refreshInterval: 30000 });
  const [img, setImg] = useState(0);
  const [size, setSize] = useState(null);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [note, setNote] = useState('');
  const cart = useCart();
  const toast = useToast();
  const { requireLogin } = useAuth();
  const { inWishlist, toggle } = useWishlist(p);

  if (error) return <div className="section py-10 text-center text-muted">Product not found. <Link href="/jewellery" className="text-primary underline">Browse jewellery</Link></div>;
  if (!p) return <div className="section grid gap-6 py-6 md:grid-cols-2"><Skeleton className="aspect-square" /><div className="space-y-3"><Skeleton className="h-8 w-2/3" /><Skeleton className="h-5 w-1/3" /><Skeleton className="h-24" /></div></div>;
  const needsSize = p.sizes?.length > 0;
  const addToBag = () => { if (needsSize && !size) return toast('Please select a size', 'error'); cart.add(p, { size }); toast(`${p.name} added to bag`); };
  const buyNow = () => { if (needsSize && !size) return toast('Please select a size', 'error'); cart.add(p, { size }); router.push('/cart'); };
  const express = () => requireLogin(async () => { try { const r = await post('/me/interests', { productId: p.id, note, size: size || undefined }); toast(r.message); } catch (e) { toast(e.message, 'error'); } });
  const share = async () => { try { if (navigator.share) await navigator.share({ title: p.name, url: location.href }); else { await navigator.clipboard.writeText(location.href); toast('Link copied', 'info'); } } catch {} };

  return (
    <div className="section py-4 sm:py-6">
      <p className="mb-3 text-xs text-muted"><Link href="/">Home</Link> / <Link href="/jewellery">Jewellery</Link> / <Link href={`/jewellery?category=${p.category}`}>{p.categoryName}</Link></p>
      <div className="grid gap-6 md:grid-cols-2 lg:gap-10">
        <div>
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-cream"><Img src={p.images?.[img]} alt={p.name} className="h-full w-full object-cover" />
            <div className="absolute right-3 top-3 flex gap-2"><button onClick={share} className="grid h-10 w-10 place-items-center rounded-full bg-white/90 text-primary shadow" aria-label="Share"><Share2 size={18} /></button><button onClick={toggle} className={cls('grid h-10 w-10 place-items-center rounded-full bg-white/90 shadow', inWishlist ? 'text-danger' : 'text-muted')} aria-label="Wishlist"><Heart size={18} fill={inWishlist ? 'currentColor' : 'none'} /></button></div>
          </div>
          {p.images?.length > 1 && <div className="mt-3 flex gap-2">{p.images.map((s, k) => <button key={k} onClick={() => setImg(k)} className={cls('h-16 w-16 overflow-hidden rounded-xl border-2', k === img ? 'border-primary' : 'border-transparent')}><Img src={s} alt="" className="h-full w-full object-cover" /></button>)}</div>}
        </div>
        <div>
          <div className="flex flex-wrap gap-1.5">{p.tags?.map((t) => <span key={t} className="rounded-md bg-cream px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">{t}</span>)}</div>
          <h1 className="mt-2 font-heading text-2xl font-semibold text-primary sm:text-3xl">{p.name}</h1>
          <p className="mt-1 text-sm text-muted">SKU {p.sku} • {p.purity} {p.metal === 'DIAMOND' ? 'Diamond' : p.metal === 'SILVER' ? 'Silver' : 'Gold'}{p.netWeight ? ` • Net ${p.netWeight} gm` : ''}{p.grossWeight ? ` • Gross ${p.grossWeight} gm` : ''}{p.diamondCarat ? ` • ${p.diamondCarat} ct` : ''}</p>
          <div className="mt-4 rounded-2xl bg-cream/70 p-4">
            {p.price.priceOnCall ? <><p className="text-2xl font-bold text-primary">Price on call</p><p className="text-xs text-muted">Made to order. Share your requirement on WhatsApp for a quote.</p></> : (
              <><p className="text-3xl font-bold text-primary">{inr(p.price.total)}{p.price.mrp && <span className="ml-2 text-base font-normal text-muted line-through">{inr(p.price.mrp)}</span>}</p><p className="text-xs text-muted">Inclusive of {p.price.gstPct ?? 3}% GST{p.price.ratePerGram ? ` • Live ${p.purity} rate ${inr(p.price.ratePerGram)}/gm` : ''}</p>
                {p.price.mode === 'RATE_LINKED' && <><button onClick={() => setShowBreakdown(!showBreakdown)} className="mt-2 flex items-center gap-1 text-xs font-semibold text-primary">Price breakup<ChevronDown size={14} className={cls('transition', showBreakdown && 'rotate-180')} /></button>{showBreakdown && <PriceBreakdown price={p.price} className="mt-2 rounded-xl bg-white p-3" />}</>}</>)}
          </div>
          {needsSize && <div className="mt-4"><p className="label">Select size</p><div className="flex flex-wrap gap-2">{p.sizes.map((s) => <button key={s} onClick={() => setSize(s)} className={cls('chip min-w-11 justify-center', size === s ? 'chip-active' : 'chip-idle')}>{s}</button>)}</div></div>}
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {!p.price.priceOnCall && p.inStock && <><button onClick={addToBag} className="btn-outline"><ShoppingBag size={18} />Add to bag</button><button onClick={buyNow} className="btn-primary">Buy now</button></>}
            {!p.inStock && <p className="rounded-xl bg-danger/10 px-4 py-3 text-center text-sm font-semibold text-danger sm:col-span-2">Currently sold out. Enquire for a similar piece.</p>}
            <a href={p.whatsappUrl} target="_blank" rel="noreferrer" className="btn-whatsapp sm:col-span-2"><MessageCircle size={18} />{p.price.priceOnCall ? 'Get a quote on WhatsApp' : 'Order on WhatsApp'}</a>
          </div>
          <div className="mt-4 rounded-2xl border border-cream-dark p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-primary"><Sparkles size={16} />Express interest</p>
            <p className="mt-1 text-xs text-muted">Get a personalised quote, a video preview or a showroom appointment. Track it under My Interest.</p>
            <div className="mt-3 flex gap-2"><input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Occasion, budget, customisation" className="input" /><button onClick={express} className="btn-primary shrink-0">Send</button></div>
          </div>
          {p.highlights?.length > 0 && <ul className="mt-5 grid grid-cols-2 gap-2 text-sm">{p.highlights.map((h) => <li key={h} className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 shadow-card"><ShieldCheck size={14} className="shrink-0 text-accent" />{h}</li>)}</ul>}
          <div className="mt-5 space-y-2 text-sm text-ink/85"><p>{p.description}</p><p className="text-xs text-muted">Certification: {p.certification}</p></div>
        </div>
      </div>
      <div className="mt-10"><TrustBadges /></div>
      {p.similar?.length > 0 && <section className="mt-10"><SectionHeader eyebrow="You may also like" title="Similar pieces" link={`/jewellery?category=${p.category}`} /><div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:px-0 lg:grid-cols-6">{p.similar.map((s) => <div key={s.id} className="w-40 shrink-0 sm:w-auto"><ProductCard product={s} compact /></div>)}</div></section>}
    </div>
  );
}

'use client';
import WhatsAppIcon from '@/components/ui/WhatsAppIcon';
import Link from 'next/link';
import { Heart, ShoppingBag } from 'lucide-react';
import { Img } from '@/components/ui/Bits';
import { inr, cls } from '@/lib/format';
import { useWishlist } from './useWishlist';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';

export default function ProductCard({ product: p, compact = false }) {
  const { inWishlist, toggle, busy } = useWishlist(p);
  const cart = useCart();
  const toast = useToast();
  const badge = p.tags?.includes('new') ? 'NEW' : p.tags?.includes('bestseller') ? 'BESTSELLER' : p.tags?.includes('trending') ? 'TRENDING' : p.tags?.includes('offer') ? 'OFFER' : null;
  return (
    <article className="card group relative flex h-full flex-col overflow-hidden">
      <Link href={`/jewellery/${p.slug}`} className="relative block aspect-square overflow-hidden bg-cream">
        <Img src={p.images?.[0]} alt={p.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        {badge && <span className="absolute left-2 top-2 rounded-md bg-primary px-2 py-0.5 text-[10px] font-bold tracking-wide text-white">{badge}</span>}
        {!p.inStock && <span className="absolute inset-x-0 bottom-0 bg-ink/70 py-1 text-center text-[11px] font-semibold text-white">Sold out</span>}
      </Link>
      <button onClick={toggle} disabled={busy} aria-label="Wishlist" className={cls('absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white/90 shadow transition', inWishlist ? 'text-danger' : 'text-muted hover:text-danger')}><Heart size={16} fill={inWishlist ? 'currentColor' : 'none'} /></button>
      <div className="flex flex-1 flex-col p-3">
        <Link href={`/jewellery/${p.slug}`} className="line-clamp-2 text-sm font-semibold text-ink hover:text-primary">{p.name}</Link>
        <p className="mt-0.5 text-[11px] text-muted">{p.purity} {p.metal === 'DIAMOND' ? 'Diamond' : p.metal === 'SILVER' ? 'Silver' : 'Gold'}{p.netWeight ? ` • ${p.netWeight} gm` : ''}</p>
        <div className="mt-auto pt-2">
          {p.price?.priceOnCall ? <p className="text-sm font-bold text-primary">Price on call</p> : <p className="text-base font-bold text-primary">{inr(p.price?.total)}{p.price?.mrp && <span className="ml-1.5 text-xs font-normal text-muted line-through">{inr(p.price.mrp)}</span>}</p>}
          {!compact && <div className="mt-2 flex gap-1.5">
            <a href={p.whatsappUrl} target="_blank" rel="noreferrer" className="btn-whatsapp flex-1 !px-2 !py-2 text-xs"><WhatsAppIcon size={14} />{p.price?.priceOnCall ? 'Enquire' : 'Order'}</a>
            {!p.price?.priceOnCall && p.inStock && <button onClick={() => { cart.add(p); toast(`${p.name} added to bag`); }} className="btn-outline !px-2.5 !py-2" aria-label="Add to bag"><ShoppingBag size={15} /></button>}
          </div>}
        </div>
      </div>
    </article>
  );
}

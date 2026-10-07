'use client';
import WhatsAppIcon from '@/components/ui/WhatsAppIcon';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, Minus, Plus, ShoppingBag, Tag } from 'lucide-react';
import { post } from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Img, Row, EmptyState, PageTitle, Skeleton } from '@/components/ui/Bits';
import { useCartPreview } from '@/lib/useCartPreview';
import { inr } from '@/lib/format';

export default function CartPage() {
  const cart = useCart();
  const router = useRouter();
  const { requireLogin } = useAuth();
  const toast = useToast();
  const [couponInput, setCouponInput] = useState('');
  const [coupon, setCoupon] = useState('');
  const { preview, error } = useCartPreview(coupon);
  const onCall = cart.items.filter((i) => i.priceOnCall);

  const whatsapp = async () => { try { const r = await post('/orders/whatsapp-link', { items: cart.items.map(({ productId, qty, size }) => ({ productId, qty, size: size || undefined })) }); window.open(r.data.whatsappUrl, '_blank'); } catch (e) { toast(e.message, 'error'); } };
  if (!cart.ready) return <div className="section py-6"><Skeleton className="h-40" /></div>;
  if (!cart.items.length) return <div className="section py-6"><EmptyState icon={ShoppingBag} title="Your bag is empty" text="Add pieces you love, then checkout online or order on WhatsApp." action={<Link href="/jewellery" className="btn-primary">Explore jewellery</Link>} /></div>;

  return (
    <div className="section py-4 sm:py-6">
      <PageTitle title="Your bag" subtitle={`${cart.count} item${cart.count > 1 ? 's' : ''} • Prices follow the live gold rate`} />
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-3">
          {cart.items.map((i) => { const line = preview?.lines?.find((l) => l.productId === i.productId && (l.size || null) === (i.size || null)); return (
            <div key={`${i.productId}-${i.size}`} className="card flex gap-3 p-3">
              <Link href={`/jewellery/${i.slug}`} className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-cream"><Img src={i.image} alt={i.name} className="h-full w-full object-cover" /></Link>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2"><Link href={`/jewellery/${i.slug}`} className="line-clamp-2 text-sm font-semibold hover:text-primary">{i.name}</Link><button onClick={() => cart.remove(i.productId, i.size)} className="text-muted hover:text-danger" aria-label="Remove"><Trash2 size={16} /></button></div>
                <p className="text-xs text-muted">{line ? `${line.purity} • ${line.netWeight} gm` : ''}{i.size ? ` • Size ${i.size}` : ''}</p>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center rounded-full border border-cream-dark"><button onClick={() => cart.setQty(i.productId, i.size, i.qty - 1)} className="p-1.5 text-primary" aria-label="Less"><Minus size={14} /></button><span className="w-7 text-center text-sm font-semibold">{i.qty}</span><button onClick={() => cart.setQty(i.productId, i.size, i.qty + 1)} className="p-1.5 text-primary" aria-label="More"><Plus size={14} /></button></div>
                  <p className="font-bold text-primary">{i.priceOnCall ? 'Price on call' : line ? inr(line.lineTotal) : inr(i.snapshotPrice * i.qty)}</p>
                </div>
              </div>
            </div>); })}
          {onCall.length > 0 && <p className="rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-800">{onCall.length} price-on-call item{onCall.length > 1 ? 's' : ''} can only be ordered on WhatsApp. They are excluded from the online total.</p>}
        </div>
        <div className="card h-fit p-5">
          <p className="font-semibold text-primary">Order summary</p>
          <form onSubmit={(e) => { e.preventDefault(); setCoupon(couponInput.trim()); }} className="mt-3 flex gap-2"><div className="relative flex-1"><Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" /><input className="input pl-9 uppercase" placeholder="Coupon code" value={couponInput} onChange={(e) => setCouponInput(e.target.value)} /></div><button className="btn-outline shrink-0">Apply</button></form>
          {preview?.couponError && <p className="mt-1 text-xs text-danger">{preview.couponError}</p>}
          {preview?.couponCode && <p className="mt-1 text-xs text-success">Coupon {preview.couponCode} applied</p>}
          {error && <p className="mt-3 text-sm text-danger">{error}</p>}
          {preview ? <div className="mt-3"><Row label="Subtotal" value={inr(preview.subtotal)} /><Row label="Making charges (incl.)" value={inr(preview.makingCharges)} />{preview.discount > 0 && <Row label="Discount" value={`- ${inr(preview.discount)}`} />}<Row label={`GST ${preview.gstPct}%`} value={inr(preview.gst)} /><Row label="Shipping" value={preview.shipping ? inr(preview.shipping) : 'FREE'} /><Row label="Total" value={inr(preview.total)} bold /><p className="mt-1 text-[11px] text-muted">Free insured shipping above {inr(preview.freeShippingAbove)}.</p></div> : !error && cart.items.some((i) => !i.priceOnCall) && <Skeleton className="mt-3 h-28" />}
          <div className="mt-4 grid gap-2">
            {preview && <button onClick={() => requireLogin(() => router.push('/checkout'))} className="btn-primary w-full">Checkout {inr(preview.total)}</button>}
            <button onClick={whatsapp} className="btn-whatsapp w-full"><WhatsAppIcon size={16} />Order on WhatsApp</button>
            <Link href="/jewellery" className="btn-ghost w-full">Continue shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

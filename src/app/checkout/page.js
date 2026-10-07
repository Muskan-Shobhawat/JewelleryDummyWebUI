'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Truck, Store, ShieldCheck } from 'lucide-react';
import { useApi, post } from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { usePayment } from '@/context/PaymentContext';
import { useToast } from '@/context/ToastContext';
import { useConfig } from '@/context/ConfigContext';
import { Row, PageTitle, Spinner, Skeleton } from '@/components/ui/Bits';
import { LoginGate } from '@/components/schemes/Shared';
import { useCartPreview } from '@/lib/useCartPreview';
import { inr, gm, cls } from '@/lib/format';

export default function CheckoutPage() {
  const { config } = useConfig();
  const { user, ready, isLoggedIn } = useAuth();
  const cart = useCart();
  const router = useRouter();
  const { openCheckout } = usePayment();
  const toast = useToast();
  const { data: branches } = useApi('/branches');
  const { data: pf } = useApi(isLoggedIn ? '/digi-gold/portfolio' : null);
  const [delivery, setDelivery] = useState('COURIER');
  const [branchId, setBranchId] = useState('');
  const [method, setMethod] = useState('UPI');
  const [coupon, setCoupon] = useState('');
  const [addrEdit, setAddr] = useState(null);
  const [busy, setBusy] = useState(false);
  const placedRef = useRef(false);
  const { preview, error } = useCartPreview(coupon, delivery);
  const items = cart.items.filter((i) => !i.priceOnCall).map(({ productId, qty, size }) => ({ productId, qty, size: size || undefined }));
  const empty = items.length === 0;
  useEffect(() => { if (ready && isLoggedIn && empty && !placedRef.current) router.replace('/cart'); }, [ready, isLoggedIn, empty, router]);
  const addr = addrEdit ?? { line1: '', line2: '', landmark: '', city: '', state: '', pincode: '', ...(user?.address || {}) };
  const effectiveBranchId = branchId || branches?.find((b) => b.isFlagship)?.id || branches?.[0]?.id || '';
  const a = (k) => (e) => setAddr({ ...addr, [k]: e.target.value });

  if (!ready) return <div className="section py-6"><Skeleton className="h-40" /></div>;
  if (!isLoggedIn) return <div className="section py-6"><LoginGate title="Login to checkout" /></div>;
  if (empty) return null;
  const gramsNeeded = preview && pf ? preview.total / pf.sellRate : null;

  const place = async (e) => {
    e.preventDefault(); setBusy(true);
    try {
      const r = await post('/orders', { items, couponCode: preview?.couponCode || undefined, delivery, branchId: delivery === 'PICKUP' ? effectiveBranchId : undefined, address: delivery === 'COURIER' ? addr : undefined, paymentMethod: method });
      const order = r.data.order;
      if (!r.data.payment) { placedRef.current = true; toast(r.message); router.push(`/orders/${order.id}?placed=1`); cart.clear(); return; }
      openCheckout(r.data.payment, { onSuccess: () => { placedRef.current = true; router.push(`/orders/${order.id}?placed=1`); cart.clear(); }, onFailure: () => toast('Payment failed. You can retry from My Orders.', 'error') });
    } catch (err) { toast(err.message, 'error'); } finally { setBusy(false); }
  };

  return (
    <form onSubmit={place} className="section py-4 sm:py-6">
      <PageTitle title="Secure checkout" back="/cart" />
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-5">
          <section className="card p-5"><p className="font-semibold text-primary">Delivery</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">{(config.checkout.deliveryOptions || []).map((d) => { const I = d.code === 'PICKUP' ? Store : Truck; return <button type="button" key={d.code} onClick={() => setDelivery(d.code)} className={cls('flex items-center gap-3 rounded-xl border p-3 text-left', delivery === d.code ? 'border-primary bg-cream/60' : 'border-cream-dark')}><I size={20} className="text-primary" /><div><p className="text-sm font-semibold">{d.label}</p><p className="text-xs text-muted">{d.eta}</p></div></button>; })}</div>
            {delivery === 'PICKUP' ? <div className="mt-4"><label className="label">Showroom</label><select className="input" value={effectiveBranchId} onChange={(e) => setBranchId(e.target.value)}>{(branches || []).map((b) => <option key={b.id} value={b.id}>{b.name} ({b.city})</option>)}</select></div>
              : <div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="sm:col-span-2"><label className="label">Address line 1</label><input required className="input" value={addr.line1} onChange={a('line1')} /></div><div><label className="label">Address line 2</label><input className="input" value={addr.line2} onChange={a('line2')} /></div><div><label className="label">Landmark</label><input className="input" value={addr.landmark} onChange={a('landmark')} /></div><div><label className="label">City</label><input required className="input" value={addr.city} onChange={a('city')} /></div><div><label className="label">State</label><input required className="input" value={addr.state} onChange={a('state')} /></div><div><label className="label">Pincode</label><input required pattern="\d{6}" className="input" value={addr.pincode} onChange={a('pincode')} /></div></div>}
          </section>
          <section className="card p-5"><p className="font-semibold text-primary">Payment method</p>
            <div className="mt-3 grid gap-2">{(config.checkout.paymentMethods || []).map((m) => { const wallet = m.code === 'GOLD_WALLET'; const short = wallet && gramsNeeded != null && gramsNeeded > (pf?.availableGrams || 0); return (
              <label key={m.code} className={cls('flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3', method === m.code ? 'border-primary bg-cream/60' : 'border-cream-dark', short && 'opacity-60')}><input type="radio" name="pm" value={m.code} checked={method === m.code} disabled={short} onChange={() => setMethod(m.code)} className="accent-primary" /><div className="flex-1"><p className="text-sm font-semibold">{m.label}</p><p className="text-xs text-muted">{wallet && pf ? `Balance ${gm(pf.availableGrams)}${gramsNeeded ? ` • needs ${gm(gramsNeeded)}` : ''}` : m.note}</p></div></label>); })}</div>
          </section>
        </div>
        <div className="card h-fit p-5">
          <p className="font-semibold text-primary">Summary</p>
          <ul className="mt-3 divide-y divide-cream-dark text-sm">{preview?.lines?.map((l) => <li key={`${l.productId}-${l.size}`} className="flex justify-between py-2"><span className="pr-2">{l.name} × {l.qty}{l.size ? ` (${l.size})` : ''}</span><span className="font-semibold">{inr(l.lineTotal)}</span></li>)}</ul>
          <div className="mt-3 flex gap-2"><input className="input uppercase" placeholder="Coupon" value={coupon} onChange={(e) => setCoupon(e.target.value.trim())} /></div>
          {preview?.couponError && <p className="mt-1 text-xs text-danger">{preview.couponError}</p>}
          {error && <p className="mt-2 text-sm text-danger">{error}</p>}
          {preview && <div className="mt-3"><Row label="Item price" value={inr(preview.subtotal - preview.makingCharges)} /><Row label="Making charges" value={inr(preview.makingCharges)} />{preview.discount > 0 && <Row label="Discount" value={`- ${inr(preview.discount)}`} />}<Row label={`GST ${preview.gstPct}%`} value={inr(preview.gst)} /><Row label="Insured shipping" value={preview.shipping ? inr(preview.shipping) : 'FREE'} /><Row label="Grand total" value={inr(preview.total)} bold /></div>}
          <button disabled={busy || !preview} className="btn-primary mt-4 w-full">{busy ? <Spinner /> : method === 'GOLD_WALLET' ? 'Pay with Digi Gold' : `Pay ${preview ? inr(preview.total) : ''}`}</button>
          <p className="mt-3 flex items-center justify-center gap-1 text-[11px] text-muted"><ShieldCheck size={12} />256-bit SSL • BIS hallmarked • {config.checkout.exchangeDays}-day exchange</p>
        </div>
      </div>
    </form>
  );
}

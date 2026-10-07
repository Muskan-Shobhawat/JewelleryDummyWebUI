'use client';
import WhatsAppIcon from '@/components/ui/WhatsAppIcon';
import { Suspense } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { CheckCircle2, MapPin } from 'lucide-react';
import { useApi, post } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useConfig } from '@/context/ConfigContext';
import { Badge, Skeleton, PageTitle, Img, Row } from '@/components/ui/Bits';
import { LoginGate } from '@/components/schemes/Shared';
import { inr, fmtDateTime, titleCase } from '@/lib/format';

function Inner() {
  const { id } = useParams(); const sp = useSearchParams();
  const { config } = useConfig();
  const { ready, isLoggedIn } = useAuth();
  const toast = useToast();
  const { data: o, mutate, error } = useApi(isLoggedIn ? `/orders/${id}` : null);
  if (!ready) return <Skeleton className="h-40" />;
  if (!isLoggedIn) return <LoginGate title="Order details" />;
  if (error) return <p className="text-muted">Order not found.</p>;
  if (!o) return <Skeleton className="h-60" />;
  const cancel = async () => { if (!confirm('Cancel this order?')) return; try { await post(`/orders/${o.id}/cancel`); toast('Order cancelled', 'info'); mutate(); } catch (e) { toast(e.message, 'error'); } };
  return (
    <>
      {sp.get('placed') && <div className="mb-5 flex items-center gap-3 rounded-2xl bg-success/10 px-5 py-4 text-success"><CheckCircle2 size={28} /><div><p className="font-bold">Order placed successfully</p><p className="text-sm">Thank you! We have sent the invoice to your email and WhatsApp.</p></div></div>}
      <PageTitle title={o.orderNo} subtitle={`Placed ${fmtDateTime(o.createdAt)}`} back="/orders" right={<Badge status={o.status} />} />
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-4">
          <div className="card p-5"><p className="mb-3 font-semibold text-primary">Items</p><ul className="divide-y divide-cream-dark">{o.items.map((i, k) => <li key={k} className="flex items-center gap-3 py-3"><div className="h-16 w-16 overflow-hidden rounded-xl bg-cream"><Img src={i.image} alt="" className="h-full w-full object-cover" /></div><div className="flex-1"><Link href={`/jewellery/${i.slug}`} className="text-sm font-semibold hover:text-primary">{i.name}</Link><p className="text-xs text-muted">{i.purity} • {i.netWeight} gm{i.size ? ` • Size ${i.size}` : ''} • Qty {i.qty}</p></div><p className="font-semibold">{inr(i.lineTotal)}</p></li>)}</ul></div>
          <div className="card p-5"><p className="mb-3 font-semibold text-primary">Timeline</p><ol className="relative ml-2 border-l border-cream-dark">{o.timeline.map((t, k) => <li key={k} className="mb-4 ml-4"><span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full bg-primary" /><p className="text-sm font-semibold">{titleCase(t.status)}</p><p className="text-xs text-muted">{fmtDateTime(t.at)}{t.note ? ` • ${t.note}` : ''}</p></li>)}</ol></div>
        </div>
        <div className="space-y-4">
          <div className="card p-5"><p className="font-semibold text-primary">Payment</p><Row label="Item price" value={inr(o.subtotal - o.makingCharges)} /><Row label="Making charges" value={inr(o.makingCharges)} />{o.discount > 0 && <Row label={`Discount${o.couponCode ? ` (${o.couponCode})` : ''}`} value={`- ${inr(o.discount)}`} />}<Row label="GST" value={inr(o.gst)} /><Row label="Shipping" value={o.shipping ? inr(o.shipping) : 'FREE'} /><Row label="Total" value={inr(o.total)} bold /><p className="mt-2 text-xs text-muted">{o.payment.method} • {o.payment.status}</p></div>
          <div className="card p-5"><p className="flex items-center gap-2 font-semibold text-primary"><MapPin size={16} />{o.delivery === 'PICKUP' ? 'Showroom pickup' : 'Delivery address'}</p><p className="mt-2 text-sm">{o.delivery === 'PICKUP' ? o.branchName : [o.address?.line1, o.address?.line2, o.address?.landmark, o.address?.city, o.address?.state, o.address?.pincode].filter(Boolean).join(', ')}</p></div>
          <a href={`https://wa.me/${config.contact.whatsappNumber}?text=${encodeURIComponent(`Hello, I need help with my order ${o.orderNo}.`)}`} target="_blank" rel="noreferrer" className="btn-whatsapp w-full"><WhatsAppIcon size={16} />Help with this order</a>
          {['PENDING_PAYMENT', 'CONFIRMED'].includes(o.status) && <button onClick={cancel} className="btn-outline w-full text-danger">Cancel order</button>}
        </div>
      </div>
    </>
  );
}
export default function OrderPage() { return <div className="section py-4 sm:py-6"><Suspense fallback={<Skeleton className="h-40" />}><Inner /></Suspense></div>; }

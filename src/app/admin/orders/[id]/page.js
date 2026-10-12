'use client';
import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useApi, patch } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { inr, fmtDateTime, titleCase } from '@/lib/format';
import { Badge, Img, Row, Skeleton, Spinner } from '@/components/ui/Bits';
import { AdminHeader, Detail } from '@/components/admin/AdminUI';

const STATUSES = ['PENDING_PAYMENT', 'CONFIRMED', 'PACKED', 'SHIPPED', 'READY_FOR_PICKUP', 'DELIVERED', 'CANCELLED'];

function Inner() {
  const { id } = useParams();
  const toast = useToast();
  const { data: o, error, mutate } = useApi(`/admin/orders/${id}`);
  const { data: customer } = useApi(o?.userId ? `/admin/users/${o.userId}` : null);
  const [status, setStatus] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  if (error) return <p className="text-muted">Order not found.</p>;
  if (!o) return <Skeleton className="h-64" />;

  const update = async (e) => {
    e.preventDefault(); setBusy(true);
    try { await patch(`/admin/ops/orders/${o.id}/status`, { status: status || o.status, note: note || undefined }); toast('Order updated'); setNote(''); setStatus(''); mutate(); }
    catch (err) { toast(err.message, 'error'); } finally { setBusy(false); }
  };

  return (
    <>
      <AdminHeader title={o.orderNo} subtitle={`Placed ${fmtDateTime(o.createdAt)} • ${o.source || 'WEB'}`} back="/admin/orders" actions={<Badge status={o.status} />} />
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <div className="card p-5">
            <p className="mb-3 font-semibold text-primary">Items</p>
            <ul className="divide-y divide-cream-dark">{o.items.map((i, k) => (
              <li key={k} className="flex items-center gap-3 py-3">
                <div className="h-14 w-14 overflow-hidden rounded-xl bg-cream"><Img src={i.image} alt="" className="h-full w-full object-cover" /></div>
                <div className="flex-1"><p className="text-sm font-semibold">{i.name}</p><p className="text-xs text-muted">{i.purity} • {i.netWeight} gm{i.size ? ` • Size ${i.size}` : ''} • Qty {i.qty}</p></div>
                <p className="font-semibold">{inr(i.lineTotal ?? i.unitPrice * i.qty)}</p>
              </li>))}
            </ul>
          </div>
          <div className="card p-5">
            <p className="mb-3 font-semibold text-primary">Timeline</p>
            <ol className="relative ml-2 border-l border-cream-dark">{o.timeline.map((t, k) => (
              <li key={k} className="mb-4 ml-4"><span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full bg-primary" /><p className="text-sm font-semibold">{titleCase(t.status)}</p><p className="text-xs text-muted">{fmtDateTime(t.at)}{t.note ? ` • ${t.note}` : ''}</p></li>))}
            </ol>
          </div>
        </div>
        <div className="space-y-4">
          <form onSubmit={update} className="card space-y-3 p-5">
            <p className="font-semibold text-primary">Update status</p>
            <select className="input" value={status || o.status} onChange={(e) => setStatus(e.target.value)}>{STATUSES.map((s) => <option key={s} value={s}>{titleCase(s)}</option>)}</select>
            <input className="input" placeholder="Note (optional), e.g. courier AWB" value={note} onChange={(e) => setNote(e.target.value)} />
            <button className="btn-primary w-full" disabled={busy || ((status || o.status) === o.status && !note)}>{busy ? <Spinner /> : 'Update order'}</button>
          </form>
          <div className="card p-5">
            <p className="font-semibold text-primary">Payment</p>
            <Row label="Item price" value={inr(o.subtotal - o.makingCharges)} /><Row label="Making charges" value={inr(o.makingCharges)} />
            {o.discount > 0 && <Row label={`Discount${o.couponCode ? ` (${o.couponCode})` : ''}`} value={`- ${inr(o.discount)}`} />}
            <Row label="GST" value={inr(o.gst)} /><Row label="Shipping" value={o.shipping ? inr(o.shipping) : 'FREE'} /><Row label="Total" value={inr(o.total)} bold />
            <p className="mt-2 text-xs text-muted">{o.payment?.method} • {o.payment?.status}</p>
          </div>
          <div className="card grid gap-4 p-5">
            <Detail label="Customer">{customer ? <Link href={`/admin/customers/${customer.id}`} className="font-semibold text-primary hover:underline">{customer.name || 'Unnamed'} • +91 {customer.mobile}</Link> : o.userId}</Detail>
            <Detail label={o.delivery === 'PICKUP' ? 'Showroom pickup' : 'Delivery address'}>{o.delivery === 'PICKUP' ? o.branchName : [o.address?.line1, o.address?.line2, o.address?.landmark, o.address?.city, o.address?.state, o.address?.pincode].filter(Boolean).join(', ')}</Detail>
          </div>
        </div>
      </div>
    </>
  );
}

export default function AdminOrderPage() { return <Suspense fallback={<Skeleton className="h-64" />}><Inner /></Suspense>; }

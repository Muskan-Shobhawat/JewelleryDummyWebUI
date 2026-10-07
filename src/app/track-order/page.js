'use client';
import { useState } from 'react';
import { PackageSearch } from 'lucide-react';
import { api } from '@/lib/api';
import { PageTitle, Badge, Spinner, Img } from '@/components/ui/Bits';
import { fmtDateTime, titleCase, inr } from '@/lib/format';

export default function TrackOrderPage() {
  const [f, setF] = useState({ orderNo: '', mobile: '' });
  const [res, setRes] = useState(null); const [busy, setBusy] = useState(false);
  const submit = async (e) => { e.preventDefault(); setBusy(true); try { const r = await api(`/orders/track?orderNo=${encodeURIComponent(f.orderNo.trim().toUpperCase())}&mobile=${f.mobile}`); setRes(r.data); } catch (err) { setRes({ error: err.message }); } finally { setBusy(false); } };
  return (
    <div className="section max-w-2xl py-4 sm:py-6">
      <PageTitle title="Track your order" subtitle="Enter the order number from your invoice and the mobile used at checkout." />
      <form onSubmit={submit} className="card grid gap-3 p-5 sm:grid-cols-[1fr_1fr_auto]"><input required className="input uppercase" placeholder="ORD-XXXX-XXXXX" value={f.orderNo} onChange={(e) => setF({ ...f, orderNo: e.target.value })} /><input required inputMode="numeric" maxLength={10} className="input" placeholder="Mobile number" value={f.mobile} onChange={(e) => setF({ ...f, mobile: e.target.value })} /><button disabled={busy} className="btn-primary">{busy ? <Spinner /> : <PackageSearch size={18} />}</button></form>
      {res && (res.error ? <p className="mt-4 text-sm text-danger">{res.error}</p> : <div className="card mt-4 p-5"><div className="flex items-center justify-between"><p className="font-semibold text-primary">{res.orderNo}</p><Badge status={res.status} /></div><ul className="mt-3 flex gap-3">{res.items.map((i, k) => <li key={k} className="flex items-center gap-2 text-sm"><div className="h-12 w-12 overflow-hidden rounded-lg bg-cream"><Img src={i.image} alt="" className="h-full w-full object-cover" /></div>{i.name} × {i.qty}</li>)}</ul><p className="mt-2 text-sm">Total {inr(res.total)} • {res.delivery === 'PICKUP' ? 'Showroom pickup' : 'Insured courier'}</p><ol className="relative ml-2 mt-4 border-l border-cream-dark">{res.timeline.map((t, k) => <li key={k} className="mb-3 ml-4"><span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full bg-primary" /><p className="text-sm font-semibold">{titleCase(t.status)}</p><p className="text-xs text-muted">{fmtDateTime(t.at)}</p></li>)}</ol></div>)}
    </div>
  );
}

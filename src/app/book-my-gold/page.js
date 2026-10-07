'use client';
import { useState } from 'react';
import { Lock, ShieldCheck, TrendingUp, TrendingDown } from 'lucide-react';
import { useApi, post } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { usePayment } from '@/context/PaymentContext';
import { useToast } from '@/context/ToastContext';
import { useConfig } from '@/context/ConfigContext';
import { Presets, Row, Badge, Spinner, Skeleton } from '@/components/ui/Bits';
import Modal from '@/components/ui/Modal';
import { SchemeHero, Divider } from '@/components/schemes/Shared';
import FaqAccordion from '@/components/schemes/FaqAccordion';
import { inr, fmtDate, cls } from '@/lib/format';

export default function BookGoldPage() {
  const { config } = useConfig();
  const { isLoggedIn, requireLogin } = useAuth();
  const { openCheckout } = usePayment();
  const toast = useToast();
  const { data: page, mutate } = useApi('/book-gold');
  const cfg = page?.config || config.bookGold;
  const [purity, setPurity] = useState('22K');
  const [grams, setGrams] = useState(10);
  const [branchId, setBranchId] = useState('');
  const [purpose, setPurpose] = useState('');
  const [busy, setBusy] = useState(false);
  const [cert, setCert] = useState(null);
  const { data: q } = useApi(grams > 0 ? `/book-gold/quote?purity=${purity}&grams=${grams}` : null, { refreshInterval: 15000 });

  const book = () => requireLogin(async () => {
    setBusy(true);
    try { const r = await post('/book-gold/bookings', { purity, grams: Number(grams), branchId: branchId || undefined, purpose: purpose || undefined }); openCheckout(r.data.payment, { onSuccess: (res) => { toast(`Rate locked at ${inr(res.booking.lockedRate)}/gm till ${fmtDate(res.booking.expiresAt)}`); mutate(); setCert(res.booking); }, onFailure: () => mutate() }); }
    catch (e) { toast(e.message, 'error'); } finally { setBusy(false); }
  });
  const cancel = async (b) => { if (!confirm('Cancel this booking? The advance will be refunded in 5-7 working days.')) return; try { await post(`/book-gold/bookings/${b.id}/cancel`); toast('Booking cancelled', 'info'); mutate(); } catch (e) { toast(e.message, 'error'); } };

  return (
    <div className="section space-y-6 py-4 sm:py-6">
      <SchemeHero title={cfg.title || 'Book My Gold'} titleHi="रेट लॉक" subtitle={cfg.subtitle}>
        <div className="mt-4 flex flex-wrap gap-2 text-xs"><span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5"><TrendingUp size={14} className="text-emerald-300" />Zero loss if gold price spikes</span><span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5"><TrendingDown size={14} className="text-accent" />Pay the lower rate if it falls</span><span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5"><ShieldCheck size={14} />{cfg.advancePct}% refundable advance</span></div>
      </SchemeHero>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <p className="flex items-center gap-2 font-semibold text-primary"><Lock size={18} />Lock today&apos;s rate</p>
          <p className="label mt-4">Purity</p>
          <div className="grid grid-cols-2 gap-2">{[['22K', 'Ideal for jewellery', '916'], ['24K', 'Pure bullion', '999']].map(([k, l, pu]) => <button key={k} onClick={() => setPurity(k)} className={cls('rounded-xl border p-3 text-left', purity === k ? 'border-primary bg-cream/60' : 'border-cream-dark')}><p className="text-sm font-bold">{k} <span className="text-xs font-normal text-muted">({pu})</span></p><p className="text-xs text-muted">{l}</p></button>)}</div>
          <label className="label mt-4">Weight (grams)</label><input type="number" min={cfg.minGrams} className="input text-lg font-semibold" value={grams} onChange={(e) => setGrams(e.target.value)} />
          <Presets className="mt-2" values={cfg.presets || []} value={Number(grams)} onChange={setGrams} format={(v) => `${v} gm`} />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div><label className="label">Showroom</label><select className="input" value={branchId} onChange={(e) => setBranchId(e.target.value)}><option value="">Flagship (default)</option>{(page?.branches || []).map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select></div>
            <div><label className="label">Purpose</label><select className="input" value={purpose} onChange={(e) => setPurpose(e.target.value)}><option value="">Select</option>{(cfg.purposes || []).map((p) => <option key={p}>{p}</option>)}</select></div>
          </div>
          <div className="mt-4 rounded-xl bg-cream/70 p-3">{q ? <><Row label={`${purity} rate (live)`} value={`${inr(q.rate)} / gm`} /><Row label="Total bullion value" value={inr(q.totalValue)} /><Row label={`Advance (${q.advancePct}%, refundable)`} value={inr(q.advanceAmount)} bold /><Row label="Balance at purchase" value={inr(q.balanceDue)} /><Row label="Lock valid till" value={fmtDate(q.expiresAt)} /></> : <Skeleton className="h-28" />}</div>
          <button onClick={book} disabled={busy || !q} className="btn-primary mt-4 w-full">{busy ? <Spinner /> : `Pay advance ${q ? inr(q.advanceAmount) : ''} and lock rate`}</button>
        </div>
        <div className="space-y-4">
          <p className="font-semibold text-primary">My bookings</p>
          {!isLoggedIn ? <p className="card p-5 text-sm text-muted">Login to see your rate-lock certificates. <button onClick={() => requireLogin()} className="font-semibold text-primary underline">Login</button></p>
            : !(page?.bookings || []).length ? <p className="card p-5 text-sm text-muted">No bookings yet. Lock a rate before your next big purchase.</p>
            : page.bookings.map((b) => (
              <div key={b.id} className="card p-4">
                <div className="flex items-start justify-between gap-3"><div><p className="text-xs text-muted">{b.bookingNo}{b.certificateNo ? ` • Certificate ${b.certificateNo}` : ''}</p><p className="text-lg font-bold text-primary">{b.grams} gm {b.purity} @ {inr(b.lockedRate)}/gm</p><p className="text-xs text-muted">{b.purpose} • {b.branchName}</p></div><Badge status={b.status} /></div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs"><div className="rounded-lg bg-cream/60 p-2"><p className="text-muted">Advance paid</p><p className="font-bold">{inr(b.advanceAmount)}</p></div><div className="rounded-lg bg-cream/60 p-2"><p className="text-muted">Balance</p><p className="font-bold">{inr(b.balanceDue)}</p></div><div className="rounded-lg bg-cream/60 p-2"><p className="text-muted">{b.status === 'LOCKED' ? 'Days left' : 'Expires'}</p><p className="font-bold">{b.status === 'LOCKED' ? b.daysLeft : fmtDate(b.expiresAt)}</p></div></div>
                {b.status === 'LOCKED' && <div className="mt-3 flex gap-2"><button onClick={() => setCert(b)} className="btn-primary flex-1 !py-2 text-xs">View certificate</button><button onClick={() => cancel(b)} className="btn-outline !py-2 text-xs">Cancel</button></div>}
              </div>))}
        </div>
      </div>
      <div><Divider label="FAQ's" /><div className="mt-3"><FaqAccordion faqs={page?.faqs || []} /></div></div>

      <Modal open={!!cert} onClose={() => setCert(null)} title="Rate lock certificate" size="sm">
        {cert && <div className="rounded-2xl border-2 border-dashed border-accent bg-cream/50 p-5 text-center">
          <p className="font-heading text-xl text-primary">{config.brand.name}</p><p className="text-[11px] uppercase tracking-[0.2em] text-muted">Book My Gold</p>
          <p className="mt-4 text-3xl font-bold text-primary">{inr(cert.lockedRate)}<span className="text-sm font-normal text-muted"> / gm {cert.purity}</span></p>
          <p className="text-sm">{cert.grams} gm locked • Advance {inr(cert.advanceAmount)} paid</p>
          <div className="mt-4 grid grid-cols-2 gap-2 text-left text-xs"><div><p className="text-muted">Certificate</p><p className="font-semibold">{cert.certificateNo}</p></div><div><p className="text-muted">Booking</p><p className="font-semibold">{cert.bookingNo}</p></div><div><p className="text-muted">Booked on</p><p className="font-semibold">{fmtDate(cert.bookedAt)}</p></div><div><p className="text-muted">Valid till</p><p className="font-semibold">{fmtDate(cert.expiresAt)}</p></div><div className="col-span-2"><p className="text-muted">Showroom</p><p className="font-semibold">{cert.branchName}</p></div></div>
          <p className="mt-4 text-[11px] text-muted">Present this certificate at the counter. The full advance is adjusted in your bill.</p>
        </div>}
      </Modal>
    </div>
  );
}

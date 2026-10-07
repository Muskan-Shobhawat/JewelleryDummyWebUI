'use client';
import { useState } from 'react';
import { Gift, Search } from 'lucide-react';
import { useApi, post, api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { usePayment } from '@/context/PaymentContext';
import { useToast } from '@/context/ToastContext';
import { useConfig } from '@/context/ConfigContext';
import { Presets, Badge, Spinner, PageTitle } from '@/components/ui/Bits';
import { inr, fmtDate } from '@/lib/format';

export default function GiftCardsPage() {
  const { config } = useConfig();
  const { isLoggedIn, requireLogin } = useAuth();
  const { openCheckout } = usePayment();
  const toast = useToast();
  const { data, mutate } = useApi('/gift-cards');
  const cfg = data?.config || config.giftCards;
  const [form, setForm] = useState({ amount: 2000, recipientName: '', recipientMobile: '', message: '' });
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState('');
  const [check, setCheck] = useState(null);
  const f = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const buy = (e) => { e.preventDefault(); requireLogin(async () => { setBusy(true); try { const r = await post('/gift-cards', { ...form, amount: Number(form.amount) }); openCheckout(r.data.payment, { onSuccess: (res) => { toast(`Gift card ${res.card.code} issued to ${res.card.recipientName}`); mutate(); } }); } catch (err) { toast(err.message, 'error'); } finally { setBusy(false); } }); };
  const lookup = async (e) => { e.preventDefault(); try { const r = await api(`/gift-cards/check/${encodeURIComponent(code.trim())}`); setCheck(r.data); } catch (err) { setCheck({ error: err.message }); } };

  return (
    <div className="section py-4 sm:py-6">
      <PageTitle title="Gift Cards" subtitle={`Gift gold, the ${config.brand.shortName} way. Redeemable on jewellery and Digi Gold at any showroom or online.`} />
      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={buy} className="card p-5">
          <div className="mb-4 rounded-2xl bg-gradient-to-br from-primary to-primary-light p-5 text-white"><p className="font-heading text-xl">{config.brand.name}</p><p className="text-[11px] uppercase tracking-[0.2em] text-accent-light">Gift card</p><p className="mt-6 text-3xl font-bold">{inr(form.amount)}</p><p className="text-xs opacity-80">For {form.recipientName || 'someone special'}</p></div>
          <p className="label">Amount</p><Presets values={cfg.presets || []} value={Number(form.amount)} onChange={(v) => setForm({ ...form, amount: v })} format={(v) => inr(v)} />
          <input type="number" min={cfg.minAmount} max={cfg.maxAmount} className="input mt-2" value={form.amount} onChange={f('amount')} />
          <div className="mt-3 grid gap-3 sm:grid-cols-2"><div><label className="label">Recipient name</label><input required className="input" value={form.recipientName} onChange={f('recipientName')} /></div><div><label className="label">Recipient mobile</label><input required inputMode="numeric" maxLength={10} className="input" value={form.recipientMobile} onChange={f('recipientMobile')} /></div></div>
          <label className="label mt-3">Message (optional)</label><input className="input" maxLength={200} value={form.message} onChange={f('message')} />
          <button disabled={busy} className="btn-primary mt-4 w-full">{busy ? <Spinner /> : <><Gift size={16} />Buy gift card {inr(form.amount)}</>}</button>
          <p className="mt-2 text-center text-[11px] text-muted">Valid for {cfg.validityDays} days. Delivered on SMS and WhatsApp to the recipient.</p>
        </form>
        <div className="space-y-6">
          <form onSubmit={lookup} className="card p-5"><p className="font-semibold text-primary">Check balance</p><div className="mt-3 flex gap-2"><input className="input font-mono uppercase" placeholder="KJGC-XXXX-XXXX-XX" value={code} onChange={(e) => setCode(e.target.value)} /><button className="btn-primary shrink-0"><Search size={16} /></button></div>
            {check && (check.error ? <p className="mt-3 text-sm text-danger">{check.error}</p> : <div className="mt-3 rounded-xl bg-cream/70 p-3 text-sm"><div className="flex justify-between"><span className="font-mono">{check.code}</span><Badge status={check.status} /></div><p className="mt-1">Balance <b>{inr(check.balance)}</b> of {inr(check.amount)} • for {check.recipientName} • expires {fmtDate(check.expiresAt)}</p></div>)}</form>
          <div className="card p-5"><p className="font-semibold text-primary">My gift cards</p>
            {!isLoggedIn ? <p className="mt-2 text-sm text-muted">Login to see cards you have purchased.</p> : !(data?.mine || []).length ? <p className="mt-2 text-sm text-muted">No gift cards yet.</p> : <ul className="mt-3 divide-y divide-cream-dark">{data.mine.map((g) => <li key={g.id} className="flex items-center justify-between py-3 text-sm"><div><p className="font-mono font-semibold">{g.code}</p><p className="text-xs text-muted">For {g.recipientName} • {fmtDate(g.createdAt)}</p></div><div className="text-right"><p className="font-bold">{inr(g.balance)}</p><Badge status={g.status} /></div></li>)}</ul>}</div>
        </div>
      </div>
    </div>
  );
}

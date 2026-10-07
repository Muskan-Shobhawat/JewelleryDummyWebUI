'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowDownToLine, ArrowUpFromLine, HandCoins, Gift, Wallet } from 'lucide-react';
import { useApi, post } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { usePayment } from '@/context/PaymentContext';
import { useToast } from '@/context/ToastContext';
import { Presets, Row, Stat, Spinner, Badge, Skeleton } from '@/components/ui/Bits';
import { SchemeHero, Benefits, Divider } from '@/components/schemes/Shared';
import FaqAccordion from '@/components/schemes/FaqAccordion';
import { inr, inr2, gm, pct, fmtDateTime, cls } from '@/lib/format';

const TABS = [{ key: 'buy', label: 'Buy', I: ArrowDownToLine }, { key: 'sell', label: 'Sell', I: ArrowUpFromLine }, { key: 'lease', label: 'Lease', I: HandCoins }, { key: 'redeem', label: 'Redeem', I: Gift }];

export default function DigiGoldPage() {
  const { isLoggedIn, user, requireLogin } = useAuth();
  const { openCheckout } = usePayment();
  const toast = useToast();
  const { data: page } = useApi('/digi-gold');
  const { data: pf, mutate } = useApi(isLoggedIn ? '/digi-gold/portfolio' : null, { refreshInterval: 30000 });
  const [tab, setTab] = useState('buy');
  const cfg = page?.config;

  return (
    <div className="section space-y-6 py-4 sm:py-6">
      <SchemeHero title={cfg?.title || 'Digi Gold'} titleHi="डिजी गोल्ड" subtitle={cfg?.subtitle}>
        {pf && <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl bg-white/10 p-3"><p className="text-[11px] uppercase tracking-wide opacity-75">Gold balance</p><p className="text-xl font-bold">{gm(pf.grams)}</p><p className="text-[11px] opacity-75">{pf.purity}</p></div>
          <div className="rounded-xl bg-white/10 p-3"><p className="text-[11px] uppercase tracking-wide opacity-75">Current value</p><p className="text-xl font-bold">{inr(pf.currentValue)}</p><p className={cls('text-[11px]', pf.pnl >= 0 ? 'text-emerald-300' : 'text-rose-300')}>{pf.pnl >= 0 ? '+' : ''}{inr(pf.pnl)} ({pct(pf.pnlPct)})</p></div>
          <div className="rounded-xl bg-white/10 p-3"><p className="text-[11px] uppercase tracking-wide opacity-75">Buy rate</p><p className="text-xl font-bold">{inr(pf.buyRate)}</p><p className="text-[11px] opacity-75">per gm 24K</p></div>
          <div className="rounded-xl bg-white/10 p-3"><p className="text-[11px] uppercase tracking-wide opacity-75">Sell rate</p><p className="text-xl font-bold">{inr(pf.sellRate)}</p><p className="text-[11px] opacity-75">per gm 24K</p></div>
        </div>}
      </SchemeHero>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="card overflow-hidden">
          <div className="grid grid-cols-4 bg-primary text-white">{TABS.map((t) => <button key={t.key} onClick={() => setTab(t.key)} className={cls('flex flex-col items-center gap-1 py-3 text-xs font-semibold transition', tab === t.key ? 'bg-primary-dark text-accent' : 'opacity-85 hover:opacity-100')}><t.I size={20} />{t.label}</button>)}</div>
          <div className="p-4 sm:p-5">
            {!cfg ? <Skeleton className="h-48" /> : tab === 'buy' ? <BuyPanel cfg={cfg} requireLogin={requireLogin} openCheckout={openCheckout} toast={toast} onDone={mutate} /> : tab === 'sell' ? <SellPanel pf={pf} user={user} isLoggedIn={isLoggedIn} requireLogin={requireLogin} toast={toast} onDone={mutate} /> : tab === 'lease' ? <LeasePanel cfg={cfg} pf={pf} requireLogin={requireLogin} toast={toast} onDone={mutate} /> : <RedeemPanel cfg={cfg} pf={pf} requireLogin={requireLogin} toast={toast} onDone={mutate} />}
          </div>
        </div>
        <div className="space-y-6">
          <div className="card p-5"><Divider label="Digital Gold Benefit" /><div className="mt-3"><Benefits items={cfg?.benefits || []} /></div><p className="mt-4 text-[11px] text-muted">Vault: {cfg?.vaultPartner} • Trustee: {cfg?.trustee}</p></div>
          {pf?.recent?.length > 0 && <div className="card p-5"><div className="mb-3 flex items-center justify-between"><p className="font-semibold text-primary">Recent activity</p><Link href="/transactions?type=DIGI_GOLD" className="text-xs font-semibold text-primary underline">View all</Link></div><ul className="divide-y divide-cream-dark">{pf.recent.slice(0, 5).map((t) => <li key={t.id} className="flex items-center justify-between py-2.5 text-sm"><div><p className="font-medium">{t.title}</p><p className="text-xs text-muted">{fmtDateTime(t.createdAt)}</p></div><div className="text-right"><p className="font-semibold">{inr(t.amount)}</p><Badge status={t.status} /></div></li>)}</ul></div>}
        </div>
      </div>

      <div><Divider label="FAQ's" /><div className="mt-3"><FaqAccordion faqs={(page?.faqs || []).filter((f) => f.section === `digigold-${tab}`)} /></div></div>
    </div>
  );
}

function useQuote(params) {
  const qs = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v))).toString();
  const enabled = params.amount > 0 || params.grams > 0;
  return useApi(enabled ? `/digi-gold/quote?${qs}` : null, { refreshInterval: 15000 });
}

function BuyPanel({ cfg, requireLogin, openCheckout, toast, onDone }) {
  const [mode, setMode] = useState('amount');
  const [amount, setAmount] = useState(1000);
  const [grams, setGrams] = useState(1);
  const [busy, setBusy] = useState(false);
  const { data: q, error } = useQuote(mode === 'amount' ? { side: 'buy', amount } : { side: 'buy', grams });
  const buy = () => requireLogin(async () => {
    setBusy(true);
    try { const r = await post('/digi-gold/buy', mode === 'amount' ? { amount: Number(amount) } : { grams: Number(grams) }); openCheckout(r.data.payment, { onSuccess: (res) => { toast(`${gm(res.txn.grams)} of 24K gold credited to your vault`); onDone(); } }); }
    catch (e) { toast(e.message, 'error'); } finally { setBusy(false); }
  });
  return (
    <div>
      <div className="mb-3 flex gap-2"><button onClick={() => setMode('amount')} className={cls('chip', mode === 'amount' ? 'chip-active' : 'chip-idle')}>In rupees</button><button onClick={() => setMode('grams')} className={cls('chip', mode === 'grams' ? 'chip-active' : 'chip-idle')}>In grams</button></div>
      {mode === 'amount' ? <><label className="label">Amount (₹)</label><input type="number" min={cfg.minAmount} className="input text-lg font-semibold" value={amount} onChange={(e) => setAmount(e.target.value)} /><Presets className="mt-2" values={cfg.buyPresets} value={Number(amount)} onChange={setAmount} format={(v) => inr(v)} /></>
        : <><label className="label">Grams</label><input type="number" step="0.001" min={cfg.minGrams} className="input text-lg font-semibold" value={grams} onChange={(e) => setGrams(e.target.value)} /><Presets className="mt-2" values={[0.1, 0.5, 1, 2, 5]} value={Number(grams)} onChange={setGrams} format={(v) => `${v} gm`} /></>}
      <div className="mt-4 rounded-xl bg-cream/70 p-3">
        {error ? <p className="text-sm text-danger">{error.message}</p> : q ? <><Row label={`24K rate (live)`} value={`${inr2(q.rate)} / gm`} /><Row label="You get" value={gm(q.grams)} /><Row label="Pure gold value" value={inr2(q.base)} /><Row label={`GST ${q.gstPct}%`} value={inr2(q.gst)} /><Row label="Total payable" value={inr(q.total)} bold /></> : <Skeleton className="h-24" />}
      </div>
      <button onClick={buy} disabled={busy || !q} className="btn-primary mt-4 w-full">{busy ? <Spinner /> : `Buy gold ${q ? inr(q.total) : ''}`}</button>
      <p className="mt-2 text-center text-[11px] text-muted">Minimum ₹{cfg.minAmount} or {cfg.minGrams} gm • No lock-in • Sell anytime</p>
    </div>
  );
}

function SellPanel({ pf, user, isLoggedIn, requireLogin, toast, onDone }) {
  const [grams, setGrams] = useState('');
  const [busy, setBusy] = useState(false);
  const { data: q } = useQuote({ side: 'sell', grams });
  const sell = (sellAll) => requireLogin(async () => {
    setBusy(true);
    try { const r = await post('/digi-gold/sell', sellAll ? { sellAll: true } : { grams: Number(grams) }); toast(`${r.message} ${inr(r.data.quote.payout)} to ${user?.bank?.bankName}`); setGrams(''); onDone(); }
    catch (e) { toast(e.message, 'error'); } finally { setBusy(false); }
  });
  if (!isLoggedIn) return <p className="py-6 text-center text-sm text-muted">Login to view your vault and sell gold. <button onClick={() => requireLogin()} className="font-semibold text-primary underline">Login</button></p>;
  return (
    <div>
      <div className="mb-3 grid grid-cols-2 gap-2"><Stat label="Available" value={gm(pf?.availableGrams)} sub={pf?.leasedGrams ? `${gm(pf.leasedGrams)} on lease` : 'Ready to sell'} /><Stat label="Selling benchmark" value={`${inr(pf?.sellRate)}/gm`} sub="Live, includes spread" /></div>
      <label className="label">Grams to sell</label><input type="number" step="0.001" className="input text-lg font-semibold" value={grams} onChange={(e) => setGrams(e.target.value)} placeholder="0.000" />
      <div className="mt-4 rounded-xl bg-cream/70 p-3">{q ? <><Row label="Rate" value={`${inr2(q.rate)} / gm`} /><Row label="Estimated payout" value={inr(q.payout)} bold /></> : <p className="text-sm text-muted">Enter grams to see your payout.</p>}</div>
      {user?.bank?.verified ? <p className="mt-3 flex items-center gap-2 text-xs text-muted"><Wallet size={14} className="text-success" />Instant IMPS payout to {user.bank.bankName} {user.bank.accountNumberMasked}</p> : <p className="mt-3 text-xs text-danger">Link a bank account in <Link href="/profile" className="underline">Profile</Link> to receive payouts.</p>}
      <div className="mt-4 grid grid-cols-2 gap-2"><button onClick={() => sell(false)} disabled={busy || !q} className="btn-primary">{busy ? <Spinner /> : 'Sell'}</button><button onClick={() => sell(true)} disabled={busy || !pf?.availableGrams} className="btn-outline">Sell all</button></div>
    </div>
  );
}

function LeasePanel({ cfg, pf, requireLogin, toast, onDone }) {
  const [grams, setGrams] = useState(1);
  const [months, setMonths] = useState(cfg.lease?.tenureMonths?.[1] || 6);
  const [busy, setBusy] = useState(false);
  const yieldGrams = (Number(grams) * (cfg.lease.yieldPctPerYear / 100) * (months / 12)).toFixed(3);
  const lease = () => requireLogin(async () => { setBusy(true); try { const r = await post('/digi-gold/lease', { grams: Number(grams), months: Number(months) }); toast(`${r.message}: earn ${gm(r.data.lease.yieldGrams)} extra`); onDone(); } catch (e) { toast(e.message, 'error'); } finally { setBusy(false); } });
  return (
    <div>
      <p className="mb-3 text-sm text-muted">Lease your vault gold to the jeweller and earn {cfg.lease.yieldPctPerYear}% per year, paid in gold, on top of price appreciation.</p>
      <label className="label">Grams to lease {pf && <span className="normal-case">(available {gm(pf.availableGrams)})</span>}</label><input type="number" step="0.001" min={cfg.lease.minGrams} className="input text-lg font-semibold" value={grams} onChange={(e) => setGrams(e.target.value)} />
      <p className="label mt-3">Tenure</p><Presets values={cfg.lease.tenureMonths} value={Number(months)} onChange={setMonths} format={(v) => `${v} months`} />
      <div className="mt-4 rounded-xl bg-cream/70 p-3"><Row label="Yield" value={`${cfg.lease.yieldPctPerYear}% p.a.`} /><Row label="You earn (approx.)" value={`${yieldGrams} gm`} bold /></div>
      <button onClick={lease} disabled={busy} className="btn-primary mt-4 w-full">{busy ? <Spinner /> : 'Start lease'}</button>
    </div>
  );
}

function RedeemPanel({ cfg, pf, requireLogin, toast, onDone }) {
  const [type, setType] = useState('VOUCHER');
  const [grams, setGrams] = useState(1);
  const [busy, setBusy] = useState(false);
  const pick = (t) => { setType(t); if (t === 'COIN' && !cfg.redeem.coins.includes(Number(grams))) setGrams(cfg.redeem.coins[1] || 1); };
  const redeem = () => requireLogin(async () => { setBusy(true); try { const r = await post('/digi-gold/redeem', { type, grams: Number(grams) }); toast(`${r.message}. Ref ${r.data.redemption.voucherNo}`); onDone(); } catch (e) { toast(e.message, 'error'); } finally { setBusy(false); } });
  return (
    <div>
      <div className="mb-3 grid grid-cols-2 gap-2">{[['VOUCHER', 'Jewellery voucher', `${cfg.redeem.makingChargeWaiverPct}% off making charges`], ['COIN', 'Gold coin', 'Certified, home delivered']].map(([k, l, s]) => <button key={k} onClick={() => pick(k)} className={cls('rounded-xl border p-3 text-left', type === k ? 'border-primary bg-cream/60' : 'border-cream-dark')}><p className="text-sm font-semibold">{l}</p><p className="text-xs text-muted">{s}</p></button>)}</div>
      {type === 'COIN' ? <><p className="label">Coin size</p><Presets values={cfg.redeem.coins} value={Number(grams)} onChange={setGrams} format={(v) => `${v} gm`} /></> : <><label className="label">Grams to convert {pf && <span className="normal-case">(available {gm(pf.availableGrams)})</span>}</label><input type="number" step="0.001" className="input text-lg font-semibold" value={grams} onChange={(e) => setGrams(e.target.value)} /></>}
      <button onClick={redeem} disabled={busy} className="btn-primary mt-4 w-full">{busy ? <Spinner /> : type === 'COIN' ? 'Order coin' : 'Generate voucher'}</button>
      <p className="mt-2 text-center text-[11px] text-muted">{type === 'COIN' ? 'Delivery in 5-7 working days, fully insured.' : 'Present the voucher at any showroom. Gold value is adjusted in your bill.'}</p>
    </div>
  );
}

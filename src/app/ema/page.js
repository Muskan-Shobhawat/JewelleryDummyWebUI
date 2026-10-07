'use client';
import { useState } from 'react';
import { CalendarCheck, PiggyBank, Repeat } from 'lucide-react';
import { useApi, post, patch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { usePayment } from '@/context/PaymentContext';
import { useToast } from '@/context/ToastContext';
import { useConfig } from '@/context/ConfigContext';
import { Presets, Row, Badge, Spinner, Skeleton, Tabs } from '@/components/ui/Bits';
import { SchemeHero, Divider } from '@/components/schemes/Shared';
import FaqAccordion from '@/components/schemes/FaqAccordion';
import { inr, gm, fmtDate, cls } from '@/lib/format';

export default function EmaPage() {
  const { config } = useConfig();
  const { isLoggedIn, requireLogin } = useAuth();
  const { openCheckout } = usePayment();
  const toast = useToast();
  const { data: page, mutate } = useApi('/ema');
  const cfg = page?.config || config.ema;
  const [monthly, setMonthly] = useState(10000);
  const [autopay, setAutopay] = useState(true);
  const [busy, setBusy] = useState(false);
  const { data: calc } = useApi(cfg.minMonthly ? `/ema/calculate?monthly=${monthly}` : null);
  const plans = page?.plans || [];

  const enrol = () => requireLogin(async () => {
    setBusy(true);
    try { const r = await post('/ema/enrol', { monthlyAmount: Number(monthly), autopay }); openCheckout(r.data.payment, { onSuccess: () => { toast(`Plan ${r.data.plan.planNo} is active. First instalment received.`); mutate(); }, onFailure: () => mutate() }); }
    catch (e) { toast(e.message, 'error'); } finally { setBusy(false); }
  });
  const payNow = async (plan, n) => {
    try { const r = await post(`/ema/plans/${plan.id}/pay`, n ? { installment: n } : {}); openCheckout(r.data.payment, { onSuccess: (res) => { toast(`Instalment ${res.txn.meta.installment} paid. ${gm(res.txn.grams)} of 22K gold credited.`); mutate(); } }); }
    catch (e) { toast(e.message, 'error'); }
  };
  const toggleAutopay = async (plan) => { try { await patch(`/ema/plans/${plan.id}/autopay`, { enabled: !plan.autopay?.enabled, method: cfg.autopayMethods?.[0] }); toast(plan.autopay?.enabled ? 'Autopay disabled' : 'Autopay enabled', 'info'); mutate(); } catch (e) { toast(e.message, 'error'); } };

  return (
    <div className="section space-y-6 py-4 sm:py-6">
      <SchemeHero title={cfg.title} titleHi={cfg.titleHi} subtitle={`${cfg.subtitle || ''} Start with ${inr(cfg.minMonthly)} and go up to ${inr(cfg.maxMonthly)} per month.`} />

      {isLoggedIn && plans.length > 0 && <section className="space-y-4">{plans.map((p) => <PlanCard key={p.id} plan={p} onPay={payNow} onAutopay={toggleAutopay} cfg={cfg} />)}</section>}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <p className="flex items-center gap-2 font-semibold text-primary"><PiggyBank size={18} />{plans.length ? 'Start another plan' : 'Plan calculator'}</p>
          <label className="label mt-4">Monthly instalment</label>
          <input type="range" min={cfg.minMonthly} max={cfg.maxMonthly} step={cfg.step || 500} value={monthly} onChange={(e) => setMonthly(Number(e.target.value))} className="w-full accent-primary" />
          <div className="mt-2 flex items-center justify-between"><span className="text-xs text-muted">{inr(cfg.minMonthly)}</span><input type="number" className="input w-36 text-center text-lg font-bold" value={monthly} min={cfg.minMonthly} max={cfg.maxMonthly} step={cfg.step || 500} onChange={(e) => setMonthly(Number(e.target.value))} /><span className="text-xs text-muted">{inr(cfg.maxMonthly)}</span></div>
          <Presets className="mt-3" values={cfg.presets || []} value={monthly} onChange={setMonthly} format={(v) => inr(v)} />
          <div className="mt-4 rounded-xl bg-cream/70 p-3">
            {calc ? <><Row label={`You pay (${calc.tenureMonths} months)`} value={inr(calc.youPay)} /><Row label={`Bonus (${calc.bonusMonths} month, from us)`} value={<span className="font-semibold text-success">+ {inr(calc.bonus)} FREE</span>} /><Row label="Total jewellery value" value={inr(calc.totalValue)} bold /><Row label="Approx. 22K gold accumulated" value={gm(calc.approxGrams22k)} /><Row label="Maturity" value={fmtDate(calc.maturityDate)} /></> : <Skeleton className="h-28" />}
          </div>
          <label className="mt-4 flex items-center gap-3 rounded-xl border border-cream-dark px-4 py-3 text-sm"><input type="checkbox" checked={autopay} onChange={(e) => setAutopay(e.target.checked)} className="h-4 w-4 accent-primary" /><span className="flex-1"><span className="font-semibold">Enable autopay</span><span className="block text-xs text-muted">{(cfg.autopayMethods || []).join(' or ')}. Never miss an instalment.</span></span><Repeat size={16} className="text-primary" /></label>
          <button onClick={enrol} disabled={busy || !calc} className="btn-primary mt-4 w-full">{busy ? <Spinner /> : `Enrol and pay first ${inr(monthly)}`}</button>
        </div>
        <div className="rounded-2xl bg-primary p-5 text-white sm:p-6">
          <p className="text-center font-heading text-lg uppercase tracking-wider text-accent">{config.brand.name}</p>
          <p className="mt-1 text-center text-xl font-bold">Pay {cfg.tenureMonths} Easy Instalments</p>
          <p className="mt-3 text-center text-sm opacity-90">Accumulate gold worth the instalment amount every month. Purchase jewellery equal to the accumulated gold weight without paying value addition*, irrespective of the prevailing gold rate.</p>
          <p className="mt-3 text-center text-lg font-bold">Exemption on value addition up to {cfg.makingChargeWaiverPct}%*</p>
          <p className="mt-4 text-center font-semibold">Let&apos;s look at an example:</p>
          <p className="mt-1 text-center text-sm opacity-90">{cfg.example}</p>
          <ul className="mt-5 space-y-1.5 text-xs opacity-80">{(cfg.terms || []).map((t) => <li key={t}>• {t}</li>)}</ul>
        </div>
      </div>
      <div><Divider label="FAQ's" /><div className="mt-3"><FaqAccordion faqs={page?.faqs || []} /></div></div>
    </div>
  );
}

function PlanCard({ plan: p, onPay, onAutopay, cfg }) {
  const [tab, setTab] = useState('upcoming');
  const rows = tab === 'upcoming' ? p.upcoming : p.completed;
  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-cream/70 px-5 py-4">
        <div><p className="text-xs text-muted">Plan {p.planNo}</p><p className="text-lg font-bold text-primary">{inr(p.monthlyAmount)} / month</p></div>
        <div className="flex items-center gap-3"><Badge status={p.status} /><button onClick={() => onAutopay(p)} className={cls('chip', p.autopay?.enabled ? 'chip-active' : 'chip-idle')}><Repeat size={12} className="mr-1" />Autopay {p.autopay?.enabled ? 'on' : 'off'}</button></div>
      </div>
      <div className="grid gap-4 px-5 py-4 md:grid-cols-[1fr_1.4fr]">
        <div>
          <div className="mb-1 flex justify-between text-xs"><span className="font-semibold text-primary">Month {p.paidCount} of {p.tenureMonths}</span><span className="text-muted">Matures {fmtDate(p.maturityDate)}</span></div>
          <div className="h-2.5 overflow-hidden rounded-full bg-cream-dark"><div className="h-full rounded-full bg-accent" style={{ width: `${p.progressPct}%` }} /></div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm"><div className="rounded-xl bg-cream/60 p-3"><p className="text-[11px] uppercase text-muted">Paid so far</p><p className="font-bold text-primary">{inr(p.totalPaid)}</p></div><div className="rounded-xl bg-cream/60 p-3"><p className="text-[11px] uppercase text-muted">Gold accumulated</p><p className="font-bold text-primary">{gm(p.goldAccumulatedGrams)}</p></div><div className="rounded-xl bg-cream/60 p-3"><p className="text-[11px] uppercase text-muted">Bonus on maturity</p><p className="font-bold text-success">+ {inr(p.bonusAmount)}</p></div><div className="rounded-xl bg-cream/60 p-3"><p className="text-[11px] uppercase text-muted">Making charge waiver</p><p className="font-bold text-primary">up to {cfg.makingChargeWaiverPct}%</p></div></div>
          {p.status === 'MATURED' && <p className="mt-3 flex items-center gap-2 rounded-xl bg-accent/20 px-3 py-2 text-xs font-semibold text-primary-dark"><CalendarCheck size={14} />Plan matured. Visit a showroom to redeem {inr(p.totalPaid + p.bonusAmount)} worth of jewellery.</p>}
        </div>
        <div>
          <Tabs tabs={[{ key: 'upcoming', label: "Upcoming EMI's", count: p.upcoming.length }, { key: 'completed', label: "Completed EMI's", count: p.completed.length }]} value={tab} onChange={setTab} className="mb-3" />
          <ul className="space-y-2">
            {rows.slice(0, tab === 'upcoming' ? 3 : 12).map((i) => (
              <li key={i.n} className={cls('flex items-center justify-between rounded-xl border px-4 py-3', i.status === 'DUE' ? 'border-amber-300 bg-amber-50' : 'border-cream-dark')}>
                <div><p className="text-sm font-semibold">{fmtDate(i.dueDate)} <span className="text-xs font-normal text-muted">• #{i.n}</span></p><p className="text-xs text-muted">{inr(i.amount)}{i.grams ? ` • ${gm(i.grams)} @ ${inr(i.rate)}` : ''}{i.method ? ` • ${i.method}` : ''}</p></div>
                {['DUE', 'UPCOMING'].includes(i.status) && i.n === p.nextInstallment?.n ? <button onClick={() => onPay(p, i.n)} className="btn-primary !px-4 !py-2 text-xs">Pay Now</button> : <Badge status={i.status} />}
              </li>))}
            {!rows.length && <li className="py-4 text-center text-sm text-muted">Nothing here yet.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}

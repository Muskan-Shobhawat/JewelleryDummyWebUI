'use client';
import { useState } from 'react';
import { Landmark, QrCode } from 'lucide-react';
import { useApi, post } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { usePayment } from '@/context/PaymentContext';
import { useToast } from '@/context/ToastContext';
import { useConfig } from '@/context/ConfigContext';
import { Presets, Row, Badge, Spinner, Skeleton, Stat } from '@/components/ui/Bits';
import Modal from '@/components/ui/Modal';
import { SchemeHero, Divider } from '@/components/schemes/Shared';
import FaqAccordion from '@/components/schemes/FaqAccordion';
import { inr, gm, fmtDate } from '@/lib/format';

export default function AdvanceGoldPage() {
  const { config } = useConfig();
  const { isLoggedIn, user, requireLogin } = useAuth();
  const { openCheckout } = usePayment();
  const toast = useToast();
  const { data: page, mutate } = useApi('/advance-gold');
  const cfg = page?.config || config.advanceGold;
  const [amount, setAmount] = useState(25000);
  const [busy, setBusy] = useState(false);
  const [pass, setPass] = useState(null);
  const { data: q } = useApi(amount > 0 ? `/advance-gold/quote?amount=${amount}` : null, { refreshInterval: 15000 });
  const deposit = () => requireLogin(async () => {
    setBusy(true);
    try { const r = await post('/advance-gold/contracts', { amount: Number(amount) }); openCheckout(r.data.payment, { onSuccess: (res) => { toast(`${inr(res.advance.amount)} converted to ${gm(res.advance.grams)} ${res.advance.purity}`); mutate(); setPass(res.advance); }, onFailure: () => mutate() }); }
    catch (e) { toast(e.message, 'error'); } finally { setBusy(false); }
  });
  const s = page?.summary;

  return (
    <div className="section space-y-6 py-4 sm:py-6">
      <SchemeHero title={cfg.title || 'Advance Gold'} titleHi="एडवांस गोल्ड" subtitle={cfg.subtitle}>
        {s && <div className="mt-5 grid grid-cols-3 gap-3"><div className="rounded-xl bg-white/10 p-3"><p className="text-[11px] uppercase opacity-75">Available balance</p><p className="text-xl font-bold">{inr(s.availableBalance)}</p></div><div className="rounded-xl bg-white/10 p-3"><p className="text-[11px] uppercase opacity-75">Gold credit</p><p className="text-xl font-bold">{gm(s.grams)}</p><p className="text-[11px] opacity-75">{s.purity}</p></div><div className="rounded-xl bg-white/10 p-3"><p className="text-[11px] uppercase opacity-75">Active</p><p className="text-xl font-bold">{s.activeContracts}</p><p className="text-[11px] opacity-75">contracts</p></div></div>}
      </SchemeHero>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <p className="flex items-center gap-2 font-semibold text-primary"><Landmark size={18} />Deposit funds</p>
          <label className="label mt-4">Amount (₹)</label><input type="number" min={cfg.minAmount} step={1000} className="input text-lg font-semibold" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <Presets className="mt-2" values={cfg.presets || []} value={Number(amount)} onChange={setAmount} format={(v) => inr(v)} />
          <div className="mt-4 rounded-xl bg-cream/70 p-3">{q ? <><Row label={`${q.purity} rate (live)`} value={`${inr(q.rate)} / gm`} /><Row label="Gold units credited" value={gm(q.grams)} bold /><Row label="Validity" value={`${q.validityDays} days (till ${fmtDate(q.expiresAt)})`} /><Row label="Billing deduction" value="100% of credit" /></> : <Skeleton className="h-24" />}</div>
          <button onClick={deposit} disabled={busy || !q} className="btn-primary mt-4 w-full">{busy ? <Spinner /> : `Deposit ${inr(amount)}`}</button>
          <p className="mt-2 text-center text-[11px] text-muted">UPI, cards and net banking accepted. Funds convert to gold at the live rate once payment succeeds.</p>
        </div>
        <div className="space-y-4">
          <p className="font-semibold text-primary">My contracts</p>
          {!isLoggedIn ? <p className="card p-5 text-sm text-muted">Login to see your advance gold ledger. <button onClick={() => requireLogin()} className="font-semibold text-primary underline">Login</button></p>
            : !(page?.contracts || []).length ? <p className="card p-5 text-sm text-muted">No deposits yet.</p>
            : page.contracts.map((a) => (
              <div key={a.id} className="card p-4">
                <div className="flex items-start justify-between gap-3"><div><p className="text-xs text-muted">Contract {a.contractNo}</p><p className="text-lg font-bold text-primary">{inr(a.amount)} → {gm(a.grams)} {a.purity}</p><p className="text-xs text-muted">@ {inr(a.rate)}/gm • {a.method || 'Pending'} • {fmtDate(a.depositedAt || a.createdAt)}</p></div><Badge status={a.status} /></div>
                <div className="mt-3 grid grid-cols-3 gap-2"><Stat label="Valid till" value={a.expiresAt ? fmtDate(a.expiresAt) : '—'} className="!p-2 [&>p:nth-child(2)]:!text-sm" /><Stat label="Days left" value={a.daysLeft ?? '—'} className="!p-2 [&>p:nth-child(2)]:!text-sm" /><Stat label="Deduction" value="100%" className="!p-2 [&>p:nth-child(2)]:!text-sm" /></div>
                {a.status === 'ACTIVE' && <button onClick={() => setPass(a)} className="btn-primary mt-3 w-full !py-2 text-xs"><QrCode size={14} />Show QR pass</button>}
              </div>))}
        </div>
      </div>
      <div><Divider label="FAQ's" /><div className="mt-3"><FaqAccordion faqs={page?.faqs || []} /></div></div>
      <Modal open={!!pass} onClose={() => setPass(null)} title="Advance Gold QR pass" size="sm">
        {pass && <div className="text-center">
          <div className="mx-auto grid h-44 w-44 place-items-center rounded-2xl border-4 border-primary bg-white p-3"><QrGlyph seed={pass.qrPass} /></div>
          <p className="mt-3 font-mono text-sm font-bold tracking-wider text-primary">{pass.qrPass}</p>
          <p className="text-xs text-muted">Linked to +91 {user?.mobile}</p>
          <div className="mt-4 grid grid-cols-2 gap-2 text-left text-xs"><div><p className="text-muted">Contract</p><p className="font-semibold">{pass.contractNo}</p></div><div><p className="text-muted">Credit</p><p className="font-semibold">{inr(pass.amount)} ({gm(pass.grams)})</p></div><div><p className="text-muted">Locked rate</p><p className="font-semibold">{inr(pass.rate)}/gm {pass.purity}</p></div><div><p className="text-muted">Valid till</p><p className="font-semibold">{fmtDate(pass.expiresAt)}</p></div></div>
          <p className="mt-4 text-[11px] text-muted">Show this pass at any {config.brand.name} showroom. 100% of your advance credit is deducted from the bill.</p>
        </div>}
      </Modal>
    </div>
  );
}

/** Deterministic QR-like glyph for the demo (not a scannable QR). */
function QrGlyph({ seed = '' }) {
  let h = 0; for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const cells = []; const N = 21;
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const finder = (x < 7 && y < 7) || (x >= N - 7 && y < 7) || (x < 7 && y >= N - 7); let on; if (finder) { const fx = x % (N - 7) < 7 ? x % (N - 7) : x; const fy = y < 7 ? y : y - (N - 7); const lx = fx >= 7 ? fx - (N - 7) : fx; on = lx === 0 || lx === 6 || fy === 0 || fy === 6 || (lx >= 2 && lx <= 4 && fy >= 2 && fy <= 4); } else { h = (h * 1103515245 + 12345) >>> 0; on = (h >>> 16) & 1; } if (on) cells.push(<rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} />); }
  return <svg viewBox={`0 0 ${N} ${N}`} className="h-full w-full fill-primary">{cells}</svg>;
}

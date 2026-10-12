'use client';
import { useState } from 'react';
import { useApi, post, patch } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { inr2, fmtDateTime } from '@/lib/format';
import { Skeleton, Spinner } from '@/components/ui/Bits';
import { AdminHeader, Toggle } from '@/components/admin/AdminUI';

export default function AdminRatesPage() {
  const { data: settings, mutate } = useApi('/admin/settings');
  const { data: live, mutate: mutateLive } = useApi('/rates', { refreshInterval: 15000 });
  if (!settings) return <Skeleton className="h-64" />;
  const refresh = () => { mutate(); mutateLive(); };
  return (
    <>
      <AdminHeader title="Rates" subtitle="Publish the base gold and silver rates used for product pricing and all gold schemes." />
      <div className="grid gap-6 lg:grid-cols-2">
        <PublishForm key={settings.updatedAt} rates={settings.rates} onDone={refresh} />
        <div className="card p-5">
          <h2 className="font-semibold text-primary">Current rates</h2>
          <p className="text-xs text-muted">{live ? `${live.isLive ? 'Live feed' : 'Manual rates'} • updated ${fmtDateTime(live.updatedAt)}` : 'Loading'}</p>
          <table className="mt-3 w-full text-sm">
            <thead className="text-left text-[11px] uppercase tracking-wide text-muted"><tr><th className="py-2">Purity</th><th className="py-2 text-right">Buy / gm</th><th className="py-2 text-right">Change</th></tr></thead>
            <tbody className="divide-y divide-cream-dark">{live?.items.map((r) => <tr key={r.key}><td className="py-2">{r.label}</td><td className="py-2 text-right font-semibold">{inr2(r.pricePerGram)}</td><td className={`py-2 text-right text-xs ${r.change > 0 ? 'text-success' : r.change < 0 ? 'text-danger' : 'text-muted'}`}>{r.change > 0 ? '+' : ''}{r.change}</td></tr>)}</tbody>
          </table>
          {live && <p className="mt-3 text-xs text-muted">Sell (buyback): 24K {inr2(live.sell.gold24k)} • Silver {inr2(live.sell.silver999)} ({live.sell.spreadPct}% spread)</p>}
        </div>
        <FeedForm key={`feed-${settings.updatedAt}`} rates={settings.rates} onDone={refresh} />
      </div>
    </>
  );
}

function PublishForm({ rates, onDone }) {
  const toast = useToast();
  const [gold24k, setGold] = useState(rates.base.gold24k);
  const [silver999, setSilver] = useState(rates.base.silver999);
  const [manualOverride, setManual] = useState(!!rates.manualOverride);
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    try { await post('/admin/rates', { gold24k: Number(gold24k), silver999: Number(silver999), manualOverride }); toast('Rates published'); onDone(); }
    catch (err) { toast(err.message, 'error'); } finally { setBusy(false); }
  };
  return (
    <form onSubmit={submit} className="card space-y-4 p-5">
      <h2 className="font-semibold text-primary">Publish base rates</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="label">Gold 24K (₹ / gm)</label><input className="input" type="number" step="any" min="1" required value={gold24k} onChange={(e) => setGold(e.target.value)} /></div>
        <div><label className="label">Silver 999 (₹ / gm)</label><input className="input" type="number" step="any" min="1" required value={silver999} onChange={(e) => setSilver(e.target.value)} /></div>
      </div>
      <p className="text-xs text-muted">22K, 18K and 14K are derived from 24K using the purity factors.</p>
      <div className="rounded-xl bg-cream/60 p-3">
        <Toggle checked={manualOverride} onChange={setManual} label={<span><b>Hold rates fixed</b><span className="block text-xs text-muted">When off, the live feed moves rates slightly around these base values.</span></span>} />
      </div>
      <button className="btn-primary w-full" disabled={busy}>{busy ? <Spinner /> : 'Publish rates'}</button>
    </form>
  );
}

function FeedForm({ rates, onDone }) {
  const toast = useToast();
  const [v, setV] = useState({ source: rates.source, sellSpreadPct: rates.sellSpreadPct, jitterPct: rates.jitterPct, maxDriftPct: rates.maxDriftPct, publishTimes: (rates.publishTimes || []).join(', ') });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.value }));
  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    try {
      await patch('/admin/settings', { rates: { source: v.source, sellSpreadPct: Number(v.sellSpreadPct), jitterPct: Number(v.jitterPct), maxDriftPct: Number(v.maxDriftPct), publishTimes: v.publishTimes.split(',').map((x) => x.trim()).filter(Boolean) } });
      toast('Feed settings saved'); onDone();
    } catch (err) { toast(err.message, 'error'); } finally { setBusy(false); }
  };
  return (
    <form onSubmit={submit} className="card space-y-4 p-5 lg:col-span-2">
      <h2 className="font-semibold text-primary">Feed settings</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2"><label className="label">Source label</label><input className="input" value={v.source} onChange={set('source')} /></div>
        <div><label className="label">Sell spread %</label><input className="input" type="number" step="any" value={v.sellSpreadPct} onChange={set('sellSpreadPct')} /></div>
        <div><label className="label">Tick jitter %</label><input className="input" type="number" step="any" value={v.jitterPct} onChange={set('jitterPct')} /></div>
        <div><label className="label">Max drift %</label><input className="input" type="number" step="any" value={v.maxDriftPct} onChange={set('maxDriftPct')} /></div>
        <div className="sm:col-span-2 lg:col-span-5"><label className="label">Publish times</label><input className="input" value={v.publishTimes} onChange={set('publishTimes')} placeholder="11:30 AM, 4:30 PM" /></div>
      </div>
      <div className="flex justify-end"><button className="btn-primary" disabled={busy}>{busy ? <Spinner /> : 'Save feed settings'}</button></div>
    </form>
  );
}

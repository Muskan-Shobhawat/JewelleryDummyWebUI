'use client';
import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useApi, patch } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { fmtDateTime } from '@/lib/format';
import { Tabs, Skeleton, Spinner } from '@/components/ui/Bits';
import { AdminHeader, Toggle } from '@/components/admin/AdminUI';
import { getPath, setPath } from '@/lib/adminResources';

const TABS = [{ key: 'general', label: 'Store' }, { key: 'contact', label: 'Contact' }, { key: 'coupons', label: 'Coupons' }, { key: 'advanced', label: 'Schemes and checkout' }];

const GENERAL = [
  { key: 'announcement', label: 'Announcement bar', full: true, hint: 'Shown above the header on every page. Leave blank to hide.' },
  { key: 'brand.name', label: 'Store name' }, { key: 'brand.shortName', label: 'Short name' },
  { key: 'brand.tagline', label: 'Tagline' }, { key: 'brand.since', label: 'Established (year)', type: 'number' },
  { key: 'brand.logoUrl', label: 'Logo URL' }, { key: 'brand.faviconUrl', label: 'Favicon URL' },
  { key: 'brand.description', label: 'About the store', type: 'textarea', full: true },
];
const CONTACT = [
  { key: 'contact.phone', label: 'Phone' }, { key: 'contact.tollFree', label: 'Toll free' },
  { key: 'contact.email', label: 'Email' }, { key: 'contact.supportHours', label: 'Support hours' },
  { key: 'contact.whatsappNumber', label: 'WhatsApp number', hint: 'With country code, digits only, e.g. 919999999999' },
  { key: 'contact.whatsappDefaultText', label: 'WhatsApp default message' },
  { key: 'contact.address', label: 'Address', full: true }, { key: 'contact.city', label: 'City' }, { key: 'contact.state', label: 'State' },
  { key: 'contact.pincode', label: 'Pincode' }, { key: 'contact.mapUrl', label: 'Map URL' },
  { key: 'contact.instagram', label: 'Instagram' }, { key: 'contact.facebook', label: 'Facebook' }, { key: 'contact.youtube', label: 'YouTube' },
];
const ADVANCED = ['digiGold', 'ema', 'bookGold', 'advanceGold', 'checkout', 'giftCards', 'trustBadges', 'theme'];

export default function AdminSettingsPage() {
  const { data: s, mutate } = useApi('/admin/settings');
  const [tab, setTab] = useState('general');
  if (!s) return <Skeleton className="h-64" />;
  return (
    <>
      <AdminHeader title="Settings" subtitle={`Last updated ${fmtDateTime(s.updatedAt)}`} />
      <Tabs className="mb-4" value={tab} onChange={setTab} tabs={TABS} />
      {tab === 'general' && <FieldsForm key={s.updatedAt} settings={s} fields={GENERAL} onSaved={mutate} />}
      {tab === 'contact' && <FieldsForm key={s.updatedAt} settings={s} fields={CONTACT} onSaved={mutate} />}
      {tab === 'coupons' && <CouponsForm key={s.updatedAt} coupons={s.coupons || []} onSaved={mutate} />}
      {tab === 'advanced' && <JsonForm settings={s} onSaved={mutate} />}
    </>
  );
}

function useSave(onSaved) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const save = async (body) => {
    setBusy(true);
    try { await patch('/admin/settings', body); toast('Settings saved'); onSaved(); } catch (e) { toast(e.message, 'error'); } finally { setBusy(false); }
  };
  return [save, busy];
}

function FieldsForm({ settings, fields, onSaved }) {
  const [save, busy] = useSave(onSaved);
  const [v, setV] = useState(() => fields.reduce((acc, f) => setPath(acc, f.key, getPath(settings, f.key) ?? ''), {}));
  const submit = (e) => { e.preventDefault(); save(v); };
  return (
    <form onSubmit={submit} className="card p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.key} className={f.full ? 'sm:col-span-2' : ''}>
            <label className="label">{f.label}</label>
            {f.type === 'textarea'
              ? <textarea className="input min-h-24" value={getPath(v, f.key)} onChange={(e) => setV((s) => setPath(s, f.key, e.target.value))} />
              : <input className="input" type={f.type || 'text'} value={getPath(v, f.key)} onChange={(e) => setV((s) => setPath(s, f.key, f.type === 'number' ? Number(e.target.value) : e.target.value))} />}
            {f.hint && <p className="mt-1 text-[11px] text-muted">{f.hint}</p>}
          </div>
        ))}
      </div>
      <div className="mt-5 flex justify-end"><button className="btn-primary" disabled={busy}>{busy ? <Spinner /> : 'Save changes'}</button></div>
    </form>
  );
}

function CouponsForm({ coupons, onSaved }) {
  const [save, busy] = useSave(onSaved);
  const [rows, setRows] = useState(coupons);
  const set = (i, k, val) => setRows((r) => r.map((c, j) => (j === i ? { ...c, [k]: val } : c)));
  const submit = (e) => { e.preventDefault(); save({ coupons: rows.filter((c) => c.code).map((c) => ({ ...c, code: c.code.trim().toUpperCase(), pct: Number(c.pct) || 0, maxDiscount: Number(c.maxDiscount) || 0 })) }); };
  return (
    <form onSubmit={submit} className="card p-5">
      <div className="space-y-3">
        {rows.map((c, i) => (
          <div key={i} className="grid items-end gap-3 rounded-xl border border-cream-dark p-3 sm:grid-cols-[1fr_90px_130px_2fr_auto_auto]">
            <div><label className="label">Code</label><input className="input uppercase" value={c.code} onChange={(e) => set(i, 'code', e.target.value)} /></div>
            <div><label className="label">Off %</label><input className="input" type="number" value={c.pct} onChange={(e) => set(i, 'pct', e.target.value)} /></div>
            <div><label className="label">Max off (₹)</label><input className="input" type="number" value={c.maxDiscount} onChange={(e) => set(i, 'maxDiscount', e.target.value)} /></div>
            <div><label className="label">Description</label><input className="input" value={c.description} onChange={(e) => set(i, 'description', e.target.value)} /></div>
            <div className="pb-3"><Toggle checked={!!c.firstOrderOnly} onChange={(val) => set(i, 'firstOrderOnly', val)} label="First order" /></div>
            <button type="button" className="mb-2 rounded-lg p-2 text-muted hover:bg-danger/10 hover:text-danger" onClick={() => setRows((r) => r.filter((_, j) => j !== i))} aria-label="Remove coupon"><Trash2 size={16} /></button>
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-between">
        <button type="button" className="btn-outline !py-2" onClick={() => setRows((r) => [...r, { code: '', pct: 10, maxDiscount: 1000, firstOrderOnly: false, description: '' }])}><Plus size={16} />Add coupon</button>
        <button className="btn-primary" disabled={busy}>{busy ? <Spinner /> : 'Save coupons'}</button>
      </div>
    </form>
  );
}

function JsonForm({ settings, onSaved }) {
  const [save, busy] = useSave(onSaved);
  const [section, setSection] = useState(ADVANCED[0]);
  const [text, setText] = useState(() => JSON.stringify(settings[ADVANCED[0]], null, 2));
  const [err, setErr] = useState('');
  const pick = (k) => { setSection(k); setText(JSON.stringify(settings[k], null, 2)); setErr(''); };
  const submit = (e) => {
    e.preventDefault();
    let parsed;
    try { parsed = JSON.parse(text); } catch (e2) { setErr(`Invalid JSON: ${e2.message}`); return; }
    setErr(''); save({ [section]: parsed });
  };
  return (
    <form onSubmit={submit} className="card p-5">
      <Tabs className="mb-3" value={section} onChange={pick} tabs={ADVANCED} />
      <p className="mb-2 text-xs text-muted">Edit the raw configuration for this section. Values you change are merged into the saved settings.</p>
      <textarea className="input min-h-[420px] font-mono text-xs" spellCheck={false} value={text} onChange={(e) => setText(e.target.value)} />
      <div className="mt-4 flex items-center justify-end gap-3">{err && <p className="mr-auto text-sm text-danger">{err}</p>}<button className="btn-primary" disabled={busy}>{busy ? <Spinner /> : `Save ${section}`}</button></div>
    </form>
  );
}

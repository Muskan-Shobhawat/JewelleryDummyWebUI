'use client';
import { useCallback, useState } from 'react';
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, Check, X } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { Badge, Img, Spinner } from '@/components/ui/Bits';
import { useToast } from '@/context/ToastContext';
import { post, patch, del } from '@/lib/api';
import { cls } from '@/lib/format';
import { RESOURCES, getPath, setPath } from '@/lib/adminResources';
import { AdminHeader, DataTable, SearchBox, Pagination, Toggle, useAdminList } from './AdminUI';

export default function ResourceManager({ collection }) {
  const res = RESOURCES[collection];
  const toast = useToast();
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const onSearch = useCallback((v) => { setQ(v); setPage(1); }, []);
  const { rows, pagination, isLoading, mutate } = useAdminList(collection, { q, page, limit: 100 });
  const canReorder = res.orderable && !q && pagination?.pages === 1;

  const run = async (id, fn, okMsg) => {
    setBusyId(id);
    try { await fn(); if (okMsg) toast(okMsg); await mutate(); } catch (e) { toast(e.message, 'error'); } finally { setBusyId(null); }
  };
  const toggleActive = (r) => run(r.id, () => patch(`/admin/${collection}/${r.id}`, { active: r.active === false }));
  const remove = (r) => { if (confirm(`Delete "${r.name || r.title || r.question}"? This cannot be undone.`)) run(r.id, () => del(`/admin/${collection}/${r.id}`), `${res.singular} deleted`); };
  const move = (i, dir) => {
    const ids = rows.map((r) => r.id);
    [ids[i], ids[i + dir]] = [ids[i + dir], ids[i]];
    run(rows[i].id, () => post(`/admin/${collection}/reorder`, { ids }));
  };

  const columns = [
    ...res.columns.map((c) => ({ ...c, render: (r) => <Cell col={c} row={r} /> })),
    { key: '_actions', label: '', className: 'w-1 whitespace-nowrap text-right', render: (r, i) => (
      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
        {busyId === r.id && <Spinner className="mr-1 text-primary" />}
        {canReorder && <>
          <button className="rounded-lg p-1.5 text-muted hover:bg-cream hover:text-primary disabled:opacity-30" disabled={i === 0 || !!busyId} onClick={() => move(i, -1)} aria-label="Move up"><ArrowUp size={15} /></button>
          <button className="rounded-lg p-1.5 text-muted hover:bg-cream hover:text-primary disabled:opacity-30" disabled={i === rows.length - 1 || !!busyId} onClick={() => move(i, 1)} aria-label="Move down"><ArrowDown size={15} /></button>
        </>}
        <span className="px-1"><Toggle checked={r.active !== false} onChange={() => toggleActive(r)} /></span>
        <button className="rounded-lg p-1.5 text-muted hover:bg-cream hover:text-primary" onClick={() => setEditing(r)} aria-label="Edit"><Pencil size={15} /></button>
        <button className="rounded-lg p-1.5 text-muted hover:bg-danger/10 hover:text-danger" onClick={() => remove(r)} aria-label="Delete"><Trash2 size={15} /></button>
      </div>
    ) },
  ].filter((c) => !(c.key === 'active' && c.type === 'bool'));

  return (
    <>
      <AdminHeader title={res.title} subtitle={canReorder ? 'Use the arrows to change the order shown on the website.' : undefined}
        actions={<><SearchBox onSearch={onSearch} placeholder={`Search ${res.title.toLowerCase()}`} /><button className="btn-primary !py-2.5" onClick={() => setEditing({})}><Plus size={16} />Add {res.singular.toLowerCase()}</button></>} />
      <DataTable columns={columns} rows={rows} loading={isLoading} onRowClick={setEditing} empty={q ? 'No matches' : `No ${res.title.toLowerCase()} yet`} />
      <Pagination pagination={pagination} onPage={setPage} />
      {editing && <ResourceForm collection={collection} item={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); mutate(); }} />}
    </>
  );
}

function Cell({ col, row }) {
  const v = getPath(row, col.key);
  if (col.type === 'image') return <div className="h-10 w-10 overflow-hidden rounded-lg bg-cream"><Img src={v} alt="" className="h-full w-full object-cover" /></div>;
  if (col.type === 'bool') return v ? <Check size={16} className="text-success" /> : <X size={16} className="text-muted/50" />;
  if (col.type === 'status') return v ? <Badge status={v} /> : '—';
  return (
    <div className="max-w-xs">
      <p className={cls('truncate', col.sub && 'font-semibold text-ink')}>{v ?? '—'}</p>
      {col.sub && <p className="truncate text-xs text-muted">{getPath(row, col.sub) || ''}</p>}
    </div>
  );
}

function ResourceForm({ collection, item, onClose, onSaved }) {
  const res = RESOURCES[collection];
  const toast = useToast();
  const isNew = !item.id;
  const [values, setValues] = useState(() => (isNew ? structuredClone(res.defaults || {}) : structuredClone(item)));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const set = (key, v) => setValues((s) => setPath(s, key, v));

  const save = async (e) => {
    e.preventDefault(); setErr('');
    const missing = res.sections.flatMap((s) => s.fields).filter((f) => f.required && (getPath(values, f.key) ?? '') === '');
    if (missing.length) { setErr(`Please fill: ${missing.map((f) => f.label).join(', ')}`); return; }
    setBusy(true);
    try {
      const { id, createdAt, updatedAt, ...body } = values;
      if (isNew) await post(`/admin/${collection}`, body); else await patch(`/admin/${collection}/${id}`, body);
      toast(`${res.singular} ${isNew ? 'created' : 'saved'}`);
      onSaved();
    } catch (e2) { setErr(e2.message); } finally { setBusy(false); }
  };

  return (
    <Modal open onClose={onClose} size="lg" title={isNew ? `Add ${res.singular.toLowerCase()}` : `Edit ${res.singular.toLowerCase()}`}
      footer={<div className="flex items-center justify-end gap-2">{err && <p className="mr-auto text-sm text-danger">{err}</p>}<button type="button" className="btn-ghost" onClick={onClose}>Cancel</button><button form="resource-form" className="btn-primary" disabled={busy}>{busy ? <Spinner /> : isNew ? 'Create' : 'Save changes'}</button></div>}>
      <form id="resource-form" onSubmit={save} className="space-y-6">
        {res.sections.map((s, i) => (
          <fieldset key={i}>
            {s.title && <legend className="mb-3 text-sm font-semibold text-primary">{s.title}</legend>}
            <div className="grid gap-4 sm:grid-cols-2">
              {s.fields.map((f) => <FormField key={f.key} field={f} value={getPath(values, f.key)} onChange={(v) => set(f.key, v)} />)}
            </div>
          </fieldset>
        ))}
      </form>
    </Modal>
  );
}

function FormField({ field: f, value, onChange }) {
  const wrap = (input) => (
    <div className={f.full ? 'sm:col-span-2' : ''}>
      <label className="label">{f.label}{f.required && <span className="text-danger"> *</span>}</label>
      {input}
      {f.hint && <p className="mt-1 text-[11px] text-muted">{f.hint}</p>}
    </div>
  );
  switch (f.type) {
    case 'bool': return <div className="flex items-end pb-2"><Toggle checked={!!value} onChange={onChange} label={f.label} /></div>;
    case 'number': return wrap(<input className="input" type="number" step="any" value={value ?? ''} onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))} />);
    case 'textarea': return wrap(<textarea className="input min-h-24" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />);
    case 'select': return wrap(f.optionsFrom ? <RemoteSelect from={f.optionsFrom} value={value} onChange={onChange} /> : <select className="input" value={value ?? ''} onChange={(e) => onChange(e.target.value)}><option value="">Select</option>{f.options.map((o) => <option key={o} value={o}>{o}</option>)}</select>);
    case 'image': return wrap(<div className="flex items-center gap-3"><div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-cream"><Img src={value} alt="" className="h-full w-full object-cover" /></div><input className="input" value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder="https://" /></div>);
    case 'list': case 'lines': return wrap(<ListInput field={f} value={value} onChange={onChange} />);
    default: return wrap(<input className="input" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />);
  }
}

/** Keeps the raw text locally so separators can be typed, and reports the parsed array. */
function ListInput({ field: f, value, onChange }) {
  const sep = f.type === 'lines' ? '\n' : ', ';
  const [text, setText] = useState(() => (Array.isArray(value) ? value.join(sep) : ''));
  const update = (t) => { setText(t); onChange(t.split(f.type === 'lines' ? '\n' : ',').map((x) => x.trim()).filter(Boolean)); };
  return (
    <>
      {f.type === 'lines' ? <textarea className="input min-h-24 font-mono text-xs" value={text} onChange={(e) => update(e.target.value)} /> : <input className="input" value={text} onChange={(e) => update(e.target.value)} />}
      {f.preview && value?.length > 0 && <div className="mt-2 flex flex-wrap gap-2">{value.map((src, i) => <div key={i} className="h-14 w-14 overflow-hidden rounded-lg bg-cream"><Img src={src} alt="" className="h-full w-full object-cover" /></div>)}</div>}
    </>
  );
}

function RemoteSelect({ from, value, onChange }) {
  const { rows } = useAdminList(from, { limit: 200 });
  return (
    <select className="input" value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
      <option value="">Select</option>
      {rows?.map((r) => <option key={r.id} value={r.slug}>{r.name}</option>)}
    </select>
  );
}

'use client';
import { Suspense, useCallback, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { patch } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { inr, fmtDateTime, titleCase } from '@/lib/format';
import { Tabs, Badge, Skeleton, Spinner, Img } from '@/components/ui/Bits';
import Modal from '@/components/ui/Modal';
import { AdminHeader, DataTable, Pagination, SearchBox, CustomerLink, Detail, useAdminList, useUserMap } from '@/components/admin/AdminUI';

const TICKET_STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
const INTEREST_STATUSES = ['INQUIRY_LOGGED', 'QUOTE_SHARED', 'CONSULTATION_SCHEDULED', 'SHOWROOM_READY', 'CLOSED'];

function Inner() {
  const sp = useSearchParams();
  const router = useRouter();
  const tab = sp.get('tab') === 'interests' ? 'interests' : 'tickets';
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(null);
  const onSearch = useCallback((v) => { setQ(v); setPage(1); }, []);
  const users = useUserMap();
  const { rows: products } = useAdminList(tab === 'interests' ? 'products' : null, { limit: 200 });
  const productMap = Object.fromEntries((products || []).map((p) => [p.id, p]));
  const { rows, pagination, isLoading, mutate } = useAdminList(tab, { status, q, page });
  const statuses = tab === 'tickets' ? TICKET_STATUSES : INTEREST_STATUSES;

  const columns = tab === 'tickets' ? [
    { key: 'subject', label: 'Ticket', render: (t) => <div className="max-w-sm"><p className="truncate font-semibold">{t.subject}</p><p className="text-xs text-muted">{t.ticketNo} • {titleCase(t.category)}</p></div> },
    { key: 'from', label: 'From', render: (t) => (t.userId ? <CustomerLink id={t.userId} user={users[t.userId]} /> : <><p className="font-semibold">{t.name}</p><p className="text-xs text-muted">+91 {t.mobile}</p></>) },
    { key: 'createdAt', label: 'Opened', render: (t) => <span className="text-xs text-muted">{fmtDateTime(t.createdAt)}</span> },
    { key: 'status', label: 'Status', render: (t) => <Badge status={t.status === 'OPEN' ? 'PENDING' : t.status === 'RESOLVED' ? 'SUCCESS' : undefined}>{titleCase(t.status)}</Badge> },
  ] : [
    { key: 'product', label: 'Product', render: (i) => { const p = productMap[i.productId]; return <div className="flex items-center gap-3"><div className="h-10 w-10 overflow-hidden rounded-lg bg-cream"><Img src={p?.images?.[0]} alt="" className="h-full w-full object-cover" /></div><div><p className="font-semibold">{p?.name || i.productId}</p><p className="max-w-xs truncate text-xs text-muted">{i.note || '—'}</p></div></div>; } },
    { key: 'userId', label: 'Customer', render: (i) => <CustomerLink id={i.userId} user={users[i.userId]} /> },
    { key: 'quoteAmount', label: 'Quote', render: (i) => (i.quoteAmount ? inr(i.quoteAmount) : '—') },
    { key: 'consultationAt', label: 'Consultation', render: (i) => <span className="text-xs">{i.consultationAt ? fmtDateTime(i.consultationAt) : '—'}</span> },
    { key: 'status', label: 'Status', render: (i) => <Badge status={i.status} /> },
  ];

  return (
    <>
      <AdminHeader title="Support" actions={<SearchBox key={tab} onSearch={onSearch} placeholder="Search" />} />
      <Tabs className="mb-3" value={tab} tabs={[{ key: 'tickets', label: 'Tickets' }, { key: 'interests', label: 'Product interests' }]} onChange={(t) => { setStatus(''); setPage(1); router.replace(t === 'tickets' ? '/admin/support' : '/admin/support?tab=interests'); }} />
      <Tabs className="mb-4" value={status} onChange={(s) => { setStatus(s); setPage(1); }} tabs={['', ...statuses].map((s) => ({ key: s, label: s ? titleCase(s) : 'All' }))} />
      <DataTable loading={isLoading} rows={rows} columns={columns} onRowClick={setOpen} empty={tab === 'tickets' ? 'No tickets' : 'No interests'} />
      <Pagination pagination={pagination} onPage={setPage} />
      {open && (tab === 'tickets'
        ? <TicketModal ticket={open} user={users[open.userId]} onClose={() => setOpen(null)} onDone={() => { setOpen(null); mutate(); }} />
        : <InterestModal interest={open} product={productMap[open.productId]} onClose={() => setOpen(null)} onDone={() => { setOpen(null); mutate(); }} />)}
    </>
  );
}

function TicketModal({ ticket: t, user, onClose, onDone }) {
  const toast = useToast();
  const [status, setStatus] = useState(t.status === 'OPEN' ? 'RESOLVED' : t.status);
  const [reply, setReply] = useState(t.reply || '');
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    try { await patch(`/admin/ops/tickets/${t.id}`, { status, reply: reply || undefined }); toast('Ticket updated'); onDone(); }
    catch (err) { toast(err.message, 'error'); } finally { setBusy(false); }
  };
  return (
    <Modal open onClose={onClose} title={t.subject}>
      <div className="mb-4 grid grid-cols-2 gap-4">
        <Detail label="Ticket">{t.ticketNo} • {titleCase(t.category)}</Detail>
        <Detail label="Opened">{fmtDateTime(t.createdAt)}</Detail>
        <Detail label="From">{user?.name || t.name || '—'}</Detail>
        <Detail label="Contact">{[t.mobile || user?.mobile, t.email || user?.email].filter(Boolean).join(' • ') || '—'}</Detail>
      </div>
      <p className="whitespace-pre-wrap rounded-xl bg-cream/60 p-4 text-sm">{t.message}</p>
      <form onSubmit={submit} className="mt-4 space-y-3">
        <div><label className="label">Reply</label><textarea className="input min-h-28" value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Shown to the customer on their ticket" /></div>
        <div><label className="label">Status</label><select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>{TICKET_STATUSES.map((s) => <option key={s} value={s}>{titleCase(s)}</option>)}</select></div>
        <button className="btn-primary w-full" disabled={busy}>{busy ? <Spinner /> : 'Save'}</button>
      </form>
    </Modal>
  );
}

const toLocalInput = (iso) => { if (!iso) return ''; const d = new Date(iso); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16); };

function InterestModal({ interest: i, product, onClose, onDone }) {
  const toast = useToast();
  const { rows: branches } = useAdminList('branches', { limit: 50 });
  const [v, setV] = useState({ status: i.status, quoteAmount: i.quoteAmount ?? '', consultationAt: toLocalInput(i.consultationAt), branchId: i.branchId || '', note: i.note || '' });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.value }));
  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    try {
      await patch(`/admin/ops/interests/${i.id}`, { status: v.status, note: v.note, ...(v.quoteAmount !== '' ? { quoteAmount: Number(v.quoteAmount) } : {}), ...(v.consultationAt ? { consultationAt: new Date(v.consultationAt).toISOString() } : {}), ...(v.branchId ? { branchId: v.branchId } : {}) });
      toast('Interest updated'); onDone();
    } catch (err) { toast(err.message, 'error'); } finally { setBusy(false); }
  };
  return (
    <Modal open onClose={onClose} title={product?.name || 'Product interest'}>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label">Status</label><select className="input" value={v.status} onChange={set('status')}>{INTEREST_STATUSES.map((s) => <option key={s} value={s}>{titleCase(s)}</option>)}</select></div>
          <div><label className="label">Quote (₹)</label><input className="input" type="number" value={v.quoteAmount} onChange={set('quoteAmount')} /></div>
          <div><label className="label">Consultation</label><input className="input" type="datetime-local" value={v.consultationAt} onChange={set('consultationAt')} /></div>
          <div><label className="label">Branch</label><select className="input" value={v.branchId} onChange={set('branchId')}><option value="">Select</option>{branches?.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select></div>
        </div>
        <div><label className="label">Note</label><textarea className="input min-h-20" value={v.note} onChange={set('note')} /></div>
        <button className="btn-primary w-full" disabled={busy}>{busy ? <Spinner /> : 'Save'}</button>
      </form>
    </Modal>
  );
}

export default function AdminSupportPage() { return <Suspense fallback={<Skeleton className="h-64" />}><Inner /></Suspense>; }

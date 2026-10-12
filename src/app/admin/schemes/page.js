'use client';
import { Suspense, useCallback, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { post } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { inr, gm, fmtDate } from '@/lib/format';
import { Tabs, Badge, Skeleton, Spinner, Row } from '@/components/ui/Bits';
import Modal from '@/components/ui/Modal';
import { AdminHeader, DataTable, Pagination, SearchBox, CustomerLink, useAdminList, useUserMap } from '@/components/admin/AdminUI';

const TABS = [
  { key: 'emaPlans', label: 'EMA plans' },
  { key: 'bookings', label: 'Rate locks' },
  { key: 'advances', label: 'Advance Gold' },
  { key: 'holdings', label: 'Digi Gold vaults' },
];

function Inner() {
  const sp = useSearchParams();
  const router = useRouter();
  const tab = TABS.some((t) => t.key === sp.get('tab')) ? sp.get('tab') : 'emaPlans';
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [redeeming, setRedeeming] = useState(null);
  const onSearch = useCallback((v) => { setQ(v); setPage(1); }, []);
  const users = useUserMap();
  const { rows, pagination, isLoading, mutate } = useAdminList(tab, { q, page });
  const customer = { key: 'userId', label: 'Customer', render: (r) => <CustomerLink id={r.userId} user={users[r.userId]} /> };
  const redeemBtn = (r, kind) => <button className="btn-outline !px-3 !py-1.5 text-xs" onClick={() => setRedeeming({ kind, item: r })}>Redeem</button>;

  const columns = {
    emaPlans: [
      { key: 'planNo', label: 'Plan', render: (p) => <><p className="font-semibold">{p.planNo}</p><p className="text-xs text-muted">{p.name}</p></> },
      customer,
      { key: 'monthlyAmount', label: 'Monthly', render: (p) => inr(p.monthlyAmount) },
      { key: 'progress', label: 'Paid', render: (p) => { const paid = p.installments.filter((i) => i.status === 'PAID').length; return <><p className="font-semibold">{paid} / {p.tenureMonths}</p><p className="text-xs text-muted">{inr(p.totalPaid ?? paid * p.monthlyAmount)}</p></>; } },
      { key: 'next', label: 'Next due', render: (p) => { const n = p.installments.find((i) => ['DUE', 'UPCOMING', 'MISSED'].includes(i.status)); return n ? <Badge status={n.status}>{`${n.status === 'UPCOMING' ? '' : n.status + ' '}${fmtDate(n.dueDate)}`}</Badge> : '—'; } },
      { key: 'maturityDate', label: 'Matures', render: (p) => fmtDate(p.maturityDate) },
      { key: 'status', label: 'Status', render: (p) => <Badge status={p.status} /> },
    ],
    bookings: [
      { key: 'bookingNo', label: 'Booking', render: (b) => <><p className="font-semibold">{b.bookingNo}</p><p className="text-xs text-muted">{b.certificateNo || '—'}</p></> },
      customer,
      { key: 'grams', label: 'Locked', render: (b) => <><p className="font-semibold">{b.grams} gm {b.purity}</p><p className="text-xs text-muted">@ {inr(b.lockedRate)}/gm</p></> },
      { key: 'advanceAmount', label: 'Advance / balance', render: (b) => <><p>{inr(b.advanceAmount)}</p><p className="text-xs text-muted">{inr(b.balanceDue)} due</p></> },
      { key: 'expiresAt', label: 'Expires', render: (b) => <><p>{fmtDate(b.expiresAt)}</p><p className="text-xs text-muted">{b.branchName}</p></> },
      { key: 'status', label: 'Status', render: (b) => <Badge status={b.status} /> },
      { key: '_a', label: '', className: 'text-right', render: (b) => b.status === 'LOCKED' && redeemBtn(b, 'bookings') },
    ],
    advances: [
      { key: 'contractNo', label: 'Contract', render: (a) => <><p className="font-semibold">{a.contractNo}</p><p className="text-xs text-muted">{a.qrPass}</p></> },
      customer,
      { key: 'amount', label: 'Deposit', render: (a) => <><p className="font-semibold">{inr(a.amount)}</p><p className="text-xs text-muted">{a.method}</p></> },
      { key: 'grams', label: 'Gold', render: (a) => <><p>{gm(a.grams)} {a.purity}</p><p className="text-xs text-muted">@ {inr(a.rate)}/gm</p></> },
      { key: 'expiresAt', label: 'Valid till', render: (a) => fmtDate(a.expiresAt) },
      { key: 'status', label: 'Status', render: (a) => <Badge status={a.status} /> },
      { key: '_a', label: '', className: 'text-right', render: (a) => a.status === 'ACTIVE' && redeemBtn(a, 'advances') },
    ],
    holdings: [
      customer,
      { key: 'grams', label: 'Gold held', render: (h) => <span className="font-semibold">{gm(h.grams)}</span> },
      { key: 'leasedGrams', label: 'Leased', render: (h) => gm(h.leasedGrams || 0) },
      { key: 'investedAmount', label: 'Invested', render: (h) => inr(h.investedAmount) },
      { key: 'updatedAt', label: 'Last activity', render: (h) => fmtDate(h.updatedAt) },
    ],
  }[tab];

  return (
    <>
      <AdminHeader title="Schemes" subtitle="Gold savings plans, rate locks, advance deposits and digital gold vaults." actions={<SearchBox key={tab} onSearch={onSearch} placeholder="Search" />} />
      <Tabs className="mb-4" value={tab} tabs={TABS} onChange={(t) => { setPage(1); setQ(''); router.replace(`/admin/schemes?tab=${t}`); }} />
      <DataTable loading={isLoading} rows={rows} columns={columns} empty="No records" />
      <Pagination pagination={pagination} onPage={setPage} />
      {redeeming && <RedeemModal {...redeeming} onClose={() => setRedeeming(null)} onDone={() => { setRedeeming(null); mutate(); }} />}
    </>
  );
}

function RedeemModal({ kind, item, onClose, onDone }) {
  const toast = useToast();
  const [billNo, setBillNo] = useState('');
  const [amountUsed, setAmountUsed] = useState(item.amount ?? '');
  const [busy, setBusy] = useState(false);
  const isAdvance = kind === 'advances';
  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    try {
      await post(`/admin/ops/${kind}/${item.id}/redeem`, { billNo: billNo || undefined, ...(isAdvance && amountUsed !== '' ? { amountUsed: Number(amountUsed) } : {}) });
      toast(isAdvance ? 'Advance redeemed' : 'Booking redeemed'); onDone();
    } catch (err) { toast(err.message, 'error'); } finally { setBusy(false); }
  };
  return (
    <Modal open onClose={onClose} size="sm" title={`Redeem ${isAdvance ? item.contractNo : item.bookingNo}`}>
      <form onSubmit={submit} className="space-y-4">
        <div className="rounded-xl bg-cream/60 px-4 py-2">
          {isAdvance ? <><Row label="Deposit" value={inr(item.amount)} /><Row label="Gold" value={`${gm(item.grams)} ${item.purity}`} /></>
            : <><Row label="Locked" value={`${item.grams} gm ${item.purity} @ ${inr(item.lockedRate)}`} /><Row label="Balance due" value={inr(item.balanceDue)} /></>}
        </div>
        <div><label className="label">Showroom bill no.</label><input className="input" value={billNo} onChange={(e) => setBillNo(e.target.value)} placeholder="Optional" autoFocus /></div>
        {isAdvance && <div><label className="label">Amount used (₹)</label><input className="input" type="number" value={amountUsed} onChange={(e) => setAmountUsed(e.target.value)} /></div>}
        <button className="btn-primary w-full" disabled={busy}>{busy ? <Spinner /> : 'Mark as redeemed'}</button>
      </form>
    </Modal>
  );
}

export default function AdminSchemesPage() { return <Suspense fallback={<Skeleton className="h-64" />}><Inner /></Suspense>; }

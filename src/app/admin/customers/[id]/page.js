'use client';
import { Suspense, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';
import { useApi } from '@/lib/api';
import { inr, gm, fmtDate, fmtDateTime } from '@/lib/format';
import { Badge, Skeleton, Tabs } from '@/components/ui/Bits';
import { AdminHeader, DataTable, Detail, StatCard, useAdminList } from '@/components/admin/AdminUI';
import SendNotification from '@/components/admin/SendNotification';

const TABS = [
  { key: 'orders', label: 'Orders' },
  { key: 'transactions', label: 'Transactions' },
  { key: 'emaPlans', label: 'EMA' },
  { key: 'bookings', label: 'Rate locks' },
  { key: 'advances', label: 'Advance Gold' },
  { key: 'interests', label: 'Interests' },
  { key: 'tickets', label: 'Tickets' },
  { key: 'giftCards', label: 'Gift cards' },
];

const COLUMNS = {
  orders: [{ key: 'orderNo', label: 'Order' }, { key: 'total', label: 'Total', render: (r) => inr(r.total) }, { key: 'createdAt', label: 'Date', render: (r) => fmtDate(r.createdAt) }, { key: 'status', label: 'Status', render: (r) => <Badge status={r.status} /> }],
  transactions: [{ key: 'title', label: 'Transaction', render: (r) => <><p className="font-semibold">{r.title}</p><p className="text-xs text-muted">{r.txnNo}</p></> }, { key: 'amount', label: 'Amount', render: (r) => inr(r.amount) }, { key: 'grams', label: 'Gold', render: (r) => (r.grams ? gm(r.grams) : '—') }, { key: 'createdAt', label: 'Date', render: (r) => fmtDateTime(r.createdAt) }, { key: 'status', label: 'Status', render: (r) => <Badge status={r.status} /> }],
  emaPlans: [{ key: 'planNo', label: 'Plan' }, { key: 'monthlyAmount', label: 'Monthly', render: (r) => inr(r.monthlyAmount) }, { key: 'paid', label: 'Paid', render: (r) => `${r.installments.filter((i) => i.status === 'PAID').length} / ${r.tenureMonths}` }, { key: 'status', label: 'Status', render: (r) => <Badge status={r.status} /> }],
  bookings: [{ key: 'bookingNo', label: 'Booking' }, { key: 'grams', label: 'Locked', render: (r) => `${r.grams} gm ${r.purity} @ ${inr(r.lockedRate)}` }, { key: 'expiresAt', label: 'Expires', render: (r) => fmtDate(r.expiresAt) }, { key: 'status', label: 'Status', render: (r) => <Badge status={r.status} /> }],
  advances: [{ key: 'contractNo', label: 'Contract' }, { key: 'amount', label: 'Deposit', render: (r) => inr(r.amount) }, { key: 'grams', label: 'Gold', render: (r) => `${gm(r.grams)} ${r.purity}` }, { key: 'status', label: 'Status', render: (r) => <Badge status={r.status} /> }],
  interests: [{ key: 'productId', label: 'Product' }, { key: 'note', label: 'Note', render: (r) => <p className="max-w-xs truncate">{r.note || '—'}</p> }, { key: 'updatedAt', label: 'Updated', render: (r) => fmtDate(r.updatedAt) }, { key: 'status', label: 'Status', render: (r) => <Badge status={r.status} /> }],
  tickets: [{ key: 'subject', label: 'Subject', render: (r) => <><p className="font-semibold">{r.subject}</p><p className="text-xs text-muted">{r.ticketNo}</p></> }, { key: 'createdAt', label: 'Opened', render: (r) => fmtDate(r.createdAt) }, { key: 'status', label: 'Status', render: (r) => <Badge status={r.status} /> }],
  giftCards: [{ key: 'code', label: 'Code' }, { key: 'amount', label: 'Amount', render: (r) => inr(r.amount) }, { key: 'balance', label: 'Balance', render: (r) => inr(r.balance) }, { key: 'recipientName', label: 'Recipient' }, { key: 'status', label: 'Status', render: (r) => <Badge status={r.status} /> }],
};

const LINKS = { orders: (r) => `/admin/orders/${r.id}` };

function Inner() {
  const { id } = useParams();
  const router = useRouter();
  const [tab, setTab] = useState('orders');
  const [notify, setNotify] = useState(false);
  const { data: u, error } = useApi(`/admin/users/${id}`);
  const { rows: holdings } = useAdminList('holdings', { userId: id });
  const { rows, isLoading } = useAdminList(tab, { userId: id, limit: 50 });
  if (error) return <p className="text-muted">Customer not found.</p>;
  if (!u) return <Skeleton className="h-64" />;
  const h = holdings?.[0];
  return (
    <>
      <AdminHeader title={u.name || 'Unnamed customer'} subtitle={`+91 ${u.mobile}${u.email ? ` • ${u.email}` : ''}`} back="/admin/customers" actions={<button className="btn-outline !py-2" onClick={() => setNotify(true)}><Bell size={16} />Send notification</button>} />
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="space-y-4">
          <div className="card grid gap-4 p-5">
            <Detail label="Role">{u.role === 'ADMIN' ? 'Admin' : `Customer • ${u.memberTier || 'Member'}`}</Detail>
            <Detail label="KYC"><Badge status={u.kyc?.status === 'VERIFIED' ? 'SUCCESS' : 'PENDING'}>{u.kyc?.status || 'PENDING'}</Badge>{u.kyc?.pan && <span className="ml-2 text-xs text-muted">{u.kyc.pan}</span>}</Detail>
            <Detail label="Bank">{u.bank ? `${u.bank.bankName} • ${u.bank.accountNumberMasked}` : 'Not linked'}</Detail>
            <Detail label="Address">{u.address ? [u.address.line1, u.address.line2, u.address.city, u.address.state, u.address.pincode].filter(Boolean).join(', ') : '—'}</Detail>
            <Detail label="Joined">{fmtDate(u.createdAt)}</Detail>
            <Detail label="Last login">{fmtDateTime(u.lastLoginAt)}</Detail>
          </div>
          <StatCard tone="primary" label="Digi Gold vault" value={gm(h?.grams || 0)} sub={h ? `${inr(h.investedAmount)} invested${h.leasedGrams ? ` • ${gm(h.leasedGrams)} leased` : ''}` : 'No holdings'} />
        </div>
        <div>
          <Tabs className="mb-4" value={tab} onChange={setTab} tabs={TABS} />
          <DataTable loading={isLoading} rows={rows} columns={COLUMNS[tab]} onRowClick={LINKS[tab] ? (r) => router.push(LINKS[tab](r)) : undefined} empty="Nothing here" />
        </div>
      </div>
      {notify && <SendNotification userId={u.id} recipient={u.name || `+91 ${u.mobile}`} onClose={() => setNotify(false)} />}
    </>
  );
}

export default function AdminCustomerPage() { return <Suspense fallback={<Skeleton className="h-64" />}><Inner /></Suspense>; }

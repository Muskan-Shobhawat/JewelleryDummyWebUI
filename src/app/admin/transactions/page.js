'use client';
import { useCallback, useState } from 'react';
import { Tabs, Badge } from '@/components/ui/Bits';
import { AdminHeader, DataTable, Pagination, SearchBox, CustomerLink, useAdminList, useUserMap } from '@/components/admin/AdminUI';
import { inr, gm, fmtDate, fmtDateTime, titleCase } from '@/lib/format';

const TABS = [{ key: 'transactions', label: 'Transactions' }, { key: 'payments', label: 'Payments' }, { key: 'giftCards', label: 'Gift cards' }];

export default function AdminTransactionsPage() {
  const [tab, setTab] = useState('transactions');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const onSearch = useCallback((v) => { setQ(v); setPage(1); }, []);
  const users = useUserMap();
  const { rows, pagination, isLoading } = useAdminList(tab, { q, page });
  const customer = (key) => ({ key, label: 'Customer', render: (r) => <CustomerLink id={r[key]} user={users[r[key]]} /> });

  const columns = {
    transactions: [
      { key: 'title', label: 'Transaction', render: (t) => <><p className="font-semibold">{t.title}</p><p className="text-xs text-muted">{t.txnNo} • {titleCase(t.type)}</p></> },
      customer('userId'),
      { key: 'amount', label: 'Amount', render: (t) => <span className="font-semibold">{inr(t.amount)}</span> },
      { key: 'grams', label: 'Gold', render: (t) => (t.grams ? <><p>{gm(t.grams)}</p>{t.rate && <p className="text-xs text-muted">@ {inr(t.rate)}/gm</p>}</> : '—') },
      { key: 'method', label: 'Method', render: (t) => <span className="text-xs">{t.method || '—'}</span> },
      { key: 'createdAt', label: 'Date', render: (t) => <span className="text-xs text-muted">{fmtDateTime(t.createdAt)}</span> },
      { key: 'status', label: 'Status', render: (t) => <Badge status={t.status} /> },
    ],
    payments: [
      { key: 'paymentNo', label: 'Payment', render: (p) => <div className="max-w-xs"><p className="font-semibold">{p.paymentNo || p.id}</p><p className="truncate text-xs text-muted">{p.description || titleCase(p.purpose)}</p></div> },
      customer('userId'),
      { key: 'amount', label: 'Amount', render: (p) => <span className="font-semibold">{inr(p.amount)}</span> },
      { key: 'method', label: 'Method', render: (p) => <span className="text-xs">{p.method || '—'}</span> },
      { key: 'createdAt', label: 'Date', render: (p) => <span className="text-xs text-muted">{fmtDateTime(p.createdAt)}</span> },
      { key: 'status', label: 'Status', render: (p) => <Badge status={p.status} /> },
    ],
    giftCards: [
      { key: 'code', label: 'Code', render: (g) => <span className="font-mono text-xs font-semibold">{g.code}</span> },
      customer('purchasedBy'),
      { key: 'recipientName', label: 'Recipient', render: (g) => <><p>{g.recipientName || '—'}</p><p className="text-xs text-muted">{g.recipientMobile}</p></> },
      { key: 'amount', label: 'Value / balance', render: (g) => <><p className="font-semibold">{inr(g.amount)}</p><p className="text-xs text-muted">{inr(g.balance)} left</p></> },
      { key: 'expiresAt', label: 'Expires', render: (g) => fmtDate(g.expiresAt) },
      { key: 'status', label: 'Status', render: (g) => <Badge status={g.status} /> },
    ],
  }[tab];

  return (
    <>
      <AdminHeader title="Transactions" actions={<SearchBox key={tab} onSearch={onSearch} placeholder="Search" />} />
      <Tabs className="mb-4" value={tab} tabs={TABS} onChange={(t) => { setTab(t); setQ(''); setPage(1); }} />
      <DataTable loading={isLoading} rows={rows} columns={columns} empty="No records" />
      <Pagination pagination={pagination} onPage={setPage} />
    </>
  );
}

'use client';
import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, Badge } from '@/components/ui/Bits';
import { AdminHeader, DataTable, Pagination, SearchBox, useAdminList } from '@/components/admin/AdminUI';
import { inr, fmtDateTime, titleCase } from '@/lib/format';

const STATUSES = ['', 'PENDING_PAYMENT', 'CONFIRMED', 'PACKED', 'SHIPPED', 'READY_FOR_PICKUP', 'DELIVERED', 'CANCELLED'];

export default function AdminOrdersPage() {
  const router = useRouter();
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const onSearch = useCallback((v) => { setQ(v); setPage(1); }, []);
  const { rows, pagination, isLoading } = useAdminList('orders', { status, q, page });
  return (
    <>
      <AdminHeader title="Orders" actions={<SearchBox onSearch={onSearch} placeholder="Order no, customer, product" />} />
      <Tabs className="mb-4" value={status} onChange={(v) => { setStatus(v); setPage(1); }} tabs={STATUSES.map((s) => ({ key: s, label: s ? titleCase(s) : 'All' }))} />
      <DataTable loading={isLoading} rows={rows} onRowClick={(o) => router.push(`/admin/orders/${o.id}`)} empty="No orders found" columns={[
        { key: 'orderNo', label: 'Order', render: (o) => <><p className="font-semibold">{o.orderNo}</p><p className="text-xs text-muted">{fmtDateTime(o.createdAt)}</p></> },
        { key: 'items', label: 'Items', render: (o) => <p className="max-w-xs truncate text-muted">{o.items.map((i) => i.name).join(', ')}</p> },
        { key: 'delivery', label: 'Delivery', render: (o) => <span className="text-xs">{o.delivery === 'PICKUP' ? 'Showroom pickup' : o.address?.city || 'Courier'}</span> },
        { key: 'payment', label: 'Payment', render: (o) => <span className="text-xs text-muted">{o.payment?.method} • {o.payment?.status}</span> },
        { key: 'total', label: 'Total', render: (o) => <span className="font-semibold">{inr(o.total)}</span> },
        { key: 'status', label: 'Status', render: (o) => <Badge status={o.status} /> },
      ]} />
      <Pagination pagination={pagination} onPage={setPage} />
    </>
  );
}

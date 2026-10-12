'use client';
import { useState } from 'react';
import { Send } from 'lucide-react';
import { Badge } from '@/components/ui/Bits';
import { AdminHeader, DataTable, Pagination, CustomerLink, useAdminList, useUserMap } from '@/components/admin/AdminUI';
import SendNotification from '@/components/admin/SendNotification';
import { fmtDateTime } from '@/lib/format';

export default function AdminNotificationsPage() {
  const [page, setPage] = useState(1);
  const [composing, setComposing] = useState(false);
  const users = useUserMap();
  const { rows, pagination, isLoading, mutate } = useAdminList('notifications', { page });
  return (
    <>
      <AdminHeader title="Notifications" subtitle="Messages shown in customers' notification inbox. To message one customer, open them from Customers."
        actions={<button className="btn-primary !py-2.5" onClick={() => setComposing(true)}><Send size={16} />Notify all customers</button>} />
      <DataTable loading={isLoading} rows={rows} empty="No notifications yet" columns={[
        { key: 'title', label: 'Message', render: (n) => <div className="max-w-md"><p className="font-semibold">{n.title}</p><p className="truncate text-xs text-muted">{n.body}</p></div> },
        { key: 'userId', label: 'Sent to', render: (n) => (n.userId ? <CustomerLink id={n.userId} user={users[n.userId]} /> : <Badge status="BONUS">All customers</Badge>) },
        { key: 'type', label: 'Type', render: (n) => <Badge>{n.type}</Badge> },
        { key: 'read', label: 'Read', render: (n) => (n.userId ? (n.read ? 'Yes' : 'No') : '—') },
        { key: 'createdAt', label: 'Sent', render: (n) => <span className="text-xs text-muted">{fmtDateTime(n.createdAt)}</span> },
      ]} />
      <Pagination pagination={pagination} onPage={setPage} />
      {composing && <SendNotification onClose={() => setComposing(false)} onSent={mutate} />}
    </>
  );
}

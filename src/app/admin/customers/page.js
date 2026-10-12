'use client';
import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/Bits';
import { AdminHeader, DataTable, Pagination, SearchBox, useAdminList } from '@/components/admin/AdminUI';
import { fmtDate, fmtDateTime } from '@/lib/format';

export default function AdminCustomersPage() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const onSearch = useCallback((v) => { setQ(v); setPage(1); }, []);
  const { rows, pagination, isLoading } = useAdminList('users', { q, page });
  return (
    <>
      <AdminHeader title="Customers" actions={<SearchBox onSearch={onSearch} placeholder="Name, mobile, email" />} />
      <DataTable loading={isLoading} rows={rows} onRowClick={(u) => router.push(`/admin/customers/${u.id}`)} empty="No customers found" columns={[
        { key: 'name', label: 'Customer', render: (u) => <><p className="font-semibold">{u.name || 'Unnamed'}</p><p className="text-xs text-muted">+91 {u.mobile}</p></> },
        { key: 'email', label: 'Email', render: (u) => <span className="text-muted">{u.email || '—'}</span> },
        { key: 'role', label: 'Role', render: (u) => <Badge status={u.role === 'ADMIN' ? 'LOCKED' : undefined}>{u.role === 'ADMIN' ? 'Admin' : u.memberTier || 'Member'}</Badge> },
        { key: 'kyc', label: 'KYC', render: (u) => <Badge status={u.kyc?.status === 'VERIFIED' ? 'SUCCESS' : 'PENDING'}>{u.kyc?.status || 'PENDING'}</Badge> },
        { key: 'city', label: 'City', render: (u) => u.address?.city || '—' },
        { key: 'createdAt', label: 'Joined', render: (u) => fmtDate(u.createdAt) },
        { key: 'lastLoginAt', label: 'Last login', render: (u) => <span className="text-xs text-muted">{fmtDateTime(u.lastLoginAt)}</span> },
      ]} />
      <Pagination pagination={pagination} onPage={setPage} />
    </>
  );
}

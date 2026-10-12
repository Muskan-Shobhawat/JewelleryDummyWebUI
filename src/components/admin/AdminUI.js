'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';
import { useApi } from '@/lib/api';
import { cls } from '@/lib/format';
import { Skeleton } from '@/components/ui/Bits';

/** Paged list from /admin/:collection. Pass collection = null to skip. */
export function useAdminList(collection, { q, status, userId, page = 1, limit = 25 } = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (q) params.set('q', q);
  if (status) params.set('status', status);
  if (userId) params.set('userId', userId);
  const { data, extras, ...rest } = useApi(collection ? `/admin/${collection}?${params}` : null);
  return { rows: data, pagination: extras?.pagination, ...rest };
}

/** id -> user lookup for showing customer names next to userId-only records. */
export function useUserMap() {
  const { rows } = useAdminList('users', { limit: 200 });
  return Object.fromEntries((rows || []).map((u) => [u.id, u]));
}

export const CustomerLink = ({ user, id }) => (id ? (
  <Link href={`/admin/customers/${id}`} onClick={(e) => e.stopPropagation()} className="hover:underline">
    <p className="font-semibold text-ink">{user?.name || 'Unnamed'}</p>
    <p className="text-xs text-muted">{user ? `+91 ${user.mobile}` : id}</p>
  </Link>
) : <span className="text-muted">Guest</span>);

export const AdminHeader = ({ title, subtitle, back, actions }) => (
  <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
    <div className="flex items-start gap-2">
      {back && <Link href={back} className="mt-1 rounded-full p-1 text-primary hover:bg-cream" aria-label="Back"><ChevronLeft size={22} /></Link>}
      <div><h1 className="text-2xl font-semibold text-primary">{title}</h1>{subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}</div>
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </div>
);

export const StatCard = ({ label, value, sub, icon: Icon, href, tone = 'default' }) => {
  const body = (
    <div className={cls('card h-full p-5 transition', href && 'hover:shadow-soft', tone === 'primary' && '!bg-primary text-white')}>
      <div className="flex items-start justify-between gap-3">
        <p className={cls('text-xs font-semibold uppercase tracking-wide', tone === 'primary' ? 'text-white/70' : 'text-muted')}>{label}</p>
        {Icon && <span className={cls('rounded-lg p-2', tone === 'primary' ? 'bg-white/10 text-accent' : 'bg-cream text-primary')}><Icon size={16} /></span>}
      </div>
      <p className={cls('mt-2 text-2xl font-bold', tone === 'primary' ? 'text-white' : 'text-primary')}>{value}</p>
      {sub && <p className={cls('mt-1 text-xs', tone === 'primary' ? 'text-white/70' : 'text-muted')}>{sub}</p>}
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
};

/** Search input that reports its value after the user stops typing. */
export function SearchBox({ onSearch, placeholder = 'Search', className = '' }) {
  const [v, setV] = useState('');
  useEffect(() => { const t = setTimeout(() => onSearch(v.trim()), 300); return () => clearTimeout(t); }, [v, onSearch]);
  return (
    <div className={cls('relative', className)}>
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
      <input value={v} onChange={(e) => setV(e.target.value)} placeholder={placeholder} className="h-10 w-full rounded-xl border border-cream-dark bg-white pl-9 pr-3 text-sm outline-none focus:border-primary sm:w-64" />
    </div>
  );
}

/** columns: [{ key, label, render?(row), className? }] */
export function DataTable({ columns, rows, loading, onRowClick, empty = 'Nothing here yet', rowKey = (r) => r.id }) {
  if (loading && !rows) return <div className="card space-y-2 p-4">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10" />)}</div>;
  if (!rows?.length) return <div className="card flex flex-col items-center px-6 py-12 text-center text-muted"><Inbox size={28} className="mb-2 text-primary" /><p className="text-sm">{empty}</p></div>;
  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-cream-dark bg-cream/40 text-[11px] uppercase tracking-wide text-muted">
          <tr>{columns.map((c) => <th key={c.key + c.label} className={cls('px-4 py-3 font-semibold', c.className)}>{c.label}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-cream-dark">
          {rows.map((r, i) => (
            <tr key={rowKey(r, i)} onClick={onRowClick ? () => onRowClick(r) : undefined} className={cls('align-middle', onRowClick && 'cursor-pointer hover:bg-cream/40')}>
              {columns.map((c) => <td key={c.key + c.label} className={cls('px-4 py-3', c.className)}>{c.render ? c.render(r, i) : r[c.key] ?? '—'}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Pagination({ pagination, onPage }) {
  if (!pagination || pagination.pages <= 1) return pagination ? <p className="mt-3 text-xs text-muted">{pagination.total} record{pagination.total === 1 ? '' : 's'}</p> : null;
  const { page, pages, total } = pagination;
  return (
    <div className="mt-3 flex items-center justify-between text-xs text-muted">
      <span>{total} records • page {page} of {pages}</span>
      <div className="flex gap-1">
        <button className="btn-outline !px-2.5 !py-1.5" disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Previous page"><ChevronLeft size={14} /></button>
        <button className="btn-outline !px-2.5 !py-1.5" disabled={page >= pages} onClick={() => onPage(page + 1)} aria-label="Next page"><ChevronRight size={14} /></button>
      </div>
    </div>
  );
}

export const Toggle = ({ checked, onChange, label }) => (
  <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
    <button type="button" role="switch" aria-checked={!!checked} onClick={() => onChange(!checked)} className={cls('relative h-5 w-9 shrink-0 rounded-full transition', checked ? 'bg-primary' : 'bg-cream-dark')}>
      <span className={cls('absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition', checked ? 'left-[18px]' : 'left-0.5')} />
    </button>
    {label}
  </label>
);

export const Detail = ({ label, children }) => (
  <div><p className="text-[11px] font-semibold uppercase tracking-wide text-muted">{label}</p><div className="mt-0.5 text-sm text-ink">{children ?? '—'}</div></div>
);

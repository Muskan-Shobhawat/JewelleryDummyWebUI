'use client';
import Link from 'next/link';
import { Bell, CheckCheck } from 'lucide-react';
import { useApi, post, patch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Skeleton, PageTitle, EmptyState } from '@/components/ui/Bits';
import { LoginGate } from '@/components/schemes/Shared';
import { fmtDateTime, cls } from '@/lib/format';

export default function NotificationsPage() {
  const { ready, isLoggedIn } = useAuth();
  const { data, mutate } = useApi(isLoggedIn ? '/me/notifications' : null);
  const readAll = async () => { await post('/me/notifications/read-all'); mutate(); };
  const read = async (n) => { if (!n.read) { await patch(`/me/notifications/${n.id}/read`); mutate(); } };
  return (
    <div className="section py-4 sm:py-6">
      <PageTitle title="Notifications" right={data?.some((n) => !n.read) && <button onClick={readAll} className="btn-ghost !px-3 text-xs"><CheckCheck size={14} />Mark all read</button>} />
      {!ready ? <Skeleton className="h-40" /> : !isLoggedIn ? <LoginGate title="Notifications" /> : !data ? <Skeleton className="h-40" /> : !data.length ? <EmptyState icon={Bell} title="No notifications" /> : (
        <div className="card divide-y divide-cream-dark">{data.map((n) => (
          <Link key={n.id} href={n.link || '#'} onClick={() => read(n)} className={cls('flex gap-3 px-4 py-3.5 hover:bg-cream/40', !n.read && 'bg-cream/30')}>
            <span className={cls('mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full', n.read ? 'bg-cream-dark' : 'bg-accent')} />
            <div className="min-w-0 flex-1"><p className="text-sm font-semibold">{n.title}</p><p className="text-sm text-ink/80">{n.body}</p><p className="mt-1 text-xs text-muted">{fmtDateTime(n.createdAt)} • {n.type}</p></div>
          </Link>))}</div>)}
    </div>
  );
}

'use client';
import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Download } from 'lucide-react';
import { useApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Badge, Skeleton, PageTitle, Tabs, EmptyState } from '@/components/ui/Bits';
import { LoginGate } from '@/components/schemes/Shared';
import { inr, gm, fmtDateTime, cls } from '@/lib/format';

function Inner() {
  const sp = useSearchParams();
  const { ready, isLoggedIn } = useAuth();
  const [type, setType] = useState(sp.get('type') || '');
  const [page, setPage] = useState(1);
  const { data: rows, extras } = useApi(isLoggedIn ? `/me/transactions?type=${type}&page=${page}&limit=20` : null);
  if (!ready) return <Skeleton className="h-40" />;
  if (!isLoggedIn) return <LoginGate title="My transactions" />;
  const s = extras?.summary; const pg = extras?.pagination;
  return (
    <>
      <PageTitle title="My Transactions" subtitle="Digi Gold, Swarn Sanchay, bookings, advances and orders in one ledger" />
      {s && <div className="mb-4 grid grid-cols-3 gap-2 rounded-2xl bg-primary p-4 text-white"><div><p className="text-[11px] uppercase opacity-75">Total transacted</p><p className="text-lg font-bold">{inr(s.totalTransacted)}</p></div><div><p className="text-[11px] uppercase opacity-75">Receipts</p><p className="text-lg font-bold">{s.count}</p></div><div><p className="text-[11px] uppercase opacity-75">Gold accumulated</p><p className="text-lg font-bold">{gm(s.goldAccumulatedGrams)}</p><p className="text-[10px] opacity-75">24K + 22K</p></div></div>}
      {extras?.tabs && <Tabs tabs={extras.tabs} value={type} onChange={(v) => { setType(v); setPage(1); }} className="mb-4" />}
      {!rows ? <Skeleton className="h-60" /> : !rows.length ? <EmptyState title="No transactions yet" /> : (
        <div className="card divide-y divide-cream-dark">
          {rows.map((t) => (
            <div key={t.id} className="flex items-center gap-3 px-4 py-3.5">
              <div className={cls('grid h-10 w-10 shrink-0 place-items-center rounded-full text-xs font-bold', t.type === 'DIGI_SELL' ? 'bg-danger/10 text-danger' : 'bg-cream text-primary')}>{t.type === 'DIGI_SELL' ? '−' : '+'}</div>
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{t.title}</p><p className="text-xs text-muted">{fmtDateTime(t.createdAt)} • {t.txnNo}{t.method ? ` • ${t.method}` : ''}</p>{t.grams && <p className="text-xs text-muted">{gm(t.grams)} {t.purity}{t.rate ? ` @ ${inr(t.rate)}/gm` : ''}</p>}</div>
              <div className="shrink-0 text-right"><p className="font-bold text-primary">{inr(t.amount)}</p><Badge status={t.status} /><button className="mt-1 flex items-center gap-1 text-[11px] text-muted hover:text-primary" onClick={() => alert(`Receipt ${t.txnNo}\n${t.title}\nAmount ${inr(t.amount)}\nStatus ${t.status}`)}><Download size={11} />Receipt</button></div>
            </div>))}
        </div>)}
      {pg && pg.pages > 1 && <div className="mt-4 flex justify-center gap-2">{Array.from({ length: pg.pages }).map((_, k) => <button key={k} onClick={() => setPage(k + 1)} className={cls('h-9 w-9 rounded-full text-sm font-semibold', pg.page === k + 1 ? 'bg-primary text-white' : 'bg-white text-primary')}>{k + 1}</button>)}</div>}
    </>
  );
}
export default function TransactionsPage() { return <div className="section py-4 sm:py-6"><Suspense fallback={<Skeleton className="h-40" />}><Inner /></Suspense></div>; }

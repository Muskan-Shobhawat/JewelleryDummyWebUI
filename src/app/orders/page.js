'use client';
import Link from 'next/link';
import { ShoppingBag, ChevronRight } from 'lucide-react';
import { useApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Badge, Skeleton, PageTitle, EmptyState, Img } from '@/components/ui/Bits';
import { LoginGate } from '@/components/schemes/Shared';
import { inr, fmtDate } from '@/lib/format';

export default function OrdersPage() {
  const { ready, isLoggedIn } = useAuth();
  const { data: orders } = useApi(isLoggedIn ? '/orders' : null);
  return (
    <div className="section py-4 sm:py-6">
      <PageTitle title="My Orders" />
      {!ready ? <Skeleton className="h-40" /> : !isLoggedIn ? <LoginGate title="My orders" /> : !orders ? <Skeleton className="h-40" /> : !orders.length ? <EmptyState icon={ShoppingBag} title="No orders yet" action={<Link href="/jewellery" className="btn-primary">Shop now</Link>} /> : (
        <div className="space-y-3">{orders.map((o) => (
          <Link key={o.id} href={`/orders/${o.id}`} className="card flex items-center gap-3 p-4 hover:bg-cream/40">
            <div className="flex -space-x-3">{o.items.slice(0, 3).map((i, k) => <div key={k} className="h-14 w-14 overflow-hidden rounded-xl border-2 border-white bg-cream"><Img src={i.image} alt="" className="h-full w-full object-cover" /></div>)}</div>
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{o.items.map((i) => i.name).join(', ')}</p><p className="text-xs text-muted">{o.orderNo} • {fmtDate(o.createdAt)} • {o.items.length} item{o.items.length > 1 ? 's' : ''}</p><Badge status={o.status} className="mt-1" /></div>
            <div className="text-right"><p className="font-bold text-primary">{inr(o.total)}</p><ChevronRight size={16} className="ml-auto text-muted" /></div>
          </Link>))}</div>)}
    </div>
  );
}

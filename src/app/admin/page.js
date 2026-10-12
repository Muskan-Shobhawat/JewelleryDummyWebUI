'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Users, Package, ShoppingBag, IndianRupee, Coins, PiggyBank, Lock, Landmark, LifeBuoy, Sparkles, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useApi } from '@/lib/api';
import { inr, inr2, gm, pct, fmtDateTime, fmtTime, cls } from '@/lib/format';
import { Badge, Skeleton } from '@/components/ui/Bits';
import { AdminHeader, StatCard, DataTable, useAdminList } from '@/components/admin/AdminUI';

export default function AdminDashboard() {
  const router = useRouter();
  const { data: s } = useApi('/admin/stats', { refreshInterval: 30000 });
  const { rows: orders, isLoading } = useAdminList('orders', { limit: 6 });

  if (!s) return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[...Array(8)].map((_, i) => <Skeleton key={i} className="h-28" />)}</div>;
  const TrendIcon = { UP: TrendingUp, DOWN: TrendingDown, FLAT: Minus };

  return (
    <>
      <AdminHeader title="Dashboard" subtitle="Store overview. Refreshes every 30 seconds." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard tone="primary" label="Revenue" value={inr(s.orders.revenue)} sub={`${s.orders.total} orders`} icon={IndianRupee} href="/admin/orders" />
        <StatCard label="Orders to fulfil" value={s.orders.pending} sub="Confirmed or packed" icon={ShoppingBag} href="/admin/orders" />
        <StatCard label="Customers" value={s.customers} icon={Users} href="/admin/customers" />
        <StatCard label="Products" value={`${s.activeProducts} / ${s.products}`} sub="Active / total" icon={Package} href="/admin/products" />
        <StatCard label="Digi Gold held" value={gm(s.digiGold.gramsHeld)} sub={`${inr(s.digiGold.invested)} invested`} icon={Coins} href="/admin/schemes" />
        <StatCard label="EMA plans" value={s.ema.activePlans} sub={`${inr(s.ema.collected)} collected • ${s.ema.dueThisMonth} due this month`} icon={PiggyBank} href="/admin/schemes" />
        <StatCard label="Rate locks" value={s.bookings.locked} sub={`${inr(s.bookings.advanceHeld)} advance held`} icon={Lock} href="/admin/schemes?tab=bookings" />
        <StatCard label="Advance Gold" value={s.advanceGold.active} sub={`${inr(s.advanceGold.balance)} balance`} icon={Landmark} href="/admin/schemes?tab=advances" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        <section>
          <div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-semibold text-primary">Recent orders</h2><Link href="/admin/orders" className="text-xs font-semibold text-primary underline">View all</Link></div>
          <DataTable loading={isLoading} rows={orders} onRowClick={(o) => router.push(`/admin/orders/${o.id}`)} empty="No orders yet" columns={[
            { key: 'orderNo', label: 'Order', render: (o) => <><p className="font-semibold">{o.orderNo}</p><p className="text-xs text-muted">{fmtDateTime(o.createdAt)}</p></> },
            { key: 'items', label: 'Items', render: (o) => <span className="text-muted">{o.items.length} item{o.items.length === 1 ? '' : 's'}</span> },
            { key: 'total', label: 'Total', render: (o) => <span className="font-semibold">{inr(o.total)}</span> },
            { key: 'status', label: 'Status', render: (o) => <Badge status={o.status} /> },
          ]} />
        </section>

        <section className="space-y-4">
          <div className="card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-primary">Live rates</h2>
              <span className={cls('flex items-center gap-1.5 text-[11px] font-semibold', s.rates.isLive ? 'text-success' : 'text-amber-700')}><span className={cls('h-2 w-2 rounded-full', s.rates.isLive ? 'live-dot bg-success' : 'bg-amber-500')} />{s.rates.isLive ? 'Live' : 'Manual'}</span>
            </div>
            <ul className="divide-y divide-cream-dark">
              {s.rates.items.map((r) => { const I = TrendIcon[r.trend]; return (
                <li key={r.key} className="flex items-center justify-between py-2 text-sm">
                  <span className="text-muted">{r.label}</span>
                  <span className="flex items-center gap-2"><b className="text-ink">{inr2(r.pricePerGram)}</b><span className={cls('flex items-center text-[11px]', r.trend === 'UP' ? 'text-success' : r.trend === 'DOWN' ? 'text-danger' : 'text-muted')}><I size={12} />{pct(r.changePct)}</span></span>
                </li>); })}
            </ul>
            <p className="mt-2 text-[11px] text-muted">Updated {fmtTime(s.rates.updatedAt)} • per gram</p>
            <Link href="/admin/rates" className="btn-outline mt-3 w-full !py-2">Publish rates</Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <StatCard label="Open tickets" value={s.openTickets} icon={LifeBuoy} href="/admin/support" />
            <StatCard label="Open interests" value={s.openInterests} icon={Sparkles} href="/admin/support?tab=interests" />
          </div>
        </section>
      </div>
    </>
  );
}

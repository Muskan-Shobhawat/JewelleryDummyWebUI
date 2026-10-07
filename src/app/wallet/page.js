'use client';
import Link from 'next/link';
import { Coins, PiggyBank, Lock, Landmark, Heart, Sparkles, Bell, Gift, User, Receipt, ShoppingBag, ChevronRight, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Badge, Skeleton, PageTitle } from '@/components/ui/Bits';
import { LoginGate } from '@/components/schemes/Shared';
import { inr, gm, pct, fmtDate, fmtDateTime, cls } from '@/lib/format';

export default function WalletPage() {
  const { ready, isLoggedIn, logout } = useAuth();
  const { data: d } = useApi(isLoggedIn ? '/me/dashboard' : null, { refreshInterval: 30000 });
  if (!ready) return <div className="section py-6"><Skeleton className="h-40" /></div>;
  if (!isLoggedIn) return <div className="section py-6"><LoginGate title="Your wallet" text="Login to see your gold vault, savings plans, bookings and transactions." /></div>;
  if (!d) return <div className="section space-y-4 py-6"><Skeleton className="h-32" /><Skeleton className="h-32" /></div>;
  const links = [{ h: '/transactions', l: 'My Transactions', I: Receipt }, { h: '/orders', l: 'My Orders', I: ShoppingBag }, { h: '/wishlist', l: 'Wishlist', I: Heart, c: d.wishlistCount }, { h: '/interests', l: 'My Interest', I: Sparkles, c: d.interestsCount }, { h: '/gift-cards', l: 'Gift Cards', I: Gift, c: d.giftCardsCount }, { h: '/notifications', l: 'Notifications', I: Bell, c: d.unreadNotifications }, { h: '/profile', l: 'Profile and KYC', I: User }];

  return (
    <div className="section py-4 sm:py-6">
      <PageTitle title={`Namaste, ${d.user.name?.split(' ')[0] || 'there'}`} subtitle={`${d.user.memberTier} • +91 ${d.user.mobile}`} right={<button onClick={logout} className="btn-ghost !px-3 text-xs">Logout</button>} />
      {(!d.user.kycVerified || !d.user.bankLinked) && <Link href="/profile" className="mb-4 flex items-center gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900"><AlertTriangle size={18} /><span className="flex-1">{!d.user.kycVerified ? 'Complete PAN KYC to buy and redeem gold.' : 'Link a bank account to receive sell payouts.'}</span><ChevronRight size={16} /></Link>}
      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/digi-gold" className="rounded-2xl bg-primary p-5 text-white shadow-soft">
          <div className="flex items-center justify-between"><p className="flex items-center gap-2 font-semibold"><Coins size={18} className="text-accent" />Digi Gold vault</p><ChevronRight size={18} /></div>
          <p className="mt-3 text-3xl font-bold">{gm(d.digiGold.grams)}</p>
          <p className="text-sm opacity-85">Worth {inr(d.digiGold.currentValue)} <span className={cls('ml-1 text-xs', d.digiGold.pnl >= 0 ? 'text-emerald-300' : 'text-rose-300')}>{pct(d.digiGold.pnlPct)}</span></p>
          <p className="mt-2 text-[11px] opacity-70">24K 999.9 • Buy {inr(d.digiGold.buyRate)} • Sell {inr(d.digiGold.sellRate)} per gm</p>
        </Link>
        <div className="grid grid-cols-2 gap-4">
          <Link href="/ema" className="card p-4"><p className="flex items-center gap-2 text-xs font-semibold text-muted"><PiggyBank size={14} className="text-primary" />Swarn Sanchay</p>{d.ema.length ? <><p className="mt-2 text-xl font-bold text-primary">{d.ema[0].paidCount}/{d.ema[0].tenureMonths}</p><p className="text-xs text-muted">{inr(d.ema[0].monthlyAmount)}/mo • {gm(d.ema[0].goldAccumulatedGrams)}</p>{d.ema[0].nextInstallment && <Badge status={d.ema[0].nextInstallment.status} className="mt-2">{d.ema[0].nextInstallment.status === 'DUE' ? `Due ${fmtDate(d.ema[0].nextInstallment.dueDate)}` : `Next ${fmtDate(d.ema[0].nextInstallment.dueDate)}`}</Badge>}</> : <p className="mt-2 text-sm text-muted">Start a plan</p>}</Link>
          <Link href="/book-my-gold" className="card p-4"><p className="flex items-center gap-2 text-xs font-semibold text-muted"><Lock size={14} className="text-primary" />Rate locks</p>{d.bookings.length ? <><p className="mt-2 text-xl font-bold text-primary">{d.bookings[0].grams} gm</p><p className="text-xs text-muted">@ {inr(d.bookings[0].lockedRate)} • {d.bookings[0].daysLeft} days left</p></> : <p className="mt-2 text-sm text-muted">No active lock</p>}</Link>
          <Link href="/advance-gold" className="card col-span-2 p-4"><p className="flex items-center gap-2 text-xs font-semibold text-muted"><Landmark size={14} className="text-primary" />Advance Gold credit</p><div className="mt-2 flex items-end justify-between"><p className="text-xl font-bold text-primary">{inr(d.advanceGold.availableBalance)}</p><p className="text-xs text-muted">{gm(d.advanceGold.grams)} {d.advanceGold.purity} • {d.advanceGold.activeContracts} active</p></div></Link>
        </div>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        <div className="card divide-y divide-cream-dark">{links.map(({ h, l, I, c }) => <Link key={h} href={h} className="flex items-center gap-3 px-4 py-3.5 text-sm hover:bg-cream/50"><I size={18} className="text-primary" /><span className="flex-1 font-medium">{l}</span>{c > 0 && <span className="rounded-full bg-accent/20 px-2 py-0.5 text-xs font-bold text-primary-dark">{c}</span>}<ChevronRight size={16} className="text-muted" /></Link>)}</div>
        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between"><p className="font-semibold text-primary">Recent transactions</p><Link href="/transactions" className="text-xs font-semibold text-primary underline">View all</Link></div>
          <div className="mb-3 grid grid-cols-2 gap-2 text-center text-xs"><div className="rounded-xl bg-cream/70 p-3"><p className="text-muted">Total transacted</p><p className="text-base font-bold text-primary">{inr(d.transactionSummary.totalTransacted)}</p></div><div className="rounded-xl bg-cream/70 p-3"><p className="text-muted">Gold accumulated</p><p className="text-base font-bold text-primary">{gm(d.transactionSummary.goldAccumulatedGrams)}</p></div></div>
          <ul className="divide-y divide-cream-dark">{d.recentTransactions.map((t) => <li key={t.id} className="flex items-center justify-between py-2.5 text-sm"><div className="min-w-0"><p className="truncate font-medium">{t.title}</p><p className="text-xs text-muted">{fmtDateTime(t.createdAt)} • {t.txnNo}</p></div><div className="shrink-0 text-right"><p className="font-semibold">{inr(t.amount)}</p><Badge status={t.status} /></div></li>)}</ul>
        </div>
      </div>
      <p className="mt-6 flex items-center justify-center gap-1 text-[11px] text-muted"><ShieldCheck size={12} />Your gold is 100% physically backed and insured.</p>
    </div>
  );
}

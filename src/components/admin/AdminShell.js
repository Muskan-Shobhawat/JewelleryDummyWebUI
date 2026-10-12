'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, TrendingUp, Package, FolderTree, Layers, Image as ImageIcon, HelpCircle, MapPin, ShoppingBag, PiggyBank, Users, Receipt, LifeBuoy, Bell, Settings, Menu, X, LogOut, ExternalLink, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useConfig } from '@/context/ConfigContext';
import { Skeleton } from '@/components/ui/Bits';
import { cls } from '@/lib/format';

const NAV = [
  { group: 'Overview', items: [{ href: '/admin', label: 'Dashboard', icon: LayoutDashboard }, { href: '/admin/rates', label: 'Rates', icon: TrendingUp }] },
  { group: 'Catalog', items: [{ href: '/admin/products', label: 'Products', icon: Package }, { href: '/admin/categories', label: 'Categories', icon: FolderTree }, { href: '/admin/collections', label: 'Collections', icon: Layers }] },
  { group: 'Content', items: [{ href: '/admin/banners', label: 'Banners', icon: ImageIcon }, { href: '/admin/faqs', label: 'FAQs', icon: HelpCircle }, { href: '/admin/branches', label: 'Branches', icon: MapPin }] },
  { group: 'Operations', items: [{ href: '/admin/orders', label: 'Orders', icon: ShoppingBag }, { href: '/admin/schemes', label: 'Schemes', icon: PiggyBank }, { href: '/admin/customers', label: 'Customers', icon: Users }, { href: '/admin/transactions', label: 'Transactions', icon: Receipt }, { href: '/admin/support', label: 'Support', icon: LifeBuoy }, { href: '/admin/notifications', label: 'Notifications', icon: Bell }] },
  { group: 'Store', items: [{ href: '/admin/settings', label: 'Settings', icon: Settings }] },
];

export default function AdminShell({ children }) {
  const { user, ready, isLoggedIn, openLogin, logout } = useAuth();
  const { config } = useConfig();
  const path = usePathname();
  const [open, setOpen] = useState(false);

  if (!ready) return <div className="mx-auto w-full max-w-md p-8"><Skeleton className="h-48" /></div>;

  if (!isLoggedIn || user.role !== 'ADMIN') {
    return (
      <div className="grid min-h-screen place-items-center bg-cream/50 px-4">
        <div className="card w-full max-w-sm p-8 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-primary font-heading text-xl text-accent">{config.brand.shortName?.[0] || 'K'}</span>
          <h1 className="mt-4 text-xl font-semibold text-primary">{config.brand.name} Admin</h1>
          {!isLoggedIn ? (
            <>
              <p className="mt-2 text-sm text-muted">Log in with an admin mobile number to continue.</p>
              {config.demo?.adminMobile && <p className="mt-3 rounded-lg bg-cream px-3 py-2 text-xs text-muted">Demo admin: <b className="text-primary">{config.demo.adminMobile}</b>{config.demo.otp && <> • OTP <b className="text-primary">{config.demo.otp}</b></>}</p>}
              <button onClick={openLogin} className="btn-primary mt-5 w-full">Login</button>
            </>
          ) : (
            <>
              <p className="mt-2 flex items-center justify-center gap-1.5 text-sm text-danger"><ShieldAlert size={16} />+91 {user.mobile} is not an admin account.</p>
              <button onClick={logout} className="btn-outline mt-5 w-full"><LogOut size={16} />Log out and switch account</button>
            </>
          )}
          <Link href="/" className="mt-4 inline-block text-xs font-semibold text-primary underline">Back to store</Link>
        </div>
      </div>
    );
  }

  const isActive = (href) => (href === '/admin' ? path === '/admin' : path?.startsWith(href));
  const sidebar = (
    <nav className="flex h-full flex-col">
      <Link href="/admin" className="flex items-center gap-2 px-5 py-5" onClick={() => setOpen(false)}>
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-accent font-heading text-lg text-primary-dark">{config.brand.shortName?.[0] || 'K'}</span>
        <span><span className="block font-heading text-base font-semibold text-white">{config.brand.shortName || config.brand.name}</span><span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-accent">Admin</span></span>
      </Link>
      <div className="no-scrollbar flex-1 overflow-y-auto px-3 pb-4">
        {NAV.map((g) => (
          <div key={g.group} className="mt-4">
            <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">{g.group}</p>
            {g.items.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} onClick={() => setOpen(false)} className={cls('flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition', isActive(href) ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white')}>
                <Icon size={17} className={isActive(href) ? 'text-accent' : ''} />{label}
              </Link>
            ))}
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 p-3">
        <Link href="/" target="_blank" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white"><ExternalLink size={17} />View store</Link>
        <button onClick={logout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white"><LogOut size={17} />Log out</button>
      </div>
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-cream/40">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 bg-primary-dark lg:block">{sidebar}</aside>
      {open && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-primary-dark shadow-soft">
            <button onClick={() => setOpen(false)} className="absolute right-3 top-5 text-white/70" aria-label="Close menu"><X size={20} /></button>
            {sidebar}
          </aside>
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-cream-dark bg-white/95 px-4 backdrop-blur sm:px-6">
          <button className="rounded-full p-1.5 text-primary hover:bg-cream lg:hidden" onClick={() => setOpen(true)} aria-label="Menu"><Menu size={20} /></button>
          <p className="text-sm font-semibold text-primary lg:hidden">Admin</p>
          <div className="ml-auto flex items-center gap-2 text-sm">
            <span className="hidden text-muted sm:inline">{user.name || 'Admin'}</span>
            <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-xs font-semibold text-white">{(user.name || 'A')[0]}</span>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
}

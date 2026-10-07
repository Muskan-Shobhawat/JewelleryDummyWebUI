'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, Search, Heart, ShoppingBag, User, Bell, X, LogOut, Wallet, Receipt, Sparkles, MessageCircle } from 'lucide-react';
import { useConfig } from '@/context/ConfigContext';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useApi } from '@/lib/api';
import { cls } from '@/lib/format';

export default function Header() {
  const { config } = useConfig();
  const { user, isLoggedIn, openLogin, logout } = useAuth();
  const cart = useCart();
  const path = usePathname();
  const router = useRouter();
  const [menu, setMenu] = useState(false);
  const [q, setQ] = useState('');
  const { data: notes } = useApi(isLoggedIn ? '/me/notifications' : null);
  const unread = notes ? notes.filter((n) => !n.read).length : 0;
  const submit = (e) => { e.preventDefault(); if (q.trim()) { router.push(`/search?q=${encodeURIComponent(q.trim())}`); setQ(''); } };

  return (
    <>
      {config.announcement && <div className="bg-primary-dark px-4 py-1.5 text-center text-[11px] font-medium tracking-wide text-cream sm:text-xs">{config.announcement}</div>}
      <header className="sticky top-0 z-50 border-b border-cream-dark bg-white/95 backdrop-blur">
        <div className="section flex h-16 items-center gap-3">
          <button className="rounded-full p-2 text-primary hover:bg-cream lg:hidden" onClick={() => setMenu(true)} aria-label="Menu"><Menu size={22} /></button>
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary font-heading text-lg text-accent">{config.brand.shortName?.[0] || 'K'}</span>
            <span className="whitespace-nowrap font-heading text-lg font-semibold text-primary sm:text-xl">{config.brand.name}</span>
          </Link>
          <nav className="ml-4 hidden items-center lg:flex xl:ml-8">
            {config.nav.map((n) => <Link key={n.path} href={n.path} className={cls('whitespace-nowrap rounded-lg px-2 py-2 text-[13px] font-medium transition hover:bg-cream', path === n.path ? 'text-primary' : 'text-ink/80')}>{n.label}</Link>)}
          </nav>
          <form onSubmit={submit} className="ml-auto hidden md:block lg:hidden xl:block"><div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" className="h-10 w-40 rounded-full border border-cream-dark bg-cream/50 pl-9 pr-4 text-sm outline-none focus:border-primary" /></div></form>
          <div className="ml-auto flex shrink-0 items-center gap-0.5 md:ml-0 xl:ml-0">
            <Link href="/search" className="rounded-full p-2 text-primary hover:bg-cream md:hidden lg:block xl:hidden" aria-label="Search"><Search size={21} /></Link>
            <Link href="/wishlist" className="relative rounded-full p-2 text-primary hover:bg-cream" aria-label="Wishlist"><Heart size={21} />{user?.wishlist?.length > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-primary-dark">{user.wishlist.length}</span>}</Link>
            <Link href="/cart" className="relative rounded-full p-2 text-primary hover:bg-cream" aria-label="Bag"><ShoppingBag size={21} />{cart?.count > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-primary-dark">{cart.count}</span>}</Link>
            {isLoggedIn && <Link href="/notifications" className="relative hidden rounded-full p-2 text-primary hover:bg-cream sm:block" aria-label="Notifications"><Bell size={21} />{unread > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent" />}</Link>}
            {isLoggedIn ? <Link href="/wallet" className="ml-1 hidden items-center gap-2 rounded-full border border-cream-dark py-1 pl-1 pr-3 text-sm font-semibold text-primary hover:bg-cream sm:flex"><span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-xs text-white">{(user.name || 'U')[0]}</span>{(user.name || 'Account').split(' ')[0]}</Link>
              : <button onClick={openLogin} className="ml-1 hidden items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark sm:flex"><User size={16} />Login</button>}
            {!isLoggedIn && <button onClick={openLogin} className="rounded-full p-2 text-primary sm:hidden" aria-label="Login"><User size={21} /></button>}
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {menu && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setMenu(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-[82%] max-w-xs flex-col bg-white shadow-soft">
            <div className="flex items-center justify-between bg-primary px-5 py-5 text-white">
              <div>{isLoggedIn ? <><p className="font-semibold">{user.name || 'Welcome'}</p><p className="text-xs opacity-80">+91 {user.mobile} • {user.memberTier}</p></> : <><p className="font-heading text-lg">{config.brand.name}</p><p className="text-xs opacity-80">{config.brand.tagline}</p></>}</div>
              <button onClick={() => setMenu(false)} aria-label="Close"><X size={22} /></button>
            </div>
            <nav className="flex-1 overflow-y-auto py-2">
              {config.nav.map((n) => <Link key={n.path} href={n.path} onClick={() => setMenu(false)} className={cls('block px-5 py-3 text-sm font-medium', path === n.path ? 'bg-cream text-primary' : 'text-ink')}>{n.label}</Link>)}
              <div className="my-2 border-t border-cream-dark" />
              {[{ h: '/wallet', l: 'My Wallet', I: Wallet }, { h: '/transactions', l: 'My Transactions', I: Receipt }, { h: '/interests', l: 'My Interest', I: Sparkles }, { h: '/notifications', l: 'Notifications', I: Bell }, { h: '/profile', l: 'Profile and KYC', I: User }].map(({ h, l, I }) => <Link key={h} href={h} onClick={() => setMenu(false)} className="flex items-center gap-3 px-5 py-3 text-sm text-ink"><I size={18} className="text-primary" />{l}</Link>)}
              <a href={config.contact.whatsappUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 px-5 py-3 text-sm text-ink"><MessageCircle size={18} className="text-[#25D366]" />Chat on WhatsApp</a>
            </nav>
            <div className="border-t border-cream-dark p-4">{isLoggedIn ? <button onClick={() => { logout(); setMenu(false); }} className="btn-outline w-full"><LogOut size={16} />Logout</button> : <button onClick={() => { setMenu(false); openLogin(); }} className="btn-primary w-full">Login or sign up</button>}</div>
          </aside>
        </div>
      )}
    </>
  );
}

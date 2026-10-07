'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Gem, Wallet, Receipt, Phone } from 'lucide-react';
import { useConfig } from '@/context/ConfigContext';
import { cls } from '@/lib/format';

const ICONS = { home: Home, gem: Gem, wallet: Wallet, receipt: Receipt, phone: Phone };
export default function BottomNav() {
  const { config } = useConfig();
  const path = usePathname();
  return (
    <nav className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-primary-dark/40 bg-primary text-cream md:hidden">
      <div className="grid grid-cols-5">
        {config.bottomNav.map((n) => { const I = ICONS[n.icon] || Home; const active = n.path === '/' ? path === '/' : path.startsWith(n.path); return (
          <Link key={n.path} href={n.path} className={cls('flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition', active ? 'text-accent' : 'text-cream/80')}><I size={20} strokeWidth={active ? 2.4 : 1.8} />{n.label}</Link>); })}
      </div>
    </nav>
  );
}

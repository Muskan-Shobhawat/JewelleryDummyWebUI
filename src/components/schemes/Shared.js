'use client';
import { CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { EmptyState } from '@/components/ui/Bits';
import { LogIn } from 'lucide-react';

export function Benefits({ items = [] }) {
  return (
    <ul className="space-y-3">
      {items.map((b, i) => <li key={i} className="flex items-start gap-3"><span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-white"><CheckCircle2 size={15} /></span><div><p className="text-sm font-medium text-ink">{b.en}</p>{b.hi && <p className="text-xs text-muted">{b.hi}</p>}</div></li>)}
    </ul>
  );
}

export function SchemeHero({ title, titleHi, subtitle, children }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-primary px-5 py-6 text-white shadow-soft sm:px-8 sm:py-8">
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/20" /><div className="absolute -bottom-12 right-20 h-32 w-32 rounded-full bg-white/5" />
      <div className="relative"><h1 className="font-heading text-2xl font-semibold sm:text-3xl">{title}{titleHi && <span className="ml-2 text-lg text-accent-light">{titleHi}</span>}</h1><p className="mt-2 max-w-2xl text-sm opacity-85 sm:text-base">{subtitle}</p>{children}</div>
    </div>
  );
}

export function LoginGate({ title = 'Login to continue', text = 'Sign in with your mobile number to view your account.' }) {
  const { openLogin } = useAuth();
  return <EmptyState icon={LogIn} title={title} text={text} action={<button onClick={openLogin} className="btn-primary">Login or sign up</button>} />;
}

export function Divider({ label }) { return <div className="flex items-center gap-3 py-2"><span className="h-px flex-1 bg-cream-dark" /><span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{label}</span><span className="h-px flex-1 bg-cream-dark" /></div>; }

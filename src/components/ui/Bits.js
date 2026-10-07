'use client';
import Link from 'next/link';
import { ChevronRight, Inbox } from 'lucide-react';
import { cls, STATUS_TONE, titleCase } from '@/lib/format';

export const Img = ({ src, alt = '', className = '', fallback = 'https://dummyimage.com/600x600/f7efea/4a1942.png&text=Kanak' }) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src={src || fallback} alt={alt} loading="lazy" className={className} onError={(e) => { if (e.currentTarget.src !== fallback) e.currentTarget.src = fallback; }} />
);

export const SectionHeader = ({ eyebrow, title, link, linkLabel = 'View all', className = '' }) => (
  <div className={cls('mb-4 flex items-end justify-between gap-4', className)}>
    <div>{eyebrow && <p className="eyebrow mb-1">{eyebrow}</p>}<h2 className="text-xl font-semibold text-primary sm:text-2xl">{title}</h2></div>
    {link && <Link href={link} className="flex shrink-0 items-center gap-0.5 text-sm font-semibold text-primary hover:underline">{linkLabel}<ChevronRight size={16} /></Link>}
  </div>
);

export const Badge = ({ status, children, className = '' }) => (
  <span className={cls('inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide', STATUS_TONE[status] || 'bg-cream text-muted', className)}>{children ?? titleCase(status)}</span>
);

export const Skeleton = ({ className = '' }) => <div className={cls('skeleton rounded-xl', className)} />;

export const EmptyState = ({ icon: Icon = Inbox, title, text, action }) => (
  <div className="card flex flex-col items-center px-6 py-12 text-center">
    <div className="mb-3 rounded-full bg-cream p-4 text-primary"><Icon size={28} /></div>
    <h3 className="text-lg font-semibold text-primary">{title}</h3>
    {text && <p className="mt-1 max-w-sm text-sm text-muted">{text}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export const Stat = ({ label, value, sub, className = '' }) => (
  <div className={cls('rounded-xl bg-cream/70 px-4 py-3', className)}><p className="text-[11px] font-semibold uppercase tracking-wide text-muted">{label}</p><p className="mt-0.5 text-lg font-bold text-primary">{value}</p>{sub && <p className="text-xs text-muted">{sub}</p>}</div>
);

export const Tabs = ({ tabs, value, onChange, className = '' }) => (
  <div className={cls('no-scrollbar flex gap-2 overflow-x-auto', className)}>
    {tabs.map((t) => <button key={t.key ?? t.value ?? t} onClick={() => onChange(t.key ?? t.value ?? t)} className={cls('chip', (t.key ?? t.value ?? t) === value ? 'chip-active' : 'chip-idle')}>{t.label ?? t}{t.count != null && <span className="ml-1.5 opacity-70">({t.count})</span>}</button>)}
  </div>
);

export const Presets = ({ values, value, onChange, format = (v) => v, className = '' }) => (
  <div className={cls('flex flex-wrap gap-2', className)}>
    {values.map((v) => <button type="button" key={v} onClick={() => onChange(v)} className={cls('chip', v === value ? 'chip-active' : 'chip-idle')}>{format(v)}</button>)}
  </div>
);

export const Row = ({ label, value, bold, className = '' }) => (
  <div className={cls('flex items-center justify-between gap-3 py-1.5 text-sm', bold ? 'border-t border-cream-dark pt-3 text-base font-bold text-primary' : 'text-ink', className)}><span className={bold ? '' : 'text-muted'}>{label}</span><span>{value}</span></div>
);

export const Spinner = ({ className = '' }) => <span className={cls('inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent', className)} />;

export const PageTitle = ({ title, subtitle, back, right }) => (
  <div className="mb-5 flex items-start justify-between gap-4">
    <div className="flex items-start gap-2">{back && <Link href={back} className="mt-1 rounded-full p-1 text-primary hover:bg-cream" aria-label="Back"><ChevronRight size={22} className="rotate-180" /></Link>}<div><h1 className="text-2xl font-semibold text-primary sm:text-3xl">{title}</h1>{subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}</div></div>
    {right}
  </div>
);

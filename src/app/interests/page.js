'use client';
import WhatsAppIcon from '@/components/ui/WhatsAppIcon';
import { useState } from 'react';
import Link from 'next/link';
import { Sparkles, CalendarClock, Trash2 } from 'lucide-react';
import { useApi, del } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Badge, Skeleton, PageTitle, EmptyState, Img, Tabs } from '@/components/ui/Bits';
import { LoginGate } from '@/components/schemes/Shared';
import { inr, fmtDateTime } from '@/lib/format';

export default function InterestsPage() {
  const { ready, isLoggedIn } = useAuth();
  const toast = useToast();
  const { data, extras, mutate } = useApi(isLoggedIn ? '/me/interests' : null);
  const [tab, setTab] = useState('all');
  const rows = (data || []).filter((i) => tab === 'all' || (tab === 'bridal' && i.product?.tags?.includes('bridal')) || (tab === 'diamond' && i.product?.metal === 'DIAMOND') || (tab === 'gold' && i.product?.metal === 'GOLD' && !i.product?.tags?.includes('bridal')));
  const remove = async (id) => { try { await del(`/me/interests/${id}`); mutate(); toast('Removed', 'info'); } catch (e) { toast(e.message, 'error'); } };
  return (
    <div className="section py-4 sm:py-6">
      <PageTitle title="My Interest" subtitle="Track custom quotes, consultation dates and showroom previews for your shortlisted pieces." />
      {!ready ? <Skeleton className="h-40" /> : !isLoggedIn ? <LoginGate title="My Interest" /> : !data ? <Skeleton className="h-40" /> : !data.length ? <EmptyState icon={Sparkles} title="No interests logged" text="Tap Express interest on any product to get a personalised quote." action={<Link href="/jewellery" className="btn-primary">Explore jewellery</Link>} /> : (
        <>
          <Tabs className="mb-4" value={tab} onChange={setTab} tabs={[{ key: 'all', label: 'All', count: extras?.counts?.all }, { key: 'bridal', label: 'Bridal', count: extras?.counts?.bridal }, { key: 'gold', label: 'Gold', count: extras?.counts?.gold }, { key: 'diamond', label: 'Diamond', count: extras?.counts?.diamond }]} />
          <div className="grid gap-3 md:grid-cols-2">{rows.map((i) => (
            <div key={i.id} className="card flex gap-3 p-3">
              <Link href={`/jewellery/${i.product?.slug}`} className="h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-cream"><Img src={i.product?.images?.[0]} alt="" className="h-full w-full object-cover" /></Link>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2"><Link href={`/jewellery/${i.product?.slug}`} className="line-clamp-2 text-sm font-semibold hover:text-primary">{i.product?.name}</Link><button onClick={() => remove(i.id)} className="text-muted hover:text-danger" aria-label="Remove"><Trash2 size={15} /></button></div>
                <p className="text-xs text-muted">{i.product?.purity} • {i.product?.certification}</p>
                <Badge status={i.status} className="mt-1.5" />
                {i.quoteAmount && <p className="mt-1 text-sm font-bold text-primary">Quote {inr(i.quoteAmount)}</p>}
                {i.consultationAt && <p className="mt-1 flex items-center gap-1 text-xs text-muted"><CalendarClock size={12} />{fmtDateTime(i.consultationAt)}{i.branch ? ` • ${i.branch.name}` : ''}</p>}
                {i.note && <p className="mt-1 text-xs text-muted">“{i.note}”</p>}
                <div className="mt-2 flex gap-2"><a href={i.product?.whatsappUrl} target="_blank" rel="noreferrer" className="btn-whatsapp !px-3 !py-1.5 text-xs"><WhatsAppIcon size={13} />WhatsApp</a>{i.product && !i.product.price?.priceOnCall && <Link href={`/jewellery/${i.product.slug}`} className="btn-outline !px-3 !py-1.5 text-xs">Buy now</Link>}</div>
              </div>
            </div>))}</div>
        </>)}
    </div>
  );
}

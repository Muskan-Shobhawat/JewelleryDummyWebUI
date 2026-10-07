'use client';
import WhatsAppIcon from '@/components/ui/WhatsAppIcon';
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { useApi } from '@/lib/api';
import { Skeleton } from '@/components/ui/Bits';
import ProductCard from '@/components/product/ProductCard';

function SearchInner() {
  const sp = useSearchParams(); const router = useRouter();
  const initial = sp.get('q') || '';
  const [q, setQ] = useState(initial);
  const [debounced, setDebounced] = useState(initial);
  useEffect(() => { const t = setTimeout(() => setDebounced(q.trim()), 300); return () => clearTimeout(t); }, [q]);
  const { data, isLoading } = useApi(`/search?q=${encodeURIComponent(debounced)}`);
  return (
    <div className="section py-4 sm:py-6">
      <form onSubmit={(e) => { e.preventDefault(); router.replace(`/search?q=${encodeURIComponent(q)}`); }} className="relative"><Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" /><input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search rings, mangalsutra, diamond, coin..." className="input !py-3.5 pl-12 text-base" /></form>
      {!debounced && data?.trending && <div className="mt-5"><p className="label">Trending searches</p><div className="flex flex-wrap gap-2">{data.trending.map((t) => <button key={t} onClick={() => setQ(t)} className="chip chip-idle">{t}</button>)}</div></div>}
      {debounced && (
        <div className="mt-5 space-y-6">
          {(data?.categories?.length > 0 || data?.collections?.length > 0) && <div className="flex flex-wrap gap-2">{data.categories.map((c) => <Link key={c.id} href={`/jewellery?category=${c.slug}`} className="chip chip-active">{c.name}</Link>)}{data.collections.map((c) => <Link key={c.id} href={`/jewellery?collection=${c.slug}`} className="chip chip-idle">{c.name}</Link>)}</div>}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{isLoading && !data ? Array.from({ length: 4 }).map((_, k) => <Skeleton key={k} className="aspect-[3/4]" />) : data?.products?.map((p) => <ProductCard key={p.id} product={p} />)}</div>
          {data && !data.products.length && <div className="card p-6 text-center"><p className="font-semibold text-primary">No results for “{debounced}”</p><p className="mt-1 text-sm text-muted">Our team can source it for you.</p><a href={data.whatsappUrl} target="_blank" rel="noreferrer" className="btn-whatsapp mt-4"><WhatsAppIcon size={16} />Ask on WhatsApp</a></div>}
        </div>)}
    </div>
  );
}
export default function SearchPage() { return <Suspense fallback={<div className="section py-6"><Skeleton className="h-12" /></div>}><SearchInner /></Suspense>; }

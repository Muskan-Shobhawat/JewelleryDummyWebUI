'use client';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X } from 'lucide-react';
import { useApi } from '@/lib/api';
import { Skeleton, EmptyState, Tabs, Presets } from '@/components/ui/Bits';
import Modal from '@/components/ui/Modal';
import ProductCard from '@/components/product/ProductCard';
import { cls, inr } from '@/lib/format';

const SORTS = [['featured', 'Featured'], ['newest', 'Newest'], ['price_asc', 'Price: Low to High'], ['price_desc', 'Price: High to Low'], ['name_asc', 'Name: A to Z'], ['popular', 'Popular']];
const PRICE_BANDS = [[null, null, 'Any'], [0, 25000, 'Under ₹25k'], [25000, 50000, '₹25k - ₹50k'], [50000, 100000, '₹50k - ₹1L'], [100000, null, 'Above ₹1L']];

function Listing() {
  const sp = useSearchParams();
  const router = useRouter();
  const [filters, setFilters] = useState(false);
  const params = Object.fromEntries(sp.entries());
  const set = (patch) => { const next = { ...params, ...patch, page: patch.page ?? 1 }; for (const k of Object.keys(next)) if (next[k] == null || next[k] === '' || next[k] === 'all') delete next[k]; router.push(`/jewellery?${new URLSearchParams(next)}`); };
  const { data: products, extras, isLoading } = useApi(`/products?${new URLSearchParams({ limit: 24, ...params })}`);
  const { data: categories } = useApi('/categories');
  const { data: collections } = useApi('/collections');
  const pg = extras?.pagination;
  const activeCollection = collections?.find((c) => c.slug === params.collection);
  const activeCount = ['metal', 'purity', 'minPrice', 'tag'].filter((k) => params[k]).length;
  const title = activeCollection?.name || categories?.find((c) => c.slug === params.category)?.name || (params.tag ? { new: 'New Arrivals', bestseller: 'Best Sellers', trending: 'Trending', offer: 'Offers', bridal: 'Bridal', investment: 'Investment', gifting: 'Gifting' }[params.tag] : null) || 'All Jewellery';

  return (
    <div className="section py-4 sm:py-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div><p className="eyebrow">Jewellery</p><h1 className="text-2xl font-semibold text-primary sm:text-3xl">{title}</h1>{activeCollection && <p className="text-sm text-muted">{activeCollection.description}</p>}</div>
        <p className="text-xs text-muted">{pg ? `Showing ${products.length} of ${pg.total} pieces` : ''} • BIS Hallmarked • 100% Certified</p>
      </div>
      <div className="sticky top-16 z-30 -mx-4 bg-bg/95 px-4 py-2 backdrop-blur sm:mx-0 sm:px-0">
        <div className="flex items-center gap-2">
          <Tabs className="flex-1" value={params.category || 'all'} onChange={(v) => set({ category: v === 'all' ? null : v, collection: null })} tabs={[{ key: 'all', label: 'All' }, ...(categories || []).map((c) => ({ key: c.slug, label: c.name }))]} />
          <button onClick={() => setFilters(true)} className={cls('chip shrink-0', activeCount ? 'chip-active' : 'chip-idle')}><SlidersHorizontal size={14} className="mr-1" />Filters{activeCount ? ` (${activeCount})` : ''}</button>
          <select value={params.sort || 'featured'} onChange={(e) => set({ sort: e.target.value })} className="hidden h-8 shrink-0 rounded-full border border-cream-dark bg-white px-3 text-xs font-semibold sm:block">{SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
        </div>
      </div>
      {(params.collection || params.tag || params.q) && <div className="mt-3 flex flex-wrap gap-2">{['collection', 'tag', 'q'].filter((k) => params[k]).map((k) => <button key={k} onClick={() => set({ [k]: null })} className="chip chip-active">{params[k]}<X size={12} className="ml-1" /></button>)}</div>}

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {isLoading && !products ? Array.from({ length: 8 }).map((_, k) => <Skeleton key={k} className="aspect-[3/4]" />) : products?.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
      {products && !products.length && <div className="mt-6"><EmptyState title="No pieces match these filters" text="Try clearing a filter or browse another category." action={<button onClick={() => router.push('/jewellery')} className="btn-outline">Clear filters</button>} /></div>}
      {pg && pg.pages > 1 && <div className="mt-8 flex items-center justify-center gap-2">{Array.from({ length: pg.pages }).map((_, k) => <button key={k} onClick={() => set({ page: k + 1 })} className={cls('h-9 w-9 rounded-full text-sm font-semibold', pg.page === k + 1 ? 'bg-primary text-white' : 'bg-white text-primary hover:bg-cream')}>{k + 1}</button>)}</div>}

      <Modal open={filters} onClose={() => setFilters(false)} title="Filters" size="sm" footer={<div className="flex gap-2"><button onClick={() => { set({ metal: null, purity: null, minPrice: null, maxPrice: null, tag: null }); setFilters(false); }} className="btn-outline flex-1">Clear</button><button onClick={() => setFilters(false)} className="btn-primary flex-1">Show results</button></div>}>
        <div className="space-y-5">
          <div><p className="label">Sort</p><Presets values={SORTS.map(([v]) => v)} value={params.sort || 'featured'} onChange={(v) => set({ sort: v })} format={(v) => SORTS.find(([x]) => x === v)[1]} /></div>
          <div><p className="label">Metal</p><Presets values={['all', 'GOLD', 'DIAMOND', 'SILVER']} value={params.metal || 'all'} onChange={(v) => set({ metal: v === 'all' ? null : v })} format={(v) => v === 'all' ? 'Any' : v[0] + v.slice(1).toLowerCase()} /></div>
          <div><p className="label">Purity</p><Presets values={['all', '24K', '22K', '18K', '925', '999']} value={params.purity || 'all'} onChange={(v) => set({ purity: v === 'all' ? null : v })} format={(v) => v === 'all' ? 'Any' : v} /></div>
          <div><p className="label">Price</p><Presets values={PRICE_BANDS.map((b) => b[2])} value={PRICE_BANDS.find((b) => String(b[0] ?? '') === (params.minPrice || '') && String(b[1] ?? '') === (params.maxPrice || ''))?.[2] || 'Any'} onChange={(l) => { const b = PRICE_BANDS.find((x) => x[2] === l); set({ minPrice: b[0], maxPrice: b[1] }); }} /></div>
          <div><p className="label">Tag</p><Presets values={['all', 'new', 'bestseller', 'trending', 'bridal', 'offer', 'investment', 'gifting']} value={params.tag || 'all'} onChange={(v) => set({ tag: v === 'all' ? null : v })} format={(v) => v === 'all' ? 'Any' : v[0].toUpperCase() + v.slice(1)} /></div>
        </div>
      </Modal>
    </div>
  );
}
export default function JewelleryPage() { return <Suspense fallback={<div className="section py-6"><Skeleton className="h-10 w-48" /></div>}><Listing /></Suspense>; }

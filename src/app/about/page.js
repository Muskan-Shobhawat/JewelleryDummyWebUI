'use client';
import { useApi } from '@/lib/api';
import { Skeleton, PageTitle, Img } from '@/components/ui/Bits';
import { TrustBadges } from '@/components/home/HomeBlocks';

export default function AboutPage() {
  const { data } = useApi('/pages/about');
  if (!data) return <div className="section py-6"><Skeleton className="h-60" /></div>;
  return (
    <div className="section py-4 sm:py-6">
      <PageTitle title={`About ${data.brand.name}`} subtitle={data.brand.tagline} />
      <div className="grid gap-6 md:grid-cols-2">
        <div className="overflow-hidden rounded-2xl"><Img src="https://images.unsplash.com/photo-1688382654723-a7366006519b?auto=format&fit=crop&w=1200&q=80" alt="" className="aspect-[4/3] w-full object-cover" /></div>
        <div className="space-y-3 text-sm leading-relaxed text-ink/85">{data.story.map((s) => <p key={s}>{s}</p>)}
          <div className="grid grid-cols-2 gap-3 pt-2">{data.stats.map((s) => <div key={s.label} className="rounded-xl bg-primary p-4 text-white"><p className="text-2xl font-bold">{s.value}</p><p className="text-xs opacity-80">{s.label}</p></div>)}</div>
        </div>
      </div>
      <div className="mt-8"><TrustBadges /></div>
    </div>
  );
}

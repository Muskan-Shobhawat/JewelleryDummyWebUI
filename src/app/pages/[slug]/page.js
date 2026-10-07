'use client';
import { useParams } from 'next/navigation';
import { useApi } from '@/lib/api';
import { Skeleton, PageTitle } from '@/components/ui/Bits';

export default function StaticPage() {
  const { slug } = useParams();
  const { data, error } = useApi(`/pages/${slug}`);
  if (error) return <div className="section py-10 text-muted">Page not found.</div>;
  if (!data) return <div className="section py-6"><Skeleton className="h-60" /></div>;
  return <div className="section max-w-3xl py-4 sm:py-6"><PageTitle title={data.title} /><div className="card space-y-5 p-6">{data.sections.map((s) => <section key={s.heading}><h2 className="text-lg font-semibold text-primary">{s.heading}</h2><p className="mt-1 text-sm leading-relaxed text-ink/85">{s.body}</p></section>)}</div></div>;
}

'use client';
import { useState } from 'react';
import { useApi } from '@/lib/api';
import { Skeleton, PageTitle, Tabs } from '@/components/ui/Bits';
import FaqAccordion from '@/components/schemes/FaqAccordion';

const LABELS = { general: 'General', 'digigold-buy': 'Digi Gold: Buy', 'digigold-sell': 'Digi Gold: Sell', 'digigold-lease': 'Digi Gold: Lease', 'digigold-redeem': 'Digi Gold: Redeem', ema: 'Swarn Sanchay', 'book-gold': 'Book My Gold', 'advance-gold': 'Advance Gold' };
export default function FaqPage() {
  const { data } = useApi('/faqs');
  const [sec, setSec] = useState('general');
  return (
    <div className="section py-4 sm:py-6">
      <PageTitle title="Frequently asked questions" />
      {!data ? <Skeleton className="h-60" /> : <><Tabs className="mb-4" value={sec} onChange={setSec} tabs={data.sections.map((s) => ({ key: s, label: LABELS[s] || s }))} /><FaqAccordion faqs={data.rows.filter((f) => f.section === sec)} /></>}
    </div>
  );
}

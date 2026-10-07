'use client';
import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { cls } from '@/lib/format';

export default function FaqAccordion({ faqs = [], bilingual = true }) {
  const [open, setOpen] = useState(null);
  const [hi, setHi] = useState(false);
  if (!faqs.length) return null;
  return (
    <div>
      {bilingual && faqs.some((f) => f.questionHi) && <div className="mb-3 flex justify-end"><button onClick={() => setHi(!hi)} className="chip chip-idle">{hi ? 'English' : 'हिन्दी'}</button></div>}
      <div className="space-y-2">
        {faqs.map((f) => (
          <div key={f.id} className="card overflow-hidden">
            <button onClick={() => setOpen(open === f.id ? null : f.id)} className="flex w-full items-center gap-3 px-4 py-3.5 text-left">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-white"><HelpCircle size={16} /></span>
              <span className="flex-1"><span className="block text-sm font-semibold text-ink">{hi && f.questionHi ? f.questionHi : f.question}</span>{bilingual && !hi && f.questionHi && <span className="block text-xs text-muted">{f.questionHi}</span>}</span>
              <ChevronDown size={18} className={cls('shrink-0 text-muted transition', open === f.id && 'rotate-180')} />
            </button>
            {open === f.id && <div className="border-t border-cream-dark px-4 py-3 text-sm text-ink/85">{hi && f.answerHi ? f.answerHi : f.answer}</div>}
          </div>))}
      </div>
    </div>
  );
}

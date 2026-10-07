'use client';
import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cls } from '@/lib/format';

/** Bottom sheet on mobile, centered dialog on desktop */
export default function Modal({ open, onClose, title, children, size = 'md', footer }) {
  useEffect(() => { if (!open) return; const h = (e) => e.key === 'Escape' && onClose?.(); window.addEventListener('keydown', h); document.body.style.overflow = 'hidden'; return () => { window.removeEventListener('keydown', h); document.body.style.overflow = ''; }; }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-ink/50 backdrop-blur-[2px]" onClick={onClose} />
      <div className={cls('relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-soft sm:rounded-3xl', size === 'sm' ? 'sm:max-w-md' : size === 'lg' ? 'sm:max-w-3xl' : 'sm:max-w-xl')}>
        <div className="flex items-center justify-between border-b border-cream-dark px-5 py-4">
          <h3 className="text-lg font-semibold text-primary">{title}</h3>
          <button onClick={onClose} className="rounded-full p-1.5 text-muted hover:bg-cream" aria-label="Close"><X size={20} /></button>
        </div>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="border-t border-cream-dark px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
}

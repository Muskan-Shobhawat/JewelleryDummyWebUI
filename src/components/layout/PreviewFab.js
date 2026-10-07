'use client';
import { useSyncExternalStore } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MonitorSmartphone } from 'lucide-react';

const inIframe = () => typeof window !== 'undefined' && window.self !== window.top;
/** Floating "Device view" launcher. Hidden when the site is already inside the preview frame. */
export default function PreviewFab() {
  const path = usePathname();
  const framed = useSyncExternalStore(() => () => {}, inIframe, () => false);
  if (framed) return null;
  return (
    <Link href={`/preview?path=${encodeURIComponent(path || '/')}`} title="Preview on laptop, tablet and mobile" className="fixed bottom-20 left-4 z-40 flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-semibold text-primary shadow-soft ring-1 ring-cream-dark transition hover:bg-cream md:bottom-6 md:left-6">
      <MonitorSmartphone size={16} /><span className="hidden sm:inline">Device view</span>
    </Link>
  );
}

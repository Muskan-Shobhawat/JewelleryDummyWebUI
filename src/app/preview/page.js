'use client';
import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Laptop, Tablet, Smartphone, RotateCcw, RefreshCw, ExternalLink, X } from 'lucide-react';
import { useConfig } from '@/context/ConfigContext';
import { cls } from '@/lib/format';

const DEVICES = {
  mobile: { label: 'Mobile', I: Smartphone, w: 390, h: 844, radius: 44, bezel: 12 },
  tablet: { label: 'Tablet', I: Tablet, w: 820, h: 1180, radius: 28, bezel: 16 },
  laptop: { label: 'Laptop', I: Laptop, w: 1366, h: 820, radius: 14, bezel: 10 },
};
const PAGES = [['/', 'Home'], ['/jewellery', 'Jewellery'], ['/jewellery/aurelia-gold-ring', 'Product detail'], ['/digi-gold', 'Digi Gold'], ['/ema', 'Swarn Sanchay'], ['/book-my-gold', 'Book My Gold'], ['/advance-gold', 'Advance Gold'], ['/gift-cards', 'Gift Cards'], ['/cart', 'Bag'], ['/wallet', 'Wallet'], ['/transactions', 'Transactions'], ['/profile', 'Profile'], ['/contact', 'Contact'], ['/faq', 'FAQ']];

function Preview() {
  const sp = useSearchParams();
  const { config } = useConfig();
  const [device, setDevice] = useState(sp.get('device') || 'mobile');
  const [landscape, setLandscape] = useState(false);
  const [path, setPath] = useState(sp.get('path') || '/');
  const [src, setSrc] = useState(sp.get('path') || '/');
  const [scale, setScale] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const areaRef = useRef(null);
  const frameRef = useRef(null);
  const d = DEVICES[device];
  const w = landscape && device !== 'laptop' ? d.h : d.w;
  const h = landscape && device !== 'laptop' ? d.w : d.h;

  // Scale the device to fit the available area
  useEffect(() => {
    const fit = () => { const el = areaRef.current; if (!el) return; const pad = 32; setScale(Math.min(1, (el.clientWidth - pad) / (w + d.bezel * 2), (el.clientHeight - pad) / (h + d.bezel * 2))); };
    fit(); window.addEventListener('resize', fit); return () => window.removeEventListener('resize', fit);
  }, [w, h, d.bezel]);

  // Follow navigation inside the frame (same origin). Next navigates client-side, so poll the location.
  useEffect(() => {
    const t = setInterval(() => { try { const l = frameRef.current?.contentWindow?.location; if (l && l.origin === window.location.origin) { const p = l.pathname + l.search; setPath((cur) => (cur === p ? cur : p)); } } catch {} }, 500);
    return () => clearInterval(t);
  }, []);
  const go = (p) => { setPath(p); setSrc(p); };
  useEffect(() => { const q = new URLSearchParams({ device, path }); window.history.replaceState(null, '', `/preview?${q}`); }, [device, path]);

  return (
    <div className="flex h-screen flex-col bg-ink text-cream">
      <header className="flex flex-wrap items-center gap-2 border-b border-white/10 bg-primary-dark px-3 py-2 sm:px-4">
        <Link href={path} className="mr-2 flex items-center gap-2 font-heading text-base text-white"><span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-sm text-accent">{config.brand.shortName?.[0] || 'K'}</span><span className="hidden sm:inline">{config.brand.name}</span><span className="text-xs font-body text-cream/60">preview</span></Link>
        <div className="flex rounded-full bg-white/10 p-1">
          {Object.entries(DEVICES).map(([k, v]) => <button key={k} onClick={() => { setDevice(k); if (k === 'laptop') setLandscape(false); }} className={cls('flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition', device === k ? 'bg-accent text-primary-dark' : 'text-cream/80 hover:text-white')}><v.I size={15} /><span className="hidden sm:inline">{v.label}</span></button>)}
        </div>
        {device !== 'laptop' && <button onClick={() => setLandscape(!landscape)} title="Rotate" className="rounded-full bg-white/10 p-2 text-cream/80 hover:text-white"><RotateCcw size={15} /></button>}
        <span className="hidden text-xs text-cream/60 md:inline">{w} × {h}{scale < 1 ? ` • ${Math.round(scale * 100)}%` : ''}</span>
        <div className="ml-auto flex items-center gap-2">
          <select value={PAGES.some(([p]) => p === path) ? path : ''} onChange={(e) => go(e.target.value)} className="h-8 max-w-40 rounded-full border border-white/15 bg-white/10 px-3 text-xs text-white outline-none sm:max-w-none"><option value="" disabled>{path}</option>{PAGES.map(([p, l]) => <option key={p} value={p} className="text-ink">{l}</option>)}</select>
          <button onClick={() => setReloadKey((k) => k + 1)} title="Reload" className="rounded-full bg-white/10 p-2 text-cream/80 hover:text-white"><RefreshCw size={15} /></button>
          <a href={path} target="_blank" rel="noreferrer" title="Open in new tab" className="rounded-full bg-white/10 p-2 text-cream/80 hover:text-white"><ExternalLink size={15} /></a>
          <Link href={path} title="Exit preview" className="rounded-full bg-white/10 p-2 text-cream/80 hover:text-white"><X size={15} /></Link>
        </div>
      </header>
      <div ref={areaRef} className="flex flex-1 items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_0%,#3a1535,#15090f_70%)] p-4">
        <div style={{ width: (w + d.bezel * 2) * scale, height: (h + d.bezel * 2) * scale }}>
          <div className="relative origin-top-left bg-[#111] shadow-[0_30px_80px_-20px_rgba(0,0,0,.8)]" style={{ width: w + d.bezel * 2, height: h + d.bezel * 2, padding: d.bezel, borderRadius: d.radius + d.bezel, transform: `scale(${scale})` }}>
            {device === 'laptop' && <div className="absolute inset-x-0 -bottom-4 mx-auto h-4 w-[110%] -translate-x-[4.5%] rounded-b-xl bg-[#2b2b2b]" />}
            <iframe key={reloadKey} ref={frameRef} src={src} title="Site preview" className="block h-full w-full bg-white" style={{ borderRadius: d.radius }} />
          </div>
        </div>
      </div>
    </div>
  );
}
export default function PreviewPage() { return <Suspense fallback={<div className="h-screen bg-ink" />}><Preview /></Suspense>; }

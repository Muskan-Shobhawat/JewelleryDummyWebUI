'use client';
import WhatsAppIcon from '@/components/ui/WhatsAppIcon';
import Link from 'next/link';
import { Phone, Mail, MapPin } from 'lucide-react';

const Instagram = ({ size = 18 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>;
const Facebook = ({ size = 18 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>;
import { useConfig } from '@/context/ConfigContext';

export default function Footer() {
  const { config } = useConfig();
  const c = config.contact;
  const cols = [
    { title: 'Shop', links: [['New Arrivals', '/jewellery?tag=new'], ['Bestsellers', '/jewellery?tag=bestseller'], ['Trending', '/jewellery?tag=trending'], ['Coins and Bars', '/jewellery?category=coins'], ['Gift Cards', '/gift-cards']] },
    { title: 'Gold and Savings', links: [['Digi Gold', '/digi-gold'], [config.ema.title, '/ema'], ['Book My Gold', '/book-my-gold'], ['Advance Gold', '/advance-gold'], ['Live Rates', '/#rates']] },
    { title: 'Support', links: [['Contact us', '/contact'], ['FAQs', '/faq'], ['Track order', '/track-order'], ['About us', '/about'], ['Privacy policy', '/pages/privacy-policy'], ['Terms', '/pages/terms-and-conditions']] },
  ];
  return (
    <footer className="mt-16 bg-primary-dark text-cream/85">
      <div className="section grid gap-10 py-12 md:grid-cols-4">
        <div className="space-y-3">
          <p className="font-heading text-2xl text-white">{config.brand.name}</p>
          <p className="text-sm opacity-80">{config.brand.tagline}. BIS hallmarked gold, certified diamonds and gold savings plans since {config.brand.since}.</p>
          <div className="flex gap-2 pt-1">
            {c.instagram && <a href={c.instagram} target="_blank" rel="noreferrer" className="rounded-full bg-white/10 p-2 hover:bg-white/20" aria-label="Instagram"><Instagram size={18} /></a>}
            {c.facebook && <a href={c.facebook} target="_blank" rel="noreferrer" className="rounded-full bg-white/10 p-2 hover:bg-white/20" aria-label="Facebook"><Facebook size={18} /></a>}
            <a href={c.whatsappUrl} target="_blank" rel="noreferrer" className="rounded-full bg-white/10 p-2 hover:bg-white/20" aria-label="WhatsApp"><WhatsAppIcon size={18} /></a>
          </div>
        </div>
        {cols.map((col) => <div key={col.title}><p className="mb-3 text-sm font-bold uppercase tracking-wider text-accent">{col.title}</p><ul className="space-y-2 text-sm">{col.links.map(([l, h]) => <li key={h}><Link href={h} className="hover:text-white">{l}</Link></li>)}</ul></div>)}
      </div>
      <div className="border-t border-white/10">
        <div className="section flex flex-col gap-3 py-5 text-xs sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-x-5 gap-y-1">
            {c.tollFree && <span className="flex items-center gap-1.5"><Phone size={13} />{c.tollFree}</span>}
            {c.email && <span className="flex items-center gap-1.5"><Mail size={13} />{c.email}</span>}
            {c.city && <span className="flex items-center gap-1.5"><MapPin size={13} />{c.address}, {c.city}</span>}
          </div>
          <p className="opacity-70">© {new Date().getFullYear()} {config.brand.name}. Demo website.</p>
        </div>
      </div>
    </footer>
  );
}

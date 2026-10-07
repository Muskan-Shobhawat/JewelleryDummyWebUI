'use client';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import BottomNav from './BottomNav';
import WhatsAppFab from './WhatsAppFab';
import PreviewFab from './PreviewFab';

/** Wraps pages with header/footer/bottom nav, except on the device-preview route. */
export default function SiteChrome({ children }) {
  const path = usePathname();
  if (path?.startsWith('/preview')) return <main className="flex-1">{children}</main>;
  return (
    <>
      <Header />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <Footer />
      <BottomNav />
      <WhatsAppFab />
      <PreviewFab />
    </>
  );
}

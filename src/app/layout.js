import { Playfair_Display, DM_Sans } from 'next/font/google';
import './globals.css';
import AppProviders from '@/context/AppProviders';
import SiteChrome from '@/components/layout/SiteChrome';

const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', weight: ['500', '600', '700'] });
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dmsans', weight: ['400', '500', '600', '700'] });

export const metadata = {
  title: 'Kanak Jewellers | Tradition that defines elegance',
  description: 'BIS hallmarked gold and diamond jewellery, live gold rates, Digi Gold, Swarn Sanchay monthly gold savings and rate-lock booking.',
};
export const viewport = { themeColor: '#4A1942', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <AppProviders>
          <SiteChrome>{children}</SiteChrome>
        </AppProviders>
      </body>
    </html>
  );
}

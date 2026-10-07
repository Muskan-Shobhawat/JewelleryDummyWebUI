'use client';
import { createContext, useContext, useEffect } from 'react';
import { useApi } from '@/lib/api';

const FALLBACK = {
  brand: { name: 'Kanak Jewellers', shortName: 'Kanak', tagline: 'Tradition that defines elegance', logoUrl: '' },
  theme: {},
  contact: { whatsappNumber: '', whatsappUrl: '#', phone: '', email: '' },
  nav: [{ label: 'Home', path: '/' }, { label: 'Jewellery', path: '/jewellery' }, { label: 'Digi Gold', path: '/digi-gold' }, { label: 'Swarn Sanchay', path: '/ema' }, { label: 'Book My Gold', path: '/book-my-gold' }, { label: 'Advance Gold', path: '/advance-gold' }, { label: 'Gift Cards', path: '/gift-cards' }, { label: 'Contact', path: '/contact' }],
  bottomNav: [{ label: 'Home', path: '/', icon: 'home' }, { label: 'Jewellery', path: '/jewellery', icon: 'gem' }, { label: 'Wallet', path: '/wallet', icon: 'wallet' }, { label: 'My Txn', path: '/transactions', icon: 'receipt' }, { label: 'Contact', path: '/contact', icon: 'phone' }],
  digiGold: {}, ema: { title: 'Swarn Sanchay', presets: [] }, bookGold: {}, advanceGold: {}, checkout: { paymentMethods: [], deliveryOptions: [] }, giftCards: {}, trustBadges: [], coupons: [], demo: {},
};

const THEME_VARS = { primary: '--color-primary', primaryDark: '--color-primary-dark', primaryLight: '--color-primary-light', accent: '--color-accent', accentLight: '--color-accent-light', cream: '--color-cream', creamDark: '--color-cream-dark', background: '--color-bg', surface: '--color-surface', text: '--color-ink', textMuted: '--color-muted', success: '--color-success', danger: '--color-danger' };

const Ctx = createContext({ config: FALLBACK, loading: true });
export function ConfigProvider({ children }) {
  const { data, error, isLoading } = useApi('/config', { revalidateOnMount: true, dedupingInterval: 60000 });
  const config = data ? { ...FALLBACK, ...data } : FALLBACK;
  useEffect(() => {
    if (!data?.theme) return;
    const root = document.documentElement;
    for (const [k, v] of Object.entries(THEME_VARS)) if (data.theme[k]) root.style.setProperty(v, data.theme[k]);
    document.title = `${data.brand.name} | ${data.brand.tagline}`;
  }, [data]);
  return <Ctx.Provider value={{ config, loading: isLoading, error, apiDown: !!error }}>{children}</Ctx.Provider>;
}
export const useConfig = () => useContext(Ctx);

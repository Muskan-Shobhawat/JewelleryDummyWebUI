'use client';
import { MessageCircle } from 'lucide-react';
import { useConfig } from '@/context/ConfigContext';
export default function WhatsAppFab() {
  const { config } = useConfig();
  if (!config.contact.whatsappNumber) return null;
  return <a href={config.contact.whatsappUrl} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp" className="fixed bottom-20 right-4 z-40 grid h-13 w-13 place-items-center rounded-full bg-[#25D366] text-white shadow-soft transition hover:scale-105 md:bottom-6 md:right-6"><MessageCircle size={26} /></a>;
}

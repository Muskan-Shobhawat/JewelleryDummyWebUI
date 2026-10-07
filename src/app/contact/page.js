'use client';
import { useState } from 'react';
import { MessageCircle, Phone, Mail, MapPin, Clock, Send } from 'lucide-react';
import { useApi, post } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Skeleton, PageTitle, Spinner } from '@/components/ui/Bits';

const ICON = { WHATSAPP: MessageCircle, CALL: Phone, EMAIL: Mail };
export default function ContactPage() {
  const { data } = useApi('/contact');
  const { user } = useAuth();
  const toast = useToast();
  const [f, setF] = useState({ name: user?.name || '', mobile: user?.mobile || '', email: user?.email || '', subject: '', message: '' });
  const [busy, setBusy] = useState(false);
  const submit = async (e) => { e.preventDefault(); setBusy(true); try { const r = await post('/contact', f); toast(r.message); setF({ ...f, subject: '', message: '' }); } catch (err) { toast(err.message, 'error'); } finally { setBusy(false); } };
  return (
    <div className="section py-4 sm:py-6">
      <PageTitle title="Help and Support" subtitle="We respond within 2 working hours on all channels." />
      {!data ? <Skeleton className="h-40" /> : (
        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-4">
            <div className="grid gap-3">{data.channels.map((c) => { const I = ICON[c.type] || Phone; return <a key={c.type} href={c.url} target={c.type === 'WHATSAPP' ? '_blank' : undefined} rel="noreferrer" className="card flex items-center gap-3 p-4 hover:bg-cream/40"><span className={`grid h-11 w-11 place-items-center rounded-full text-white ${c.type === 'WHATSAPP' ? 'bg-[#25D366]' : 'bg-primary'}`}><I size={20} /></span><div><p className="text-sm font-semibold">{c.label}</p><p className="text-xs text-muted">{c.value}</p></div></a>; })}</div>
            <div className="card p-4"><p className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary"><Clock size={16} />Support hours</p><p className="text-sm">{data.supportHours}</p></div>
            {data.branches.map((b) => <div key={b.id} className="card p-4"><p className="flex items-center gap-2 text-sm font-semibold text-primary"><MapPin size={16} />{b.name}{b.isFlagship && <span className="rounded bg-accent/20 px-1.5 py-0.5 text-[10px] font-bold text-primary-dark">FLAGSHIP</span>}</p><p className="mt-1 text-sm">{b.address}, {b.city}, {b.state} {b.pincode}</p><p className="text-xs text-muted">{b.hours} • {b.phone}</p><a href={b.mapUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs font-semibold text-primary underline">Get directions</a></div>)}
          </div>
          <form onSubmit={submit} className="card h-fit p-5">
            <p className="font-semibold text-primary">Raise a ticket</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2"><div><label className="label">Name</label><input required className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div><div><label className="label">Mobile</label><input required inputMode="numeric" maxLength={10} className="input" value={f.mobile} onChange={(e) => setF({ ...f, mobile: e.target.value })} /></div><div className="sm:col-span-2"><label className="label">Email (optional)</label><input type="email" className="input" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div><div className="sm:col-span-2"><label className="label">Subject</label><input required className="input" value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} /></div><div className="sm:col-span-2"><label className="label">Message</label><textarea required rows={4} className="input" value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} /></div></div>
            <button disabled={busy} className="btn-primary mt-4 w-full">{busy ? <Spinner /> : <><Send size={16} />Send message</>}</button>
          </form>
        </div>)}
    </div>
  );
}

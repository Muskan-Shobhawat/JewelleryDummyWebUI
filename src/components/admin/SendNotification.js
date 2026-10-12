'use client';
import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Bits';
import { post } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

const TYPES = ['OFFER', 'ORDER', 'DIGI_GOLD', 'EMA', 'BOOKING', 'ADVANCE', 'GENERAL'];

/** userId = null sends to every customer. */
export default function SendNotification({ userId = null, recipient, onClose, onSent }) {
  const toast = useToast();
  const [v, setV] = useState({ title: '', body: '', link: '', type: 'OFFER' });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.value }));
  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    try { await post('/admin/ops/notifications', { userId, title: v.title, body: v.body, type: v.type, link: v.link || undefined }); toast('Notification sent'); onSent?.(); onClose(); }
    catch (err) { toast(err.message, 'error'); } finally { setBusy(false); }
  };
  return (
    <Modal open onClose={onClose} size="sm" title={userId ? `Notify ${recipient}` : 'Notify all customers'}>
      <form onSubmit={submit} className="space-y-4">
        <div><label className="label">Title</label><input className="input" required value={v.title} onChange={set('title')} placeholder="Diwali offer is live" autoFocus /></div>
        <div><label className="label">Message</label><textarea className="input min-h-24" required value={v.body} onChange={set('body')} placeholder="Flat 20% off making charges on all gold jewellery." /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Type</label><select className="input" value={v.type} onChange={set('type')}>{TYPES.map((t) => <option key={t}>{t}</option>)}</select></div>
          <div><label className="label">Link</label><input className="input" value={v.link} onChange={set('link')} placeholder="/jewellery" /></div>
        </div>
        <button className="btn-primary w-full" disabled={busy || !v.title || !v.body}>{busy ? <Spinner /> : 'Send'}</button>
      </form>
    </Modal>
  );
}

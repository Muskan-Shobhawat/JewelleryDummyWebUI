'use client';
import { useState } from 'react';
import { ShieldCheck, Smartphone, CreditCard, Landmark, CheckCircle2, XCircle } from 'lucide-react';
import Modal from './Modal';
import { Spinner } from './Bits';
import { post } from '@/lib/api';
import { inr, cls } from '@/lib/format';

const METHODS = [{ code: 'UPI', label: 'UPI', note: 'GPay, PhonePe, Paytm', icon: Smartphone }, { code: 'CARD', label: 'Card', note: 'Visa, Mastercard, RuPay', icon: CreditCard }, { code: 'NETBANKING', label: 'Net banking', note: 'All major banks', icon: Landmark }];

/** Simulated payment gateway UI shaped like a Razorpay checkout. */
export default function MockCheckout({ payment, onClose, onSuccess, onFailure }) {
  const [method, setMethod] = useState('UPI');
  const [vpa, setVpa] = useState('demo@upi');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null); // { ok, result }

  const confirm = async (outcome) => {
    setBusy(true);
    try {
      await new Promise((r) => setTimeout(r, 900));
      const r = await post(`/payments/${payment.paymentId}/confirm`, { outcome, method });
      const ok = r.data.payment.status === 'PAID';
      setDone({ ok, result: r.data.result, message: r.message });
      setTimeout(() => { onClose(); ok ? onSuccess?.(r.data.result) : onFailure?.(r.data.payment); }, 1400);
    } catch (e) { setDone({ ok: false, message: e.message }); setTimeout(() => { onClose(); onFailure?.(); }, 1400); } finally { setBusy(false); }
  };

  return (
    <Modal open onClose={busy ? undefined : onClose} title="Secure payment" size="sm">
      <div className="mb-4 flex items-center gap-3 rounded-xl bg-primary px-4 py-3 text-white">
        <div className="rounded-lg bg-white/15 p-2"><ShieldCheck size={22} /></div>
        <div className="min-w-0 flex-1"><p className="truncate text-xs opacity-80">{payment.name} • {payment.description}</p><p className="text-2xl font-bold">{inr(payment.amount)}</p></div>
      </div>
      {done ? (
        <div className="flex flex-col items-center py-6 text-center">
          {done.ok ? <CheckCircle2 size={56} className="text-success" /> : <XCircle size={56} className="text-danger" />}
          <p className="mt-3 text-lg font-semibold text-primary">{done.ok ? 'Payment successful' : 'Payment failed'}</p>
          <p className="text-sm text-muted">{done.message}</p>
        </div>
      ) : (
        <>
          <p className="label">Choose a payment method</p>
          <div className="grid gap-2">
            {METHODS.map((m) => (
              <button key={m.code} onClick={() => setMethod(m.code)} className={cls('flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition', method === m.code ? 'border-primary bg-cream/60' : 'border-cream-dark hover:border-primary/40')}>
                <m.icon size={20} className="text-primary" /><div className="flex-1"><p className="text-sm font-semibold">{m.label}</p><p className="text-xs text-muted">{m.note}</p></div>
                <span className={cls('h-4 w-4 rounded-full border-2', method === m.code ? 'border-primary bg-primary' : 'border-cream-dark')} />
              </button>
            ))}
          </div>
          {method === 'UPI' && <div className="mt-3"><label className="label">UPI ID</label><input className="input" value={vpa} onChange={(e) => setVpa(e.target.value)} /></div>}
          {method === 'CARD' && <div className="mt-3 grid grid-cols-2 gap-2"><input className="input col-span-2" placeholder="4111 1111 1111 1111" defaultValue="4111 1111 1111 1111" /><input className="input" placeholder="MM/YY" defaultValue="12/29" /><input className="input" placeholder="CVV" defaultValue="123" /></div>}
          <button disabled={busy} onClick={() => confirm('success')} className="btn-primary mt-4 w-full">{busy ? <Spinner /> : `Pay ${inr(payment.amount)}`}</button>
          <button disabled={busy} onClick={() => confirm('failure')} className="mt-2 w-full text-center text-xs text-muted underline">Simulate a failed payment</button>
          <p className="mt-3 flex items-center justify-center gap-1 text-[11px] text-muted"><ShieldCheck size={12} /> Demo gateway. No money moves.</p>
        </>
      )}
    </Modal>
  );
}

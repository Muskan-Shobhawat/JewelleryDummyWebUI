'use client';
import { useState } from 'react';
import { Phone, KeyRound } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Bits';
import { post } from '@/lib/api';
import { useConfig } from '@/context/ConfigContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function LoginSheet({ open, onClose }) {
  if (!open) return null;
  return <LoginForm onClose={onClose} />;
}

function LoginForm({ onClose }) {
  const { config } = useConfig();
  const { login } = useAuth();
  const toast = useToast();
  const [step, setStep] = useState('mobile');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [isNew, setIsNew] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const send = async (e) => {
    e?.preventDefault(); setErr(''); setBusy(true);
    try { const r = await post('/auth/send-otp', { mobile }); setIsNew(r.data.isNewUser); if (r.data.demoOtp) setOtp(r.data.demoOtp); setStep('otp'); toast(r.data.demoOtp ? `Demo OTP: ${r.data.demoOtp}` : 'OTP sent', 'info'); }
    catch (e) { setErr(e.message); } finally { setBusy(false); }
  };
  const verify = async (e) => {
    e?.preventDefault(); setErr(''); setBusy(true);
    try { await login({ mobile, otp, name: name || undefined }); toast('Welcome to ' + config.brand.name); }
    catch (e) { setErr(e.message); } finally { setBusy(false); }
  };

  return (
    <Modal open onClose={onClose} title={step === 'mobile' ? 'Login or sign up' : 'Enter OTP'} size="sm">
      <div className="mb-5 rounded-2xl bg-primary px-5 py-5 text-white">
        <p className="font-heading text-xl">{config.brand.name}</p>
        <p className="mt-1 text-sm opacity-80">{step === 'mobile' ? 'Continue with your mobile number' : `We sent a 6-digit code to +91 ${mobile}`}</p>
      </div>
      {step === 'mobile' ? (
        <form onSubmit={send} className="space-y-4">
          <div><label className="label">Mobile number</label><div className="relative"><Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" /><input className="input pl-11" inputMode="numeric" maxLength={10} placeholder="Enter mobile number" value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))} autoFocus /></div></div>
          {config.demo?.customerMobile && <button type="button" onClick={() => setMobile(config.demo.customerMobile)} className="text-xs font-semibold text-primary underline">Use demo customer ({config.demo.customerMobile})</button>}
          {err && <p className="text-sm text-danger">{err}</p>}
          <button className="btn-primary w-full" disabled={busy || mobile.length !== 10}>{busy ? <Spinner /> : 'Continue'}</button>
          <p className="text-center text-[11px] text-muted">By continuing, you agree to our Terms of Use and Privacy Policy.</p>
        </form>
      ) : (
        <form onSubmit={verify} className="space-y-4">
          <div><label className="label">OTP</label><div className="relative"><KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" /><input className="input pl-11 tracking-[0.4em]" inputMode="numeric" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} autoFocus /></div></div>
          {isNew && <div><label className="label">Your name</label><input className="input" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} /></div>}
          {err && <p className="text-sm text-danger">{err}</p>}
          <button className="btn-primary w-full" disabled={busy || otp.length < 4}>{busy ? <Spinner /> : 'Verify and continue'}</button>
          <div className="flex justify-between text-xs"><button type="button" className="text-muted underline" onClick={() => setStep('mobile')}>Change number</button><button type="button" className="font-semibold text-primary underline" onClick={send}>Resend OTP</button></div>
        </form>
      )}
    </Modal>
  );
}

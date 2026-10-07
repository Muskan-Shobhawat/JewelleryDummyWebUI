'use client';
import { useState } from 'react';
import { User, MapPin, ShieldCheck, Landmark, LogOut } from 'lucide-react';
import { patch, put, post } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Skeleton, PageTitle, Spinner, Badge } from '@/components/ui/Bits';
import { LoginGate } from '@/components/schemes/Shared';

function Section({ icon: I, title, badge, children }) { return <section className="card p-5"><div className="mb-4 flex items-center justify-between"><p className="flex items-center gap-2 font-semibold text-primary"><I size={18} />{title}</p>{badge}</div>{children}</section>; }
const F = ({ label, ...p }) => <div><label className="label">{label}</label><input className="input" {...p} /></div>;

export default function ProfilePage() {
  const { ready, isLoggedIn, user } = useAuth();
  if (!ready) return <div className="section py-6"><Skeleton className="h-40" /></div>;
  if (!isLoggedIn) return <div className="section py-6"><LoginGate title="Profile" /></div>;
  return <ProfileForms key={user.id} />;
}

function ProfileForms() {
  const { user, setUser, logout } = useAuth();
  const toast = useToast();
  const [p, setP] = useState(() => ({ name: user.name || '', email: user.email || '', dob: user.dob || '', anniversary: user.anniversary || '' }));
  const [addr, setAddr] = useState(() => ({ line1: '', line2: '', landmark: '', city: '', state: '', pincode: '', ...(user.address || {}) }));
  const [kyc, setKyc] = useState({ pan: '', panName: '' });
  const [bank, setBank] = useState({ holderName: '', accountNumber: '', ifsc: '', bankName: '' });
  const [busy, setBusy] = useState('');
  const run = (key, fn, msg) => async (e) => { e.preventDefault(); setBusy(key); try { const r = await fn(); setUser(r.data); toast(r.message || msg); } catch (err) { toast(err.message, 'error'); } finally { setBusy(''); } };
  return (
    <div className="section py-4 sm:py-6">
      <PageTitle title="Profile" subtitle={`+91 ${user.mobile} • ${user.memberTier}`} right={<button onClick={logout} className="btn-ghost !px-3 text-xs"><LogOut size={14} />Logout</button>} />
      <div className="grid gap-5 md:grid-cols-2">
        <form onSubmit={run('p', () => patch('/auth/me', { ...p, email: p.email || '' }), 'Profile updated')}><Section icon={User} title="Personal details"><div className="grid gap-3 sm:grid-cols-2"><F label="Full name" value={p.name} onChange={(e) => setP({ ...p, name: e.target.value })} required /><F label="Email" type="email" value={p.email} onChange={(e) => setP({ ...p, email: e.target.value })} /><F label="Date of birth" type="date" value={p.dob} onChange={(e) => setP({ ...p, dob: e.target.value })} /><F label="Anniversary" type="date" value={p.anniversary} onChange={(e) => setP({ ...p, anniversary: e.target.value })} /></div><button disabled={busy === 'p'} className="btn-primary mt-4">{busy === 'p' ? <Spinner /> : 'Save'}</button></Section></form>
        <form onSubmit={run('a', () => put('/auth/me/address', addr), 'Address saved')}><Section icon={MapPin} title="Delivery and showroom address"><div className="grid gap-3 sm:grid-cols-2"><div className="sm:col-span-2"><F label="Address line 1" value={addr.line1} onChange={(e) => setAddr({ ...addr, line1: e.target.value })} required /></div><F label="Address line 2" value={addr.line2} onChange={(e) => setAddr({ ...addr, line2: e.target.value })} /><F label="Landmark" value={addr.landmark} onChange={(e) => setAddr({ ...addr, landmark: e.target.value })} /><F label="City" value={addr.city} onChange={(e) => setAddr({ ...addr, city: e.target.value })} required /><F label="State" value={addr.state} onChange={(e) => setAddr({ ...addr, state: e.target.value })} required /><F label="Pincode" value={addr.pincode} onChange={(e) => setAddr({ ...addr, pincode: e.target.value })} required pattern="\d{6}" /></div><button disabled={busy === 'a'} className="btn-primary mt-4">{busy === 'a' ? <Spinner /> : 'Save address'}</button></Section></form>
        <form onSubmit={run('k', () => post('/auth/me/kyc', kyc), 'KYC verified')}><Section icon={ShieldCheck} title="KYC (PAN)" badge={<Badge status={user.kyc?.status === 'VERIFIED' ? 'SUCCESS' : 'PENDING'}>{user.kyc?.status || 'PENDING'}</Badge>}>{user.kyc?.status === 'VERIFIED' ? <p className="text-sm">PAN <b>{user.kyc.pan}</b> verified. PMLA and income-tax compliant for bullion delivery.</p> : <><p className="mb-3 text-xs text-muted">Required for Digi Gold redemption and purchases above ₹2 lakh.</p><div className="grid gap-3 sm:grid-cols-2"><F label="PAN" value={kyc.pan} onChange={(e) => setKyc({ ...kyc, pan: e.target.value.toUpperCase() })} maxLength={10} required /><F label="Name as on PAN" value={kyc.panName} onChange={(e) => setKyc({ ...kyc, panName: e.target.value })} required /></div><button disabled={busy === 'k'} className="btn-primary mt-4">{busy === 'k' ? <Spinner /> : 'Verify PAN'}</button></>}</Section></form>
        <form onSubmit={run('b', () => put('/auth/me/bank', bank), 'Bank linked')}><Section icon={Landmark} title="Bank account" badge={<Badge status={user.bank?.verified ? 'SUCCESS' : 'PENDING'}>{user.bank?.verified ? 'Verified' : 'Not linked'}</Badge>}>{user.bank?.verified && <p className="mb-3 rounded-xl bg-cream/70 px-3 py-2 text-sm">{user.bank.bankName} {user.bank.accountNumberMasked} • {user.bank.ifsc} • instant IMPS payouts</p>}<p className="mb-3 text-xs text-muted">{user.bank?.verified ? 'Update your account below.' : 'Needed to receive Digi Gold sell payouts.'}</p><div className="grid gap-3 sm:grid-cols-2"><F label="Account holder" value={bank.holderName} onChange={(e) => setBank({ ...bank, holderName: e.target.value })} required /><F label="Account number" value={bank.accountNumber} onChange={(e) => setBank({ ...bank, accountNumber: e.target.value })} required /><F label="IFSC" value={bank.ifsc} onChange={(e) => setBank({ ...bank, ifsc: e.target.value.toUpperCase() })} required /><F label="Bank name" value={bank.bankName} onChange={(e) => setBank({ ...bank, bankName: e.target.value })} /></div><button disabled={busy === 'b'} className="btn-primary mt-4">{busy === 'b' ? <Spinner /> : 'Link account'}</button></Section></form>
      </div>
    </div>
  );
}

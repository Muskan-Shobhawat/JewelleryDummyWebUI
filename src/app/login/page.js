'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LoginGate } from '@/components/schemes/Shared';

export default function LoginPage() {
  const { ready, isLoggedIn, openLogin } = useAuth();
  const router = useRouter();
  useEffect(() => { if (ready && isLoggedIn) router.replace('/wallet'); else if (ready) openLogin(); }, [ready, isLoggedIn, router, openLogin]);
  return <div className="section py-10"><LoginGate title="Login or sign up" text="Continue with your mobile number. A one-time password will be sent to you." /></div>;
}

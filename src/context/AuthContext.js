'use client';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useSWRConfig } from 'swr';
import { api, post, getToken, setToken } from '@/lib/api';
import LoginSheet from '@/components/layout/LoginSheet';

const Ctx = createContext(null);
async function loadUser() {
  if (!getToken()) return null;
  try { const r = await api('/auth/me'); return r.data; } catch { setToken(null); return null; }
}
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const pending = useRef(null);
  const { mutate } = useSWRConfig();

  const refresh = useCallback(async () => { const u = await loadUser(); setUser(u); return u; }, []);
  useEffect(() => { let active = true; loadUser().then((u) => { if (active) { setUser(u); setReady(true); } }); return () => { active = false; }; }, []);

  const revalidateAll = useCallback(() => mutate(() => true, undefined, { revalidate: true }), [mutate]);

  const login = useCallback(async ({ mobile, otp, name }) => {
    const r = await post('/auth/verify-otp', { mobile, otp, name });
    setToken(r.data.token); setUser(r.data.user);
    await revalidateAll();
    setLoginOpen(false);
    const cb = pending.current; pending.current = null; cb?.(r.data.user);
    return r.data;
  }, [revalidateAll]);

  const logout = useCallback(async () => { try { await post('/auth/logout'); } catch {} setToken(null); setUser(null); await revalidateAll(); }, [revalidateAll]);

  /** Ensures the user is logged in; opens the login sheet and resolves after login. */
  const requireLogin = useCallback((onSuccess) => {
    if (user) { onSuccess?.(user); return true; }
    pending.current = onSuccess || null; setLoginOpen(true); return false;
  }, [user]);

  return (
    <Ctx.Provider value={{ user, ready, isLoggedIn: !!user, login, logout, refresh, requireLogin, openLogin: () => setLoginOpen(true), setUser }}>
      {children}
      <LoginSheet open={loginOpen} onClose={() => { setLoginOpen(false); pending.current = null; }} />
    </Ctx.Provider>
  );
}
export const useAuth = () => useContext(Ctx);

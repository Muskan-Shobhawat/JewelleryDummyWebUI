'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { post } from '@/lib/api';

export function useWishlist(product) {
  const { user, requireLogin, setUser } = useAuth();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const inWishlist = !!user?.wishlist?.includes(product?.id);
  const toggle = (e) => {
    e?.preventDefault?.(); e?.stopPropagation?.();
    requireLogin(async () => {
      setBusy(true);
      try { const r = await post('/me/wishlist/toggle', { productId: product.id }); setUser((u) => ({ ...u, wishlist: r.data.wishlist })); toast(r.data.inWishlist ? 'Added to wishlist' : 'Removed from wishlist', 'info'); }
      catch (err) { toast(err.message, 'error'); } finally { setBusy(false); }
    });
  };
  return { inWishlist, toggle, busy };
}

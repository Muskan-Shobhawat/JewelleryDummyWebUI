'use client';
import { useEffect, useState } from 'react';
import { post } from '@/lib/api';
import { useCart } from '@/context/CartContext';

/** Prices the current cart against live rates via POST /orders/preview. */
export function useCartPreview(coupon, delivery = 'COURIER') {
  const cart = useCart();
  const [state, setState] = useState({ preview: null, error: '' });
  const items = cart.items.filter((i) => !i.priceOnCall).map(({ productId, qty, size }) => ({ productId, qty, size: size || undefined }));
  const key = JSON.stringify(items);
  useEffect(() => {
    if (key === '[]') return;
    let live = true;
    post('/orders/preview', { items: JSON.parse(key), couponCode: coupon || undefined, delivery })
      .then((r) => live && setState({ preview: r.data, error: '' }))
      .catch((e) => live && setState({ preview: null, error: e.message }));
    return () => { live = false; };
  }, [key, coupon, delivery]);
  return key === '[]' ? { preview: null, error: '' } : state;
}

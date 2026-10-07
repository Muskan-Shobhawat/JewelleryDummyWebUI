'use client';
import { createContext, useContext, useMemo, useSyncExternalStore } from 'react';

const KEY = 'kj_cart';
const EMPTY = [];
let items = null; // lazily hydrated from localStorage on the client
const listeners = new Set();
const read = () => { if (items === null) { try { items = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { items = []; } } return items; };
const write = (next) => { items = next; try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {} listeners.forEach((l) => l()); };
const subscribe = (l) => { listeners.add(l); return () => listeners.delete(l); };

const Ctx = createContext(null);
export function CartProvider({ children }) {
  const list = useSyncExternalStore(subscribe, read, () => EMPTY);
  const value = useMemo(() => ({
    items: list, ready: true,
    count: list.reduce((s, i) => s + i.qty, 0),
    add: (product, { qty = 1, size = null } = {}) => { const cur = read(); const i = cur.findIndex((x) => x.productId === product.id && x.size === size); write(i >= 0 ? cur.map((x, j) => (j === i ? { ...x, qty: Math.min(10, x.qty + qty) } : x)) : [...cur, { productId: product.id, slug: product.slug, name: product.name, image: product.images?.[0], qty, size, snapshotPrice: product.price?.total ?? null, priceOnCall: !!product.price?.priceOnCall }]); },
    setQty: (productId, size, qty) => write(read().map((x) => (x.productId === productId && x.size === size ? { ...x, qty: Math.max(1, Math.min(10, qty)) } : x))),
    remove: (productId, size) => write(read().filter((x) => !(x.productId === productId && x.size === size))),
    clear: () => write([]),
  }), [list]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export const useCart = () => useContext(Ctx);

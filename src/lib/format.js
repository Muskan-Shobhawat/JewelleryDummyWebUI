export const inr = (n, { decimals = 0 } = {}) => n == null || Number.isNaN(Number(n)) ? '—' : '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
export const inr2 = (n) => inr(n, { decimals: 2 });
export const gm = (g, d = 3) => g == null ? '—' : `${Number(g).toFixed(d)} gm`;
export const pct = (n) => `${Number(n) > 0 ? '+' : ''}${Number(n).toFixed(2)}%`;
export const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
export const fmtDateTime = (iso) => iso ? new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
export const fmtTime = (iso) => iso ? new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—';
export const cls = (...a) => a.filter(Boolean).join(' ');
export const titleCase = (s) => String(s || '').toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
export const STATUS_TONE = {
  SUCCESS: 'bg-success/10 text-success', PAID: 'bg-success/10 text-success', CREDITED: 'bg-success/10 text-success', ACTIVE: 'bg-success/10 text-success', CONFIRMED: 'bg-success/10 text-success', DELIVERED: 'bg-success/10 text-success', LOCKED: 'bg-primary/10 text-primary', RATE_LOCKED: 'bg-primary/10 text-primary', MATURED: 'bg-accent/20 text-primary-dark', BONUS: 'bg-accent/20 text-primary-dark', BONUS_CREDITED: 'bg-accent/20 text-primary-dark',
  DUE: 'bg-amber-100 text-amber-800', UPCOMING: 'bg-cream text-muted', PENDING: 'bg-amber-100 text-amber-800', PENDING_PAYMENT: 'bg-amber-100 text-amber-800', PENDING_FIRST_PAYMENT: 'bg-amber-100 text-amber-800', PROCESSING: 'bg-amber-100 text-amber-800', SHIPPED: 'bg-blue-100 text-blue-800', PACKED: 'bg-blue-100 text-blue-800', READY_FOR_PICKUP: 'bg-blue-100 text-blue-800',
  FAILED: 'bg-danger/10 text-danger', PAYMENT_FAILED: 'bg-danger/10 text-danger', CANCELLED: 'bg-danger/10 text-danger', EXPIRED: 'bg-danger/10 text-danger', MISSED: 'bg-danger/10 text-danger',
  INQUIRY_LOGGED: 'bg-cream text-muted', QUOTE_SHARED: 'bg-blue-100 text-blue-800', CONSULTATION_SCHEDULED: 'bg-amber-100 text-amber-800', SHOWROOM_READY: 'bg-success/10 text-success', REDEEMED: 'bg-success/10 text-success',
};

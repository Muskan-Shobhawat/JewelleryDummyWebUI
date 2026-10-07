'use client';
import { Row } from '@/components/ui/Bits';
import { inr, inr2 } from '@/lib/format';

export default function PriceBreakdown({ price, className = '' }) {
  if (!price || price.priceOnCall) return null;
  if (price.mode === 'FIXED') return <div className={className}><Row label="Price (incl. GST)" value={inr(price.total)} />{price.mrp && <Row label="MRP" value={inr(price.mrp)} />}</div>;
  return (
    <div className={className}>
      <Row label={`Metal value (${price.netWeight} gm × ${inr(price.ratePerGram)})`} value={inr2(price.metalValue)} />
      <Row label={`Making charges${price.makingChargeRule?.type === 'PCT' ? ` (${price.makingChargeRule.value}%)` : ''}`} value={inr2(price.makingCharge)} />
      {price.stoneCharge > 0 && <Row label="Stone / diamond" value={inr2(price.stoneCharge)} />}
      {price.discount > 0 && <Row label={`Discount (${price.discountPct}% on making)`} value={`- ${inr2(price.discount)}`} />}
      <Row label={`GST (${price.gstPct}%)`} value={inr2(price.gst)} />
      <Row label="Total" value={inr(price.total)} bold />
      <p className="mt-1 text-[11px] text-muted">Price updates with the live {price.purity} rate. Final price is fixed at the time of payment.</p>
    </div>
  );
}

'use client';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Skeleton, PageTitle, EmptyState } from '@/components/ui/Bits';
import { LoginGate } from '@/components/schemes/Shared';
import ProductCard from '@/components/product/ProductCard';

export default function WishlistPage() {
  const { ready, isLoggedIn, user } = useAuth();
  const { data } = useApi(isLoggedIn ? `/me/wishlist?n=${user?.wishlist?.length || 0}` : null);
  return (
    <div className="section py-4 sm:py-6">
      <PageTitle title="Wishlist" subtitle="Pieces you have saved" />
      {!ready ? <Skeleton className="h-40" /> : !isLoggedIn ? <LoginGate title="Your wishlist" text="Login to save pieces you love." /> : !data ? <Skeleton className="h-40" /> : !data.length ? <EmptyState icon={Heart} title="Nothing saved yet" action={<Link href="/jewellery" className="btn-primary">Explore jewellery</Link>} /> : <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{data.map((p) => <ProductCard key={p.id} product={p} />)}</div>}
    </div>
  );
}

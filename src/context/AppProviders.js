'use client';
import { ConfigProvider } from './ConfigContext';
import { ToastProvider } from './ToastContext';
import { CartProvider } from './CartContext';
import { AuthProvider } from './AuthContext';
import { PaymentProvider } from './PaymentContext';

export default function AppProviders({ children }) {
  return (
    <ConfigProvider><ToastProvider><CartProvider><AuthProvider><PaymentProvider>{children}</PaymentProvider></AuthProvider></CartProvider></ToastProvider></ConfigProvider>
  );
}

'use client';
import { createContext, useCallback, useContext, useState } from 'react';
import MockCheckout from '@/components/ui/MockCheckout';

const Ctx = createContext(null);
/** Global mock payment gateway. openCheckout(paymentPayload, { onSuccess, onFailure }) */
export function PaymentProvider({ children }) {
  const [state, setState] = useState(null);
  const openCheckout = useCallback((payment, handlers = {}) => setState({ payment, ...handlers }), []);
  return (
    <Ctx.Provider value={{ openCheckout }}>
      {children}
      {state && <MockCheckout payment={state.payment} onClose={() => setState(null)} onSuccess={(r) => { state.onSuccess?.(r); }} onFailure={(r) => { state.onFailure?.(r); }} />}
    </Ctx.Provider>
  );
}
export const usePayment = () => useContext(Ctx);

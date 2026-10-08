import { useCallback } from 'react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { setAuthRedirect } from '../lib/authRedirect';

export function useRequireAuthCheckout() {
  const { setActiveView, showToast } = useStore();
  const { isAuthenticated } = useAuth();

  const goToCheckout = useCallback(
    (beforeNavigate?: () => void) => {
      beforeNavigate?.();
      if (!isAuthenticated) {
        setAuthRedirect('checkout');
        showToast('Sign in or create an account to complete checkout.', 'info');
        setActiveView('login');
        return false;
      }
      setActiveView('checkout');
      return true;
    },
    [isAuthenticated, setActiveView, showToast]
  );

  return { goToCheckout, isAuthenticated };
}

import React, { useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { consumeTrackingPrefill } from '../../lib/orderTracking';

/**
 * Renderless bridge — when the user navigates to the order-tracking view,
 * dispatches any prefill data (trackingNumber / email) as a CustomEvent so
 * OrderTrackingPage can pre-fill its form fields.
 */
export const TrackingViewBridge: React.FC = () => {
  const { activeView } = useStore();

  useEffect(() => {
    if (activeView !== 'order-tracking' && activeView !== 'tracking') return;
    const prefill = consumeTrackingPrefill();
    if (prefill.reference || prefill.email) {
      window.dispatchEvent(
        new CustomEvent('kl:tracking-prefill', { detail: prefill })
      );
    }
  }, [activeView]);

  return null;
};

export default TrackingViewBridge;

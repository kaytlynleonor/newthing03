/** Prefill data that can be passed when navigating to the order-tracking view. */
export interface TrackingPrefill {
  reference?: string;
  email?: string;
}

/**
 * Navigate the user to the order-tracking view.
 *
 * @param setActiveView - The `setActiveView` function from StoreContext.
 * @param prefill       - Optional tracking-number / email to pre-populate the form.
 */
export function navigateToTracking(
  setActiveView: (view: string) => void,
  prefill?: TrackingPrefill
): void {
  // Store any prefill data so the tracking view can read it on mount.
  if (prefill) {
    if (prefill.reference) {
      sessionStorage.setItem('kl_tracking_ref', prefill.reference);
    }
    if (prefill.email) {
      sessionStorage.setItem('kl_tracking_email', prefill.email);
    }
  }
  setActiveView('order-tracking');
}

/** Read (and clear) tracking prefill stored by navigateToTracking. */
export function consumeTrackingPrefill(): TrackingPrefill {
  const reference = sessionStorage.getItem('kl_tracking_ref') ?? undefined;
  const email     = sessionStorage.getItem('kl_tracking_email') ?? undefined;
  sessionStorage.removeItem('kl_tracking_ref');
  sessionStorage.removeItem('kl_tracking_email');
  return { reference, email };
}

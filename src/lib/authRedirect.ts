export const AUTH_REDIRECT_KEY = 'kl_auth_redirect';

export function setAuthRedirect(view: string) {
  sessionStorage.setItem(AUTH_REDIRECT_KEY, view);
}

export function peekAuthRedirect(): string | null {
  return sessionStorage.getItem(AUTH_REDIRECT_KEY);
}

export function clearAuthRedirect() {
  sessionStorage.removeItem(AUTH_REDIRECT_KEY);
}

export function consumeAuthRedirect(): string | null {
  const view = sessionStorage.getItem(AUTH_REDIRECT_KEY);
  if (view) sessionStorage.removeItem(AUTH_REDIRECT_KEY);
  return view;
}

/** After successful sign-in / sign-up, go to saved view (e.g. checkout) or fallback. */
export function navigateAfterAuth(
  setActiveView: (view: string) => void,
  fallbackView = 'home'
): string {
  const next = consumeAuthRedirect() || fallbackView;
  setActiveView(next);
  return next;
}

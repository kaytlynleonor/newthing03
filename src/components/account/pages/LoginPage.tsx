import React, { useState, useMemo } from 'react';
import { clearAuthRedirect, navigateAfterAuth, peekAuthRedirect } from '../../../lib/authRedirect';
import { useStore } from '../../../context/StoreContext';
import { useAuth } from '../../../context/AuthContext';
import { Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { AuthLayout, GoogleIcon, MetaIcon } from './AuthLayout';
import { isTestCmsLogin } from '../../../lib/testCredentials';

export const LoginPage: React.FC = () => {
  const { setActiveView, setIsAccountOpen } = useStore();
  const { signIn, signInWithGoogle, signInWithFacebook, resetPassword, authError, clearAuthError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const checkoutPending = useMemo(() => peekAuthRedirect() === 'checkout', []);

  const finishAuth = (email?: string) => {
    if (email?.toLowerCase() === 'kaytlynleonor@gmail.com') {
      clearAuthRedirect();
      setActiveView('cms');
      return;
    }
    const next = navigateAfterAuth(setActiveView, 'home');
    if (next === 'checkout') return;
    setIsAccountOpen(true);
  };

  const inputCls = "w-full bg-white border border-[#EEE8DF] px-4 py-3.5 text-sm font-sans text-[#11100E] placeholder:text-[#A99684]/60 focus:outline-none focus:border-[#11100E] transition-colors";
  const labelCls = "block text-[9px] font-sans uppercase tracking-[0.3em] text-[#A99684] mb-1.5 font-medium";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isTestCmsLogin(email, password)) {
      setLoading(false);
      clearAuthRedirect();
      setActiveView('cms');
      return;
    }

    try {
      await signIn(email, password);
      finishAuth(email);
    } catch (_) {}
    setLoading(false);
  };

  const handleSocial = async (provider: string) => {
    setSocialLoading(provider);
    try {
      if (provider === 'google') await signInWithGoogle();
      if (provider === 'facebook') await signInWithFacebook();
      finishAuth();
    } catch (_) {}
    setSocialLoading(null);
  };

  const handleBack = () => {
    clearAuthError();
    clearAuthRedirect();
    setActiveView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await resetPassword(forgotEmail);
      setForgotSent(true);
    } catch (_) {}
    setLoading(false);
  };

  if (forgotMode) {
    return (
      <AuthLayout
        image="/assets/images/shop_fashion_hero.jpg"
        quote='"Your style, your story."'
        quoteAuthor="Kaytlyn Leonor"
        onBack={handleBack}
      >
        <div className="space-y-7">
          <div className="space-y-2">
            <h1 className="font-serif text-3xl font-light text-[#11100E] tracking-[0.1em] uppercase">Reset Password</h1>
            <p className="text-xs font-sans text-[#A99684] tracking-wide">Enter your email and we'll send a reset link.</p>
          </div>

          {forgotSent ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-sans space-y-2">
              <p className="font-semibold">Reset link sent!</p>
              <p>Check your inbox at <strong>{forgotEmail}</strong>.</p>
            </div>
          ) : (
            <form onSubmit={handleForgot} className="space-y-5">
              {authError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-sans flex justify-between">
                  <span>{authError}</span>
                  <button onClick={clearAuthError} className="font-bold ml-2">×</button>
                </div>
              )}
              <div>
                <label className={labelCls}>Email Address</label>
                <input type="email" required value={forgotEmail} onChange={e => setForgotEmail(e.target.value)}
                  placeholder="you@example.com" className={inputCls} />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-[#11100E] text-[#F5F1EB] py-4 text-[11px] uppercase tracking-[0.35em] font-sans hover:bg-[#A99684] transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                {loading ? <Loader2 size={14} className="animate-spin" /> : <>Send Reset Link <ArrowRight size={14} /></>}
              </button>
            </form>
          )}

          <button onClick={() => { setForgotMode(false); clearAuthError(); }}
            className="text-[11px] font-sans text-[#A99684] hover:text-[#11100E] uppercase tracking-wider transition-colors">
            ← Back to Sign In
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      image="/assets/images/collections_fashion_hero.jpg"
      quote='"Quiet confidence. Timeless beauty."'
      quoteAuthor="Kaytlyn Leonor"
      onBack={handleBack}
    >
      <div className="space-y-7">

        {/* Header */}
        <div className="space-y-1">
          <h1 className="font-serif text-4xl font-light text-[#11100E] tracking-[0.08em] uppercase">Sign In</h1>
          <p className="text-xs font-sans text-[#A99684]">
            {checkoutPending
              ? 'Sign in to complete your purchase. Your bag is saved on this device.'
              : 'Welcome back to Kaytlyn Leonor.'}
          </p>
        </div>

        {checkoutPending && (
          <div className="p-3 bg-[#F5F1EB] border border-[#EEE8DF] text-[11px] font-sans text-[#11100E]">
            Checkout requires an account. Sign in below or{' '}
            <button
              type="button"
              onClick={() => { setActiveView('signup'); clearAuthError(); }}
              className="font-semibold uppercase tracking-wider hover:text-[#A99684]"
            >
              create one
            </button>
            .
          </div>
        )}

        {/* Error */}
        {authError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-sans flex justify-between items-start">
            <span>{authError}</span>
            <button onClick={clearAuthError} className="font-bold ml-2 shrink-0">×</button>
          </div>
        )}

        {/* Social buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => handleSocial('google')} disabled={!!socialLoading}
            className="flex items-center justify-center gap-2 py-3 px-4 border border-[#EEE8DF] bg-white text-[11px] font-sans tracking-wider text-[#11100E] hover:border-[#11100E] transition-colors disabled:opacity-50">
            {socialLoading === 'google' ? <Loader2 size={15} className="animate-spin" /> : <GoogleIcon />}
            Google
          </button>
          <button onClick={() => handleSocial('facebook')} disabled={!!socialLoading}
            className="flex items-center justify-center gap-2 py-3 px-4 border border-[#EEE8DF] bg-white text-[11px] font-sans tracking-wider text-[#11100E] hover:border-[#11100E] transition-colors disabled:opacity-50">
            {socialLoading === 'facebook' ? <Loader2 size={15} className="animate-spin" /> : <MetaIcon />}
            Facebook
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center">
          <div className="flex-1 border-t border-[#EEE8DF]" />
          <span className="px-4 text-[9px] uppercase tracking-[0.3em] text-[#A99684] font-sans">or continue with email</span>
          <div className="flex-1 border-t border-[#EEE8DF]" />
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className={labelCls}>Email Address</label>
            <input type="text" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="email" className={inputCls} />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className={labelCls + ' mb-0'}>Password</label>
              <button type="button" onClick={() => { setForgotMode(true); clearAuthError(); }}
                className="text-[9px] uppercase tracking-[0.2em] text-[#A99684] hover:text-[#11100E] transition-colors">
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} required value={password}
                onChange={e => setPassword(e.target.value)} placeholder="••••••••" className={inputCls + ' pr-12'} />
              <button type="button" onClick={() => setShowPassword(p => !p)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A99684] hover:text-[#11100E]">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-[#11100E] text-[#F5F1EB] py-4 text-[11px] uppercase tracking-[0.35em] font-sans hover:bg-[#A99684] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-2">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <>Sign In <ArrowRight size={14} /></>}
          </button>
        </form>

        {/* Switch to signup */}
        <p className="text-center text-[11px] text-[#A99684] font-sans">
          New to Kaytlyn Leonor?{' '}
          <button onClick={() => { setActiveView('signup'); clearAuthError(); }}
            className="text-[#11100E] font-semibold uppercase tracking-wider hover:text-[#A99684] transition-colors">
            Create Account
          </button>
        </p>

        

      </div>
    </AuthLayout>
  );
};

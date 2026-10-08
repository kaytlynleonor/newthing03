import React, { useState, useMemo } from 'react';
import { clearAuthRedirect, navigateAfterAuth, peekAuthRedirect } from '../../../lib/authRedirect';
import { useStore } from '../../../context/StoreContext';
import { useAuth } from '../../../context/AuthContext';
import { Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { AuthLayout, GoogleIcon, MetaIcon } from './AuthLayout';

export const SignupPage: React.FC = () => {
  const { setActiveView, setIsAccountOpen } = useStore();
  const { signUp, signInWithGoogle, signInWithFacebook, authError, clearAuthError } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  const checkoutPending = useMemo(() => peekAuthRedirect() === 'checkout', []);

  const finishAuth = () => {
    const next = navigateAfterAuth(setActiveView, 'home');
    if (next === 'checkout') return;
    setIsAccountOpen(true);
  };

  const inputCls = "w-full bg-white border border-[#EEE8DF] px-4 py-3.5 text-sm font-sans text-[#11100E] placeholder:text-[#A99684]/60 focus:outline-none focus:border-[#11100E] transition-colors";
  const labelCls = "block text-[9px] font-sans uppercase tracking-[0.3em] text-[#A99684] mb-1.5 font-medium";

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signUp(email, password, name);
      finishAuth();
    } catch (_) {}
    setLoading(false);
  };

  const handleBack = () => {
    clearAuthError();
    clearAuthRedirect();
    setActiveView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  return (
    <AuthLayout
      image="/assets/images/shop_3d_hero.jpg"
      quote={"\"Luxury is not a style. It's a standard.\""}
      quoteAuthor="Kaytlyn Leonor"
      onBack={handleBack}
    >
      <div className="space-y-7">

        {/* Header */}
        <div className="space-y-1">
          <h1 className="font-serif text-4xl font-light text-[#11100E] tracking-[0.08em] uppercase">Join Maison</h1>
          <p className="text-xs font-sans text-[#A99684]">
            {checkoutPending
              ? 'Create an account to complete checkout. Your bag stays on this device.'
              : 'Create your Kaytlyn Leonor account.'}
          </p>
        </div>

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
        <form onSubmit={handleSignup} className="space-y-5">
          <div>
            <label className={labelCls}>Full Name</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)}
              placeholder="Victoria Leonor" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Email Address</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Password</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} required minLength={6}
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Min. 6 characters" className={inputCls + ' pr-12'} />
              <button type="button" onClick={() => setShowPassword(p => !p)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A99684] hover:text-[#11100E]">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-[#11100E] text-[#F5F1EB] py-4 text-[11px] uppercase tracking-[0.35em] font-sans hover:bg-[#A99684] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-2">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <>Create Account <ArrowRight size={14} /></>}
          </button>
        </form>

        {/* Terms note */}
        <p className="text-[10px] text-[#A99684] font-sans leading-relaxed text-center">
          By creating an account you agree to our{' '}
          <span className="text-[#11100E] underline cursor-pointer">Terms</span> and{' '}
          <span className="text-[#11100E] underline cursor-pointer">Privacy Policy</span>.
        </p>

        {/* Switch to login */}
        <p className="text-center text-[11px] text-[#A99684] font-sans">
          Already have an account?{' '}
          <button onClick={() => { setActiveView('login'); clearAuthError(); }}
            className="text-[#11100E] font-semibold uppercase tracking-wider hover:text-[#A99684] transition-colors">
            Sign In
          </button>
        </p>

      </div>
    </AuthLayout>
  );
};

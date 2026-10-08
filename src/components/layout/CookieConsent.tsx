import React, { useState, useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';

export const CookieConsent: React.FC = () => {
  const [accepted, setAccepted] = useState<boolean>(true);

  useEffect(() => {
    const consent = localStorage.getItem('kl_cookie_consent');
    if (!consent) {
      setAccepted(false);
    }
  }, []);

  useEffect(() => {
    const openSettings = () => setAccepted(false);
    window.addEventListener('kl-open-cookie-settings', openSettings);
    return () => window.removeEventListener('kl-open-cookie-settings', openSettings);
  }, []);

  const handleAccept = () => {
    localStorage.setItem('kl_cookie_consent', 'accepted');
    setAccepted(true);
  };

  const handleEssentialOnly = () => {
    localStorage.setItem('kl_cookie_consent', 'essential');
    setAccepted(true);
  };

  if (accepted) return null;

  return (
    <div className="fixed bottom-16 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 bg-[#11100E] text-[#F5F1EB] p-5 shadow-2xl border border-[#2C2925] rounded-none animate-fade-up">
      <div className="flex items-start gap-3">
        <ShieldCheck size={20} className="text-[#A99684] shrink-0 mt-0.5" />
        <div>
          <h4 className="font-serif text-sm tracking-wider uppercase">PRIVACY & COOKIE CONSENT</h4>
          <p className="text-[11px] text-[#C8B5A5] mt-1 leading-relaxed font-sans font-light">
            We use essential cookies and refined telemetry to personalize your editorial luxury shopping experience and preserve bag selections.
          </p>
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={handleEssentialOnly}
              className="bg-[#F5F1EB] text-[#11100E] text-[10px] uppercase tracking-[0.2em] px-4 py-2 hover:bg-[#EEE8DF] transition-colors"
            >
              ACCEPT ALL
            </button>
            <button
              onClick={handleAccept}
              className="text-[#A99684] hover:text-white text-[10px] uppercase tracking-[0.2em] underline"
            >
              ESSENTIAL ONLY
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

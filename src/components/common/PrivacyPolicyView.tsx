import React from 'react';
import { useStore } from '../../context/StoreContext';
import { ShieldCheck } from 'lucide-react';

export const PrivacyPolicyView: React.FC = () => {
  const { setActiveView } = useStore();

  return (
    <div className="min-h-screen bg-[#F5F1EB] px-4 py-16 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <button
          type="button"
          onClick={() => setActiveView('home')}
          className="text-[10px] uppercase tracking-[0.25em] text-[#A99684] hover:text-[#11100E] mb-8 block"
        >
          ← Back
        </button>

        <div className="flex items-center gap-3 mb-8">
          <ShieldCheck size={22} className="text-[#A99684]" />
          <h1 className="font-serif text-2xl uppercase tracking-[0.2em]">Privacy Policy</h1>
        </div>

        <div className="space-y-6 text-sm leading-relaxed text-[#11100E] font-sans">
          <p className="text-[#A99684] text-xs uppercase tracking-wider">Last updated: October 2026</p>

          {[
            {
              title: '1. Information We Collect',
              body: 'When you place an order or create an account we collect your name, email address, shipping address, phone number, and payment information (processed securely via our payment provider — we never store raw card details).',
            },
            {
              title: '2. How We Use Your Information',
              body: 'We use your data to fulfil orders, send order-status updates, and (with your consent) send marketing communications. We do not sell your personal information to third parties.',
            },
            {
              title: '3. Cookies',
              body: 'We use essential cookies to keep your cart and session alive, and optional analytics cookies to understand how visitors use our site. You can manage cookie preferences via the banner.',
            },
            {
              title: '4. Data Retention',
              body: 'Order records are retained for 7 years for accounting purposes. You may request deletion of your personal data at any time by emailing us.',
            },
            {
              title: '5. Contact',
              body: 'For privacy-related enquiries please contact us at privacy@kaytlynleonor.com.',
            },
          ].map(s => (
            <section key={s.title}>
              <h2 className="font-serif text-base uppercase tracking-wider mb-2">{s.title}</h2>
              <p>{s.body}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyView;

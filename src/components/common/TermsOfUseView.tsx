import React from 'react';
import { useStore } from '../../context/StoreContext';
import { FileText } from 'lucide-react';

export const TermsOfUseView: React.FC = () => {
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
          <FileText size={22} className="text-[#A99684]" />
          <h1 className="font-serif text-2xl uppercase tracking-[0.2em]">Terms of Use</h1>
        </div>

        <div className="space-y-6 text-sm leading-relaxed text-[#11100E] font-sans">
          <p className="text-[#A99684] text-xs uppercase tracking-wider">Last updated: October 2026</p>

          {[
            {
              title: '1. Acceptance of Terms',
              body: 'By accessing or using this website, you agree to be bound by these Terms of Use and our Privacy Policy. If you do not agree, please do not use our site.',
            },
            {
              title: '2. Products & Pricing',
              body: 'All prices are displayed in the selected currency and are inclusive of applicable taxes where stated. We reserve the right to modify prices and product availability at any time without notice.',
            },
            {
              title: '3. Orders & Payment',
              body: 'Placing an order constitutes an offer to purchase. We reserve the right to decline or cancel orders for any reason, including stock unavailability or payment issues, in which case you will be fully refunded.',
            },
            {
              title: '4. Returns & Exchanges',
              body: 'Unworn, unwashed items in original packaging may be returned within 14 days of delivery. Final sale items are non-refundable.',
            },
            {
              title: '5. Intellectual Property',
              body: 'All content on this site — including images, text, and brand assets — is the property of Kaytlyn Leonor and may not be reproduced without written permission.',
            },
            {
              title: '6. Contact',
              body: 'Questions about these terms? Email us at legal@kaytlynleonor.com.',
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

export default TermsOfUseView;

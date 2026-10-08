import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Mail, Check } from 'lucide-react';

export const Newsletter: React.FC = () => {
  const { showToast } = useStore();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
      showToast('Thank you for subscribing to Kaytlyn Leonor editorial updates', 'success');
      setEmail('');
    }
  };

  return (
    <section className="py-24 md:py-32 px-6 lg:px-12 bg-[#EEE8DF] text-center border-b border-[#D8C8B7]/60">
      <div className="max-w-2xl mx-auto space-y-6">
        <Mail size={28} className="mx-auto text-[#A99684]" strokeWidth={1.25} />
        
        <span className="block text-[11px] font-sans uppercase tracking-[0.4em] text-[#A99684]">
          STAY INFORMED
        </span>

        <h2 className="font-serif text-3xl md:text-5xl tracking-[0.15em] uppercase font-light">
          JOIN THE WORLD OF KAYTLYN LEONOR
        </h2>

        <p className="text-xs md:text-sm font-sans text-[#2C2925] tracking-[0.1em] font-light leading-relaxed">
          Be the first to discover new seasonal collections, private capsule launches, and editorial stories from Paris and Mumbai.
        </p>

        {submitted ? (
          <div className="p-4 bg-[#11100E] text-[#F5F1EB] text-xs uppercase tracking-[0.2em] font-sans inline-flex items-center gap-2">
            <Check size={16} className="text-[#A99684]" /> YOU ARE REGISTERED FOR PRIVILEGED INVITATIONS.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto pt-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ENTER YOUR EMAIL ADDRESS"
                required
                className="flex-1 bg-white border border-[#A99684]/40 px-4 py-3 text-xs text-[#11100E] placeholder:text-[#A99684] focus:outline-none focus:border-[#11100E] font-sans tracking-wider"
              />
              <button
                type="submit"
                className="bg-[#11100E] text-[#F5F1EB] hover:bg-[#A99684] px-8 py-3 text-xs uppercase tracking-[0.25em] font-sans transition-colors font-medium shrink-0"
              >
                JOIN
              </button>
            </div>
            <span className="block text-[10px] text-[#A99684] mt-3 font-sans tracking-wider">
              BY JOINING, YOU AGREE TO OUR PRIVACY POLICY. UNSUBSCRIBE AT ANY TIME.
            </span>
          </form>
        )}
      </div>
    </section>
  );
};

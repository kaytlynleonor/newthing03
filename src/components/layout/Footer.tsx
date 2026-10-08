import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { navigateToTracking } from '../../lib/orderTracking';
import { Currency } from '../../types/ecommerce';
import { Globe, ArrowRight } from 'lucide-react';

const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

// Twitter replaced by X, and added Linkedin
const XIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

const LinkedinIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);


const YoutubeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path>
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
  </svg>
);


export const Footer: React.FC = () => {
  const { setActiveView, setActiveCategoryFilter, currency, setCurrency, showToast, openPolicy } = useStore();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      showToast('Welcome to the world of Kaytlyn Leonor', 'success');
      setEmail('');
    }
  };

  const handleCategoryNav = (cat: string) => {
    setActiveCategoryFilter(cat);
    setActiveView('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCookieSettings = () => {
    window.dispatchEvent(new Event('kl-open-cookie-settings'));
  };

  return (
    <footer className="bg-[#11100E] text-[#F5F1EB] pt-20 pb-28 md:pb-12 border-t border-[#2C2925]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Top 4 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-16 border-b border-[#2C2925]">
          
          {/* Column 1: SHOP */}
          <div>
            <h4 className="font-sans text-[11px] uppercase tracking-[0.25em] text-[#A99684] mb-6 font-semibold">
              SHOP
            </h4>
            <ul className="space-y-3.5 text-xs font-sans tracking-[0.15em] text-[#C8B5A5]">
              <li>
                <button onClick={() => handleCategoryNav('NEW ARRIVALS')} className="hover:text-white transition-colors uppercase">
                  New Arrivals
                </button>
              </li>
              <li>
                <button onClick={() => handleCategoryNav('SIGNATURE')} className="hover:text-white transition-colors uppercase">
                  Best Sellers & Signature
                </button>
              </li>
              <li>
                <button onClick={() => handleCategoryNav('BAGS')} className="hover:text-white transition-colors uppercase">
                  Maison Handbags
                </button>
              </li>
              <li>
                <button onClick={() => handleCategoryNav('SHOES')} className="hover:text-white transition-colors uppercase">
                  Fine Footwear
                </button>
              </li>
              <li>
                <button onClick={() => handleCategoryNav('BEAUTY')} className="hover:text-white transition-colors uppercase">
                  Beauty & Fragrance
                </button>
              </li>
              <li>
                <button onClick={() => handleCategoryNav('ACCESSORIES')} className="hover:text-white transition-colors uppercase">
                  Jewelry & Accessories
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: ABOUT */}
          <div>
            <h4 className="font-sans text-[11px] uppercase tracking-[0.25em] text-[#A99684] mb-6 font-semibold">
              ABOUT
            </h4>
            <ul className="space-y-3.5 text-xs font-sans tracking-[0.15em] text-[#C8B5A5]">
              <li>
                <button onClick={() => setActiveView('home')} className="hover:text-white transition-colors uppercase">
                  Our Story & Philosophy
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('journal')} className="hover:text-white transition-colors uppercase">
                  The Journal
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('home')} className="hover:text-white transition-colors uppercase">
                  Autumn / Winter Campaign
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('contact')} className="hover:text-white transition-colors uppercase">
                  Contact Us
                </button>
              </li>
              <li>
                <button onClick={() => openPolicy('sustainability')} className="hover:text-white transition-colors uppercase">
                  Atelier Craftsmanship
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: HELP & POLICIES */}
          <div>
            <h4 className="font-sans text-[11px] uppercase tracking-[0.25em] text-[#A99684] mb-6 font-semibold">
              HELP
            </h4>
            <ul className="space-y-3.5 text-xs font-sans tracking-[0.15em] text-[#C8B5A5]">
              <li>
                <button onClick={() => openPolicy('shipping')} className="hover:text-white transition-colors uppercase">
                  Shipping Information
                </button>
              </li>
              <li>
                <button onClick={() => openPolicy('returns')} className="hover:text-white transition-colors uppercase">
                  White Glove Returns
                </button>
              </li>
              <li>
                <button onClick={() => openPolicy('faq')} className="hover:text-white transition-colors uppercase">
                  FAQ
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateToTracking(setActiveView)}
                  className="hover:text-white transition-colors uppercase"
                >
                  Order Tracking
                </button>
              </li>
              <li>
                <button onClick={() => openPolicy('size-guide')} className="hover:text-white transition-colors uppercase">
                  Master Size Guide
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveView('privacy');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors uppercase"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveView('terms');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-white transition-colors uppercase"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button onClick={() => openPolicy('accessibility')} className="hover:text-white transition-colors uppercase">
                  Accessibility
                </button>
              </li>
              <li>
                <button onClick={() => openPolicy('cookie-policy')} className="hover:text-white transition-colors uppercase">
                  Cookie Policy
                </button>
              </li>
              <li>
                <button onClick={handleCookieSettings} className="hover:text-white transition-colors uppercase">
                  Set My Cookies
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: NEWSLETTER */}
          <div>
            <h4 className="font-sans text-[11px] uppercase tracking-[0.25em] text-[#A99684] mb-6 font-semibold">
              JOIN THE WORLD
            </h4>
            <p className="text-xs text-[#C8B5A5] leading-relaxed mb-4 font-sans font-light">
              Be the first to discover private capsule launches, couture invitations, and editorial stories.
            </p>
            
            {subscribed ? (
              <div className="p-3 border border-[#A99684]/40 bg-[#1C1A17] text-xs text-[#EEE8DF]">
                ✓ You are subscribed to Kaytlyn Leonor editorial updates.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-3">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ENTER YOUR EMAIL"
                    required
                    className="w-full bg-transparent border-b border-[#A99684]/50 py-2.5 text-xs text-[#F5F1EB] placeholder:text-[#A99684]/70 focus:outline-none focus:border-white transition-colors font-sans tracking-wider"
                  />
                  <button
                    type="submit"
                    className="absolute right-0 top-2.5 text-[#A99684] hover:text-white transition-colors"
                    aria-label="Subscribe"
                  >
                    <ArrowRight size={16} />
                  </button>
                </div>
              </form>
            )}

            <div className="mt-8 pt-4 flex items-center gap-4 text-[#A99684]">
              <a href="https://www.instagram.com/kaytlynleonor/" target="_blank" rel="noopener noreferrer" className="hover:text-[#E1306C] transition-colors" aria-label="Instagram">
                <InstagramIcon />
              </a>
              <a href="#facebook" className="hover:text-[#1877F2] transition-colors" aria-label="Facebook">
                <FacebookIcon />
              </a>
              <a href="#linkedin" className="hover:text-[#0077B5] transition-colors" aria-label="LinkedIn">
                <LinkedinIcon />
              </a>
              <a href="#x" className="hover:text-[#000000] transition-colors" aria-label="X">
                <XIcon />
              </a>
              <a href="#youtube" className="hover:text-[#FF0000] transition-colors" aria-label="YouTube">
                <YoutubeIcon />
              </a>
            </div>
          </div>
        </div>

        {/* Large Editorial House Typography */}
        <div className="py-12 flex flex-col items-center justify-center text-center border-b border-[#2C2925] select-none">
          <img 
            src="/Luxury%20Gold%20KL%20Monogram%20Logo.png" 
            alt="Kaytlyn Leonor Icon" 
            className="h-12 md:h-16 w-auto mb-4 object-contain opacity-90" 
          />
          <h2 className="font-serif text-3xl md:text-5xl lg:text-7xl font-extralight tracking-[0.25em] uppercase text-[#F5F1EB]/90">
            KAYTLYN LEONOR
          </h2>
          <p className="text-[10px] font-sans tracking-[0.4em] text-[#A99684] uppercase mt-2">
            MODERN LUXURY • QUIET CONFIDENCE • TIMELESS BEAUTY
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] font-sans tracking-wider text-[#A99684]">

          {/* Left — Copyright */}
          <div className="order-1">© 2026 KAYTLYN LEONOR. ALL RIGHTS RESERVED.</div>

          {/* Center — Currency */}
          <div className="flex items-center gap-2 bg-[#1C1A17] px-3 py-1.5 rounded border border-[#2C2925] order-2">
            <Globe size={14} />
            <span className="text-[10px] text-[#C8B5A5]">REGION & CURRENCY:</span>
            <select value={currency} onChange={(e) => setCurrency(e.target.value as Currency)}
              className="bg-transparent text-white focus:outline-none cursor-pointer text-xs font-medium">
              <option value="INR" className="bg-[#11100E] text-white">INDIA (₹ INR)</option>
              <option value="USD" className="bg-[#11100E] text-white">UNITED STATES ($ USD)</option>
              <option value="EUR" className="bg-[#11100E] text-white">EUROPE (€ EUR)</option>
            </select>
          </div>

          {/* Right — Design credit */}
          <div className="text-[10px] order-3">
            Designed &amp; Developed by <span className="text-sky-400 font-medium">OurFirstCode Pvt Ltd</span>
          </div>

        </div>
      </div>
    </footer>
  );
};

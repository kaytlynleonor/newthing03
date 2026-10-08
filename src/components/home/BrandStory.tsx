import React from 'react';
import { useStore } from '../../context/StoreContext';
import { ShieldCheck, Award, Feather } from 'lucide-react';

export const BrandStory: React.FC = () => {
  const { openPolicy } = useStore();

  return (
    <section className="py-24 md:py-36 px-6 lg:px-12 bg-[#F5F1EB] border-b border-[#EEE8DF]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">

        {/* Left Side: Brand Story Narrative */}
        <div className="lg:col-span-6 space-y-8">
          <span className="text-[11px] font-sans uppercase tracking-[0.4em] text-[#A99684]">
            HERITAGE & VISION
          </span>

          <h2 className="font-serif text-3xl md:text-5xl tracking-[0.15em] uppercase font-light leading-tight">
            THE HOUSE OF KAYTLYN LEONOR
          </h2>

          <div className="space-y-4 text-xs md:text-sm font-sans text-[#2C2925] tracking-[0.1em] leading-relaxed font-light">
            <p>
              Founded with a singular commitment to quiet luxury, KAYTLYN LEONOR operates at the intersection of European haute couture tailoring and contemporary artistic expression.
            </p>
            <p>
              Every garment, leather piece, and beauty formulation is produced in small-batch atelier quantities. We work exclusively with certified family-owned mills in Como, Florence, and Grasse—ensuring absolute ethical integrity, uncompromised quality, and zero excess inventory waste.
            </p>
          </div>

          {/* Three Key Pillars */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#EEE8DF]">
            <div className="space-y-1">
              <Feather size={20} className="text-[#A99684]" />
              <h4 className="font-serif text-xs uppercase tracking-wider font-semibold">100% SILK & CASHMERE</h4>
              <p className="text-[10px] text-[#A99684]">Pure natural fibers</p>
            </div>
            <div className="space-y-1">
              <Award size={20} className="text-[#A99684]" />
              <h4 className="font-serif text-xs uppercase tracking-wider font-semibold">ITALIAN CRAFT</h4>
              <p className="text-[10px] text-[#A99684]">Florence & Milan ateliers</p>
            </div>
            <div className="space-y-1">
              <ShieldCheck size={20} className="text-[#A99684]" />
              <h4 className="font-serif text-xs uppercase tracking-wider font-semibold">LIMITED EDITION</h4>
              <p className="text-[10px] text-[#A99684]">Numbered capsules</p>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => openPolicy('sustainability')}
              className="editorial-link text-xs font-sans uppercase tracking-[0.25em] text-[#11100E] font-medium"
            >
              LEARN MORE ABOUT OUR CRAFT →
            </button>
          </div>
        </div>

        {/* Right Side: Editorial Image Composition */}
        <div className="lg:col-span-6 relative">
          <div className="aspect-[4/5] bg-[#EEE8DF] overflow-hidden shadow-xl">
            <img
              src="/assets/images/hero_campaign_1.jpg"
              alt="House of KAYTLYN LEONOR"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Floating Subtle Quote Card */}
          <div className="absolute -bottom-8 -left-6 md:left-8 bg-[#11100E] text-[#F5F1EB] p-6 max-w-xs shadow-2xl border border-[#2C2925] hidden sm:block">
            <p className="font-serif text-sm italic tracking-wide text-[#EEE8DF]">
              "Sensuality is found in perfection of line, not excessive ornament."
            </p>
            <span className="block text-[9px] font-sans tracking-[0.3em] text-[#A99684] uppercase mt-2">
              — KAYTLYN LEONOR
            </span>
          </div>
        </div>

      </div>
    </section>
  );
};

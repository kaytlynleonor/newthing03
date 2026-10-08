import React from 'react';
import { useStore } from '../../context/StoreContext';
import { ArrowUpRight } from 'lucide-react';

export const FeaturedCollection: React.FC = () => {
  const { setActiveView, setActiveCategoryFilter } = useStore();

  const handleExplore = (colName: string) => {
    setActiveCategoryFilter(colName);
    setActiveView('shop');
  };

  return (
    <section className="py-20 md:py-32 px-6 lg:px-12 bg-[#F5F1EB] space-y-24 md:space-y-36">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-[11px] font-sans uppercase tracking-[0.4em] text-[#A99684]">
            EDITORIAL HIGHLIGHTS
          </span>
          <h2 className="font-serif text-3xl md:text-5xl tracking-[0.2em] uppercase mt-2 font-light">
            THE COLLECTION
          </h2>
        </div>

        {/* Asymmetrical Block 1: Image Left, Narrative Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 overflow-hidden group relative">
            <div className="aspect-[4/3] md:aspect-[16/10] overflow-hidden bg-[#EEE8DF]">
              <img
                src="/assets/images/hero_campaign_1.jpg"
                alt="Atelier Silk Tailoring"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
            </div>
            <div className="absolute top-4 left-4 bg-[#11100E] text-[#F5F1EB] text-[9px] uppercase tracking-[0.25em] px-3 py-1.5 font-sans">
              NEW SEASON
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6 lg:pl-6">
            <span className="text-[10px] font-sans uppercase tracking-[0.3em] text-[#A99684]">
              COUTURE SELECTION 01
            </span>
            <h3 className="font-serif text-3xl md:text-4xl tracking-[0.15em] uppercase font-light">
              ATELIER SILK TAILORING
            </h3>
            <p className="text-xs md:text-sm font-sans text-[#2C2925] tracking-[0.1em] leading-relaxed font-light">
              Sculpted from 100% mulberry silk crepe with architectural lapels and hand-stitched detailing in Milan. Designed for effortless evening poise.
            </p>
            <div className="pt-2">
              <button
                onClick={() => handleExplore('Signature Collection')}
                className="editorial-link text-xs font-sans uppercase tracking-[0.25em] text-[#11100E] font-medium inline-flex items-center gap-2 group"
              >
                <span>EXPLORE COLLECTION</span>
                <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Asymmetrical Block 2: Text Left, Image Right (Alternate Layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pt-20">
          <div className="lg:col-span-5 space-y-6 lg:pr-6 order-2 lg:order-1">
            <span className="text-[10px] font-sans uppercase tracking-[0.3em] text-[#A99684]">
              MAISON ACCESSORIES 02
            </span>
            <h3 className="font-serif text-3xl md:text-4xl tracking-[0.15em] uppercase font-light">
              SCULPTED LEATHER GOODS
            </h3>
            <p className="text-xs md:text-sm font-sans text-[#2C2925] tracking-[0.1em] leading-relaxed font-light">
              Crafted in Florence from full-grain calfskin leather, showcasing minimalist gold micro-stamping and custom brass hardware.
            </p>
            <div className="pt-2">
              <button
                onClick={() => handleExplore('BAGS')}
                className="editorial-link text-xs font-sans uppercase tracking-[0.25em] text-[#11100E] font-medium inline-flex items-center gap-2 group"
              >
                <span>EXPLORE HANDBAGS</span>
                <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 overflow-hidden group relative order-1 lg:order-2">
            <div className="aspect-[4/3] md:aspect-[16/10] overflow-hidden bg-[#EEE8DF]">
              <img
                src="/Leonor%20Kaytlyn%20Luxury%20Packaging%20Still%20Life.png"
                alt="Sculpted Leather Goods"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
            </div>
            <div className="absolute bottom-4 right-4 bg-[#11100E]/80 backdrop-blur-xs text-[#F5F1EB] text-[9px] uppercase tracking-[0.25em] px-3 py-1.5 font-sans">
              FLORENTINE CRAFT
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

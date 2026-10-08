import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const BestSellingBoots: React.FC = () => {
  const { setActiveView, setActiveCategoryFilter } = useStore();

  const openFootwear = () => {
    setActiveCategoryFilter('SHOES');
    setActiveView('shop');
  };

  return (
    <section className="border-b border-[#EEE8DF] bg-[#F5F1EB] px-6 py-14 md:py-20 lg:px-12">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-12">
        <div className="aspect-[4/3] overflow-hidden bg-[#EEE8DF]">
          <img
            src="/Red%20Stilettos%20on%20the%20Crosswalk.png"
            alt="Red stilettos on a city crosswalk"
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="space-y-5 md:py-8">
          <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.35em] text-[#A99684]">
            BEST SELLING
          </span>
          <h2 className="font-serif text-3xl font-light uppercase tracking-[0.16em] text-[#11100E] md:text-5xl">
            RED BOOTS
          </h2>
          <p className="max-w-lg text-xs font-sans font-light leading-relaxed tracking-[0.08em] text-[#2C2925] md:text-sm">
            A striking red footwear edit, chosen for its confident color and unmistakable presence.
          </p>
          <button
            type="button"
            onClick={openFootwear}
            className="editorial-link inline-flex items-center gap-2 pt-2 text-xs font-sans font-medium uppercase tracking-[0.25em] text-[#11100E]"
          >
            EXPLORE FOOTWEAR <ArrowUpRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
};
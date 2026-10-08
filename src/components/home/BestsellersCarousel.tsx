import React, { useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from '../product/ProductCard';

export const BestsellersCarousel: React.FC = () => {
  const { products } = useStore();
  const carouselRef = useRef<HTMLDivElement>(null);

  const bestsellers = products.filter((p) => p.isBestseller || p.rating >= 4.9);

  return (
    <section className="py-20 md:py-32 px-6 lg:px-12 bg-[#F5F1EB] overflow-hidden border-b border-[#EEE8DF]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-[11px] font-sans uppercase tracking-[0.4em] text-[#A99684]">
              ICONIC CREATIONS
            </span>
            <h2 className="font-serif text-3xl md:text-5xl tracking-[0.2em] uppercase mt-1 font-light">
              SIGNATURE PIECES
            </h2>
          </div>
        </div>

        {/* Carousel Drag/Swipe Scroll Container */}
        <div
          ref={carouselRef}
          className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-4"
        >
          {bestsellers.map((product) => (
            <div
              key={product.id}
              className="w-[280px] sm:w-[320px] md:w-[360px] shrink-0 snap-start"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

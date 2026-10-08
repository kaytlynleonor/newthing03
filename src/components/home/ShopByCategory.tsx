import React from 'react';
import { useStore } from '../../context/StoreContext';
import { ArrowRight } from 'lucide-react';

interface CategoryCardItem {
  id: string;
  title: string;
  subtitle: string;
  categoryKey: string;
  image: string;
}

const CATEGORIES: CategoryCardItem[] = [
  {
    id: 'cat-1',
    title: 'NEW ARRIVALS',
    subtitle: 'Autumn / Winter Edit',
    categoryKey: 'NEW ARRIVALS',
    image: '/assets/images/hero_campaign_1.jpg'
  },
  {
    id: 'cat-2',
    title: 'SIGNATURE GOWNS',
    subtitle: 'Haute Couture Eveningwear',
    categoryKey: 'SIGNATURE',
    image: '/assets/images/campaign_editorial_2.jpg'
  },
  {
    id: 'cat-3',
    title: 'MAISON BAGS',
    subtitle: 'Italian Leather Craft',
    categoryKey: 'BAGS',
    image: '/Leonor%20Kaytlyn%20Luxury%20Packaging%20Still%20Life.png'
  },
  {
    id: 'cat-4',
    title: 'FINE FOOTWEAR',
    subtitle: 'Stiletto Pumps & Boots',
    categoryKey: 'SHOES',
    image: '/assets/images/category_shoes.jpg'
  },
  {
    id: 'cat-5',
    title: 'BEAUTY & FRAGRANCE',
    subtitle: 'Aurelia Scent & Beauty',
    categoryKey: 'BEAUTY',
    image: encodeURI('/Heart Mirror Beauty Studio Scene.png')
  },
  {
    id: 'cat-6',
    title: 'JEWELRY & ACCESSORIES',
    subtitle: '18k Gold & South Sea Pearls',
    categoryKey: 'ACCESSORIES',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=1200'
  }
];

export const ShopByCategory: React.FC = () => {
  const { setActiveView, setActiveCategoryFilter } = useStore();

  const handleCategoryClick = (key: string) => {
    setActiveCategoryFilter(key);
    setActiveView('shop');
  };

  return (
    <section className="py-20 md:py-32 px-6 lg:px-12 bg-[#EEE8DF] border-y border-[#D8C8B7]/60">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
          <div>
            <span className="text-[11px] font-sans uppercase tracking-[0.4em] text-[#A99684]">
              CURATED DISCOVERY
            </span>
            <h2 className="font-serif text-3xl md:text-5xl tracking-[0.2em] uppercase mt-1 font-light">
              SHOP BY CATEGORY
            </h2>
          </div>
          <p className="text-xs font-sans tracking-[0.15em] text-[#A99684] uppercase">
            EXPLORE THE HOUSE DISCIPLINES
          </p>
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              onClick={() => handleCategoryClick(cat.categoryKey)}
              className="group relative h-[420px] md:h-[480px] overflow-hidden cursor-pointer bg-[#11100E] shadow-sm hover:shadow-2xl transition-all duration-500"
            >
              {/* Background Image with Gentle Zoom on Hover */}
              <div
                className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                style={{ backgroundImage: `url(${cat.image})` }}
              />

              {/* Darkening Gradient Overlay on Hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#11100E]/90 via-[#11100E]/30 to-transparent group-hover:from-[#11100E] group-hover:via-[#11100E]/40 transition-colors duration-500" />

              {/* Content Overlay */}
              <div className="absolute inset-0 p-8 flex flex-col justify-end text-[#F5F1EB] transition-transform duration-500 group-hover:-translate-y-2">
                <span className="text-[10px] font-sans uppercase tracking-[0.3em] text-[#D8C8B7] font-medium">
                  {cat.subtitle}
                </span>

                <div className="flex items-center justify-between mt-1 pt-1 border-t border-[#D8C8B7]/30">
                  <h3 className="font-serif text-2xl tracking-[0.15em] uppercase font-light">
                    {cat.title}
                  </h3>

                  {/* Arrow Appears on Hover */}
                  <div className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                    <ArrowRight size={16} className="text-[#F5F1EB]" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

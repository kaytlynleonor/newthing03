/* eslint-disable react/jsx-no-undef */
import React, { useState, useMemo, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useStore } from '../../context/StoreContext';
import { ProductGrid } from '../product/ProductGrid';
import { FilterDrawer } from './FilterDrawer';
import { FilterState } from '../../types/ecommerce';
import { SlidersHorizontal, ArrowUpDown, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { COLLECTIONS_DATA } from '../../data/collections';

const SORT_OPTIONS = [
  { value: 'featured', label: 'SORT: FEATURED' },
  { value: 'newest', label: 'SORT: NEWEST' },
  { value: 'price-low-high', label: 'SORT: PRICE LOW TO HIGH' },
  { value: 'price-high-low', label: 'SORT: PRICE HIGH TO LOW' },
  { value: 'bestsellers', label: 'SORT: SIGNATURE BESTSELLERS' }
] as const;

export const ShopView: React.FC = () => {
  const { products, activeCategoryFilter, setActiveCategoryFilter, setActiveView } = useStore();
  const categoryTabsRef = useRef<HTMLDivElement>(null);
  const sortMenuRef = useRef<HTMLDivElement>(null);
  const filterMenuRef = useRef<HTMLDivElement>(null);

  const [filters, setFilters] = useState<FilterState>({
    category: activeCategoryFilter || 'ALL',
    collection: 'ALL',
    minPrice: 0,
    maxPrice: 100000,
    colors: [],
    sizes: [],
    inStockOnly: false,
    sortBy: 'featured'
  });
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

  // Keep category synchronized with store activeCategoryFilter
  React.useEffect(() => {
    if (activeCategoryFilter) {
      setFilters((f) => ({ ...f, category: activeCategoryFilter }));
    }
  }, [activeCategoryFilter]);

  // Scroll active category tab into center view after render
  useEffect(() => {
    const container = categoryTabsRef.current;
    if (!container) return;
    if (filters.category === 'COLLECTIONS') {
      // Last tab — scroll all the way to the end
      container.scrollTo({ left: container.scrollWidth, behavior: 'smooth' });
    } else {
      const activeBtn = container.querySelector(`[data-cat="${filters.category}"]`) as HTMLElement | null;
      if (!activeBtn) return;
      const containerRect = container.getBoundingClientRect();
      const btnRect = activeBtn.getBoundingClientRect();
      const offset = (btnRect.left + btnRect.width / 2) - (containerRect.left + containerRect.width / 2);
      container.scrollTo({ left: container.scrollLeft + offset, behavior: 'smooth' });
    }
  }, [filters.category]);

  const CATEGORY_TABS = ['ALL', 'NEW ARRIVALS', 'SIGNATURE', 'BAGS', 'SHOES', 'BEAUTY', 'ACCESSORIES', 'COLLECTIONS'];

  const categoriesList = useMemo(() => Array.from(new Set(products.map((p) => p.category))), [products]);
  const collectionsList = useMemo(() => Array.from(new Set(products.map((p) => p.collection))), [products]);

  const getHeaderDetails = () => {
    if (filters.category === 'COLLECTIONS') {
      return {
        badge: 'CURATED CAPSULES & RUNWAY ARCHIVES',
        title: 'MAISON COLLECTIONS',
        subtitle: 'Themed runway capsules, sculptural couture narratives, and seasonal architectural expressions.',
        image: '/Chrome%20Sculptures%20on%20Reflective%20Stone.png',
        objectPosition: 'center top'
      };
    }
    if (filters.category === 'NEW ARRIVALS') {
      return {
        badge: 'LATEST ATELIER RELEASES',
        title: 'NEW ARRIVALS',
        subtitle: 'Fresh drops of contemporary silk tailoring, seasonal leather goods, and newly unveiled silhouettes.',
        image: '/assets/images/shop_3d_hero.jpg',
        objectPosition: 'center center'
      };
    }
    if (filters.category === 'SIGNATURE') {
      return {
        badge: 'THE HOUSE SIGNATURES',
        title: 'SIGNATURE COLLECTION',
        subtitle: 'Enduring pieces that define the Kaytlyn Leonor point of view.',
        image: '/Luxury%20Cloche%20Gift%20Presentation.png',
        objectPosition: '72% center'
      };
    }
    if (filters.category === 'BAGS') {
      return {
        badge: 'ITALIAN CALFSKIN & ATELIER HARDWARE',
        title: 'LEATHER GOODS & BAGS',
        subtitle: 'Sculptured clutches, burnished crossbody silhouettes, and bespoke artisan hand-stitching.',
        image: '/Leonor%20Kaytlyn%20Luxury%20Packaging%20Still%20Life.png',
        objectPosition: '75% 65%'
      };
    }
    if (filters.category === 'SHOES') {
      return {
        badge: 'FINE FOOTWEAR & STILETTO PUMPS',
        title: 'MAISON FOOTWEAR',
        subtitle: '',
        image: '/Red%20Stilettos%20on%20the%20Crosswalk.png',
        objectPosition: 'center center'
      };
    }
    if (filters.category === 'ACCESSORIES') {
      return {
        badge: 'JEWELRY & ATELIER FINISHING TOUCHES',
        title: 'MAISON ACCESSORIES',
        subtitle: 'Sculptural jewelry and considered accents to complete the look.',
        image: '/Luxury%20Shopping%20Bag%20in%20Sunlit%20Interior.png',
        objectPosition: '90% center'
      };
    }
    if (filters.category === 'BEAUTY') {
      return {
        badge: 'BOTANICAL SCENT RITUALS & COSMETICS',
        title: 'BEAUTY & FRAGRANCE',
        subtitle: 'Artisanal French perfumery, hydrating velvet matte lipsticks, and skin-transforming elixirs.',
        image: encodeURI('/Heart Mirror Beauty Studio Scene.png'),
        objectPosition: '85% center'
      };
    }
    // Default: 'ALL'
    return {
      badge: '',
      title: 'THE CATALOGUE',
      subtitle: 'Kaytlyn Styles',
      image: '/catalouge_image.png',
      objectPosition: '78% center'
    };
  };

  const headerDetails = getHeaderDetails();
  const isCollectionsHeader = filters.category === 'COLLECTIONS';
  const isSignatureHeader = filters.category === 'SIGNATURE';
  const isShoesHeader = filters.category === 'SHOES';
  const hideMobileHeroCopy = filters.category !== 'ALL';
  const breadcrumbSegments = filters.category === 'ALL'
    ? ['the catalogue']
    : [
        'shop',
        filters.category.toLowerCase(),
        ...(filters.category === 'COLLECTIONS' && filters.collection !== 'ALL'
          ? [filters.collection.toLowerCase()]
          : [])
      ];

  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (filters.category === 'COLLECTIONS') {
      if (filters.collection !== 'ALL') {
        list = list.filter((p) => p.collection.toLowerCase() === filters.collection.toLowerCase());
      }
    } else if (filters.category === 'NEW ARRIVALS') {
      list = list.filter((p) => p.isNew);
    } else if (filters.category === 'SIGNATURE') {
      list = list.filter((p) => p.isBestseller || p.collection.toLowerCase().includes('signature'));
    } else if (filters.category !== 'ALL') {
      list = list.filter((p) => p.category.toUpperCase() === filters.category.toUpperCase() || p.collection.toUpperCase() === filters.category.toUpperCase());
    }

    if (filters.collection !== 'ALL' && filters.category !== 'COLLECTIONS') {
      list = list.filter((p) => p.collection.toLowerCase() === filters.collection.toLowerCase());
    }

    if (filters.maxPrice < 100000) {
      list = list.filter((p) => p.price <= filters.maxPrice);
    }

    if (filters.minPrice > 0) {
      list = list.filter((p) => p.price >= filters.minPrice);
    }

    if (filters.inStockOnly) {
      list = list.filter((p) => p.variants.some((v) => v.stock > 0));
    }

    // Sort
    if (filters.sortBy === 'price-low-high') {
      list.sort((a, b) => a.price - b.price);
    } else if (filters.sortBy === 'price-high-low') {
      list.sort((a, b) => b.price - a.price);
    } else if (filters.sortBy === 'newest') {
      list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    } else if (filters.sortBy === 'bestsellers') {
      list.sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0));
    }

    return list;
  }, [products, filters]);

  return (
    <div className="bg-[#F5F1EB] min-h-screen pb-20">
      
      {/* Full-width Dynamic Page Header with 3D Background */}
      <div className="relative w-full h-[80vh] min-h-[550px] flex flex-col justify-center text-left overflow-hidden -mt-[74px] md:-mt-[84px] mb-0 bg-[#F9E1E5]">
        {/* Split-color background area */}
        {headerDetails.image.includes('catalouge_image') && (
          <img src="/pink.png" alt="" className="absolute top-0 left-0 w-full h-12 object-cover" />
        )}

        <img 
          key={headerDetails.image}
          src={headerDetails.image} 
          alt={headerDetails.title}
          className="absolute inset-0 w-full h-full object-cover opacity-95 transition-opacity duration-700 animate-fade-in"
          style={{ objectPosition: headerDetails.objectPosition ?? 'center center' }}
        />
        <div className={`absolute inset-0 ${isCollectionsHeader ? 'bg-gradient-to-t from-[#11100E]/65 via-[#11100E]/20 to-transparent' : 'bg-gradient-to-t from-[#11100E]/55 via-[#11100E]/15 to-transparent'}`} />
        
        <div className={`${hideMobileHeroCopy ? 'hidden md:block' : ''} relative z-10 max-w-2xl space-y-4 animate-fade-up ${isShoesHeader ? 'ml-auto mr-3 px-0 pt-28 text-right md:mr-14 md:px-6 md:pt-16 lg:mr-20' : isSignatureHeader ? 'ml-6 px-6 pt-16 text-left md:ml-14 lg:ml-16' : 'ml-2 px-2 pt-16 text-left md:ml-8 lg:ml-12'}`}>
          {headerDetails.badge && (
            <span className={`font-sans uppercase font-semibold ${isShoesHeader ? 'hidden text-[9px] tracking-[0.3em] md:block md:text-[11px] md:tracking-[0.4em]' : 'text-[11px] tracking-[0.4em]'} ${isSignatureHeader ? 'text-[#11100E]' : 'text-[#F5F1EB]'}`}>
              {headerDetails.badge}
            </span>
          )}
          <h1 className={`font-serif ${isShoesHeader ? 'hidden text-3xl md:block md:text-6xl' : 'text-4xl md:text-6xl'} tracking-[0.2em] uppercase font-light ${isSignatureHeader ? 'text-[#11100E]' : 'text-[#F5F1EB]'}`}>
            {headerDetails.title}
          </h1>
          {headerDetails.subtitle && (
            <p className={`text-[10px] md:text-xs font-sans uppercase tracking-[0.5em] font-medium ${isSignatureHeader ? 'text-[#11100E]/80' : 'text-[#F5F1EB]/80'}`}>
              {headerDetails.subtitle}
            </p>
          )}
        </div>
      </div>

      <nav aria-label="Breadcrumb" className="mb-4 min-h-[44px] bg-[#F5F1EB] px-6 text-sm font-sans text-[#2C2925] lg:px-12">
        <ol className="mx-auto flex min-h-[44px] max-w-7xl items-center gap-2 whitespace-nowrap">
          <li>
            <button
              type="button"
              onClick={() => {
                setActiveCategoryFilter('ALL');
                setActiveView('home');
              }}
              className="lowercase hover:underline"
            >
              home
            </button>
          </li>
          {breadcrumbSegments.map((segment, index) => (
            <React.Fragment key={`${segment}-${index}`}>
              <li aria-hidden="true" className="text-[#A99684]">/</li>
              <li>
                {segment === 'shop' ? (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveCategoryFilter('ALL');
                      setFilters((current) => ({ ...current, category: 'ALL', collection: 'ALL' }));
                    }}
                    className="lowercase hover:underline"
                  >
                    shop
                  </button>
                ) : (
                  <span aria-current={index === breadcrumbSegments.length - 1 ? 'page' : undefined} className="lowercase">
                    {segment}
                  </span>
                )}
              </li>
            </React.Fragment>
          ))}
        </ol>
      </nav>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 space-y-12">

        {/* Category Navigation Pills */}
        <div className="relative">
          <div className={`absolute left-0 top-0 z-10 flex h-10 items-center bg-[#F5F1EB] md:hidden transition-opacity duration-200 ${filters.category === 'ALL' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <button
              type="button"
              onClick={() => categoryTabsRef.current?.scrollBy({ left: -220, behavior: 'smooth' })}
              aria-label="Slide categories left"
              className="flex h-10 w-8 items-center justify-center text-[#11100E]"
            >
              <ChevronLeft size={18} />
            </button>
          </div>
          <div
            ref={categoryTabsRef}
            className="flex items-center justify-start gap-2 overflow-x-auto no-scrollbar pb-2 pl-10 pr-20 text-xs font-sans uppercase tracking-wider select-none md:justify-center md:gap-4 md:pr-0 md:pl-0"
          >
            {CATEGORY_TABS.map((cat) => (
              <button
                key={cat}
                onClick={(e) => {
                  if (cat === 'COLLECTIONS') {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = (rect.left + rect.width / 2) / window.innerWidth;
                    const y = (rect.top + rect.height / 2) / window.innerHeight;
                    confetti({
                      particleCount: 100,
                      spread: 70,
                      origin: { x, y },
                      colors: ['#A99684', '#11100E', '#F5F1EB', '#2C2925']
                    });
                  }
                  setActiveCategoryFilter(cat);
                  setFilters((f) => ({ ...f, category: cat, collection: 'ALL' }));
                }}
                data-cat={cat}
                className={`px-4 py-2 transition-all border whitespace-nowrap ${
                  filters.category === cat
                    ? 'bg-[#11100E] text-[#F5F1EB] border-[#11100E] font-medium shadow-xs'
                    : 'bg-transparent text-[#2C2925] border-transparent hover:border-[#A99684]/40'
                } ${cat === 'COLLECTIONS' && filters.category === 'COLLECTIONS' ? 'md:overflow-hidden md:relative' : ''}`}
              >
                {cat === 'COLLECTIONS' ? (
                  <>
                    {/* Mobile: plain text swap */}
                    <span className="md:hidden">
                      {filters.category === 'COLLECTIONS' ? 'LTD. EDITION' : 'COLLECTIONS'}
                    </span>
                    {/* Desktop: marquee when active, plain text otherwise */}
                    <span className="hidden md:inline-block relative overflow-hidden" style={filters.category === 'COLLECTIONS' ? { width: '120px', verticalAlign: 'bottom' } : {}}>
                      {filters.category === 'COLLECTIONS' ? (
                        <span
                          className="animate-marquee"
                          style={{ animationPlayState: 'running', pointerEvents: 'none', whiteSpace: 'nowrap', display: 'inline-block' }}
                        >
                          LIMITED EDITION &nbsp;&nbsp;✦&nbsp;&nbsp; LIMITED EDITION &nbsp;&nbsp;✦&nbsp;&nbsp; LIMITED EDITION &nbsp;&nbsp;✦&nbsp;&nbsp;
                        </span>
                      ) : (
                        'COLLECTIONS'
                      )}
                    </span>
                  </>
                ) : (
                  cat
                )}
              </button>
            ))}
          </div>
          <div className={`absolute right-0 top-0 z-10 flex h-10 items-center bg-[#F5F1EB] md:hidden transition-opacity duration-200 ${filters.category === 'COLLECTIONS' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <button
              type="button"
              onClick={() => categoryTabsRef.current?.scrollBy({ left: 220, behavior: 'smooth' })}
              aria-label="Slide categories right"
              className="flex h-10 w-8 items-center justify-center text-[#11100E]"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>



        {/* Filter Bar & Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between pb-6 border-b border-[#EEE8DF] gap-4 text-xs font-sans">
          
          {/* Active Count */}
          <span className="text-[#A99684] uppercase tracking-widest font-medium">
            SHOWING {filteredProducts.length} CREATION{filteredProducts.length !== 1 ? 'S' : ''}
          </span>

          {/* Right Actions: Filter Drawer Trigger & Sort Select */}
          <div className="flex w-full min-w-0 items-center justify-between gap-2 sm:w-auto sm:justify-end sm:gap-4">
            
            <div ref={filterMenuRef} className="relative min-w-0 flex-1 sm:flex-none">
              <button
                type="button"
                aria-haspopup="dialog"
                aria-expanded={isFilterMenuOpen}
                onClick={() => {
                  setIsFilterMenuOpen((open) => !open);
                  setIsSortMenuOpen(false);
                }}
                className="flex w-full min-w-0 items-center justify-center gap-2 whitespace-nowrap border border-[#A99684]/30 bg-[#EEE8DF] px-2 py-2.5 text-[10px] font-medium uppercase tracking-wider transition-colors hover:bg-[#11100E] hover:text-[#F5F1EB] sm:flex-none sm:px-4 sm:text-xs"
              >
                <SlidersHorizontal size={15} />
                <span className="sm:hidden">FILTER</span>
                <span className="hidden sm:inline">REFINE FILTERS</span>
                <ChevronDown size={14} className="shrink-0" />
              </button>
              <FilterDrawer
                filters={filters}
                setFilters={setFilters}
                categories={categoriesList}
                collections={collectionsList}
                isOpen={isFilterMenuOpen}
                onClose={() => setIsFilterMenuOpen(false)}
              />
            </div>

            <div ref={sortMenuRef} className="relative min-w-0 flex-1 sm:flex-none">
              <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={isSortMenuOpen}
                onClick={() => setIsSortMenuOpen((open) => !open)}
                className="flex w-full min-w-0 items-center justify-between gap-2 border border-[#A99684]/30 bg-white px-2 py-2.5 text-[10px] font-medium uppercase tracking-wider sm:min-w-[210px] sm:px-3 sm:text-xs"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <ArrowUpDown size={14} className="shrink-0 text-[#A99684]" />
                  <span className="sm:hidden">SORT</span>
                  <span className="hidden truncate sm:inline">{SORT_OPTIONS.find((option) => option.value === filters.sortBy)?.label}</span>
                </span>
                <ChevronDown size={14} className="shrink-0 text-[#A99684]" />
              </button>
              {isSortMenuOpen && (
                <div
                  role="listbox"
                  aria-label="Sort products"
                  className="absolute right-0 z-30 mt-1 w-64 max-w-[calc(100vw-3rem)] border border-[#EEE8DF] bg-white py-1 shadow-lg"
                >
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      role="option"
                      aria-selected={filters.sortBy === option.value}
                      onClick={() => {
                        setFilters((current) => ({ ...current, sortBy: option.value }));
                        setIsSortMenuOpen(false);
                      }}
                      className={`block w-full px-3 py-2.5 text-left text-[11px] font-sans uppercase tracking-wider transition-colors ${
                        filters.sortBy === option.value
                          ? 'bg-[#EEE8DF] text-[#11100E]'
                          : 'text-[#2C2925] hover:bg-[#F5F1EB]'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Product Grid */}
        <ProductGrid products={filteredProducts} />



      </div>
    </div>
  );
};

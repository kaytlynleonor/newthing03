import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { Search, X, ArrowUpRight } from 'lucide-react';

export const SearchOverlay: React.FC = () => {
  const { products, cmsConfig, isSearchOpen, setIsSearchOpen, openProductDetail, formatPrice } = useStore();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [navbarBottom, setNavbarBottom] = useState(0);

  // Measure navbar bottom once + whenever navbar resizes
  useEffect(() => {
    const measure = () => {
      const header = document.querySelector('header');
      if (header) setNavbarBottom(header.getBoundingClientRect().bottom);
    };
    measure();
    const ro = new ResizeObserver(measure);
    const header = document.querySelector('header');
    if (header) ro.observe(header);
    return () => ro.disconnect();
  }, []);

  // Close search on scroll to avoid positioning glitches
  useEffect(() => {
    if (!isSearchOpen) return;
    const handleScroll = () => setIsSearchOpen(false);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isSearchOpen, setIsSearchOpen]);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  if (!isSearchOpen) return null;

  // Scoring function to rank products by relevance of search query.
const computeScore = (p: typeof products[0]) => {
  const q = query.toLowerCase();
  let score = 0;
  if (p.name.toLowerCase().includes(q)) score++;
  if (p.category.toLowerCase().includes(q)) score++;
  if (p.collection.toLowerCase().includes(q)) score++;
  if (p.subtitle.toLowerCase().includes(q)) score++;
  if (p.shortDescription.toLowerCase().includes(q)) score++;
  if (p.description.toLowerCase().includes(q)) score++;
  if (p.tags.some(t => t.toLowerCase().includes(q))) score++;
  return score;
};

// Compute filtered and sorted products based on search relevance.
const filteredProducts = query.trim()
  ? products
      .map((p) => ({ ...p, score: computeScore(p) }))
      .filter((p) => p.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((p) => ({ ...p }))
  : [];

  const categories = Array.from(new Set(products.map((product) => product.category).filter(Boolean)));
  const displayCategories = categories.length > 0
    ? categories
    : ['NEW ARRIVALS', 'BAGS', 'SHOES', 'BEAUTY', 'SIGNATURE', 'ACCESSORIES', 'COLLECTIONS'];

  const trendingProducts = [...products]
    .sort((a, b) => Number(b.isBestseller) - Number(a.isBestseller) || b.rating - a.rating)
    .slice(0, 5);
  const panelTopStyle = { top: `${navbarBottom}px` };

  const getActionButtonLabel = (product: typeof products[0]) => {
    if (product.sizes && product.sizes.length > 1) {
      return 'choose size';
    }
    if (product.variants && product.variants.length > 1) {
      return product.category === 'BEAUTY' ? 'choose shade' : 'choose color';
    }
    return 'view product';
  };

  const getProductSubtitle = (product: typeof products[0]) => {
    return product.subtitle || product.variants[0]?.name || product.category.toLowerCase();
  };

  return (
    <>
      <button
        type="button"
        aria-label="Close search"
        onClick={() => setIsSearchOpen(false)}
        className="fixed inset-x-0 bottom-0 z-40 bg-[#11100E]/20"
        style={panelTopStyle}
      />
      <section
        role="dialog"
        aria-label="Product search"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
        className="fixed inset-x-0 z-50 max-h-[min(78vh,720px)] overflow-y-auto border-y border-[#EEE8DF] bg-white px-5 pb-6 pt-4 text-[#11100E] shadow-xl animate-fade-in-scale md:px-10 md:pt-5"
        style={panelTopStyle}
      >
        <div className="flex items-center gap-4">
          <div className="relative min-w-0 flex-1">
            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#11100E]" strokeWidth={1.5} />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="search"
              className="h-11 w-full border border-[#EEE8DF] bg-white pl-12 pr-4 text-sm text-[#11100E] placeholder:text-[#77716D] focus:border-[#A99684] focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => setIsSearchOpen(false)}
            className="shrink-0 p-2 text-[#77716D] transition-colors hover:text-[#11100E]"
            aria-label="Close search"
          >
            <X size={24} strokeWidth={1.4} />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-[minmax(180px,0.7fr)_minmax(0,2fr)] md:gap-10">
          <div>
            <h2 className="mb-3 text-sm text-[#55504C]">categories:</h2>
            <ul className="space-y-1">
              {displayCategories.map((cat) => {
                const isActive = query.trim().toLowerCase() === cat.toLowerCase();
                return (
                  <li key={cat}>
                    <button
                      type="button"
                      onClick={() => setQuery(isActive ? '' : cat.toLowerCase())}
                      className={`py-1.5 text-left text-sm font-medium transition-colors ${
                        isActive ? 'text-[#A99684] font-semibold' : 'text-[#3A3836] hover:text-[#A99684]'
                      }`}
                    >
                      {cat.toLowerCase()}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="min-w-0">
            {query.trim() ? (
              <div>
                <div className="mb-3 flex items-center justify-between text-sm text-[#55504C]">
                  <span>results for “{query}”:</span>
                  <span className="text-xs text-[#77716D]">
                    {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
                  </span>
                </div>
                {filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                    {filteredProducts.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => openProductDetail(product.id)}
                        className="overflow-hidden border border-[#EEE8DF] bg-white text-left transition-colors hover:border-[#A99684]"
                      >
                        <div className="aspect-square overflow-hidden bg-[#EEE8DF]">
                          <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                        </div>
                        <div className="space-y-1 p-2.5">
                          <h3 className="line-clamp-2 text-xs font-semibold leading-snug">{product.name}</h3>
                          <p className="line-clamp-1 text-xs text-[#77716D]">{getProductSubtitle(product)}</p>
                          <span className="block pt-1 text-xs font-medium">{formatPrice(product.price)}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="py-8 text-center text-sm text-[#77716D]">No products found for “{query}”.</p>
                )}
              </div>
            ) : (
              <div>
                <h2 className="mb-3 text-sm text-[#55504C]">trending products:</h2>
                <div className="no-scrollbar grid auto-cols-[minmax(148px,1fr)] grid-flow-col gap-3 overflow-x-auto pb-1 sm:auto-cols-[minmax(170px,1fr)] md:auto-cols-[minmax(150px,1fr)]">
                  {trendingProducts.map((product) => (
                    <article key={product.id} className="overflow-hidden border border-[#EEE8DF] bg-white">
                      <button type="button" onClick={() => openProductDetail(product.id)} className="block w-full text-left">
                        <div className="aspect-square overflow-hidden bg-[#EEE8DF]">
                          <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                        </div>
                        <div className="px-2.5 pt-2">
                          <h3 className="line-clamp-2 min-h-9 text-sm font-semibold leading-snug">{product.name}</h3>
                          <p className="mt-1 line-clamp-1 text-sm text-[#77716D]">
                            {getProductSubtitle(product)}
                          </p>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => openProductDetail(product.id)}
                        className="mx-2.5 mb-2.5 mt-2 flex h-9 w-[calc(100%-1.25rem)] items-center justify-center gap-1 border border-[#77716D] px-2 text-xs text-[#3A3836] transition-colors hover:bg-[#F5F1EB]"
                      >
                        <span>{getActionButtonLabel(product)}</span>
                        <ArrowUpRight size={13} />
                      </button>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

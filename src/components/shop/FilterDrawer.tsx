import React from 'react';
import { useStore } from '../../context/StoreContext';
import { FilterState } from '../../types/ecommerce';
import { X, RefreshCw } from 'lucide-react';

interface FilterDrawerProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  categories: string[];
  collections: string[];
  isOpen: boolean;
  onClose: () => void;
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  filters,
  setFilters,
  categories,
  collections,
  isOpen,
  onClose
}) => {
  const { formatPrice } = useStore();

  if (!isOpen) return null;

  const handleReset = () => {
    setFilters({
      category: 'ALL',
      collection: 'ALL',
      minPrice: 0,
      maxPrice: 100000,
      colors: [],
      sizes: [],
      inStockOnly: false,
      sortBy: 'featured'
    });
  };

  return (
    <>
      {/* Backdrop — shown on both mobile and desktop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 sm:bg-transparent"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel — centered popup on mobile, dropdown on desktop */}
      <div className="
        fixed inset-0 z-50 flex items-center justify-center px-4
        sm:absolute sm:inset-auto sm:bottom-auto sm:left-auto sm:right-0 sm:flex-none sm:px-0 sm:mt-1 sm:z-50
      ">
      <div className="
        w-full max-w-sm bg-white shadow-2xl rounded-2xl
        sm:rounded-none sm:w-72 sm:max-w-[calc(100vw-2rem)] sm:shadow-lg sm:border sm:border-[#EEE8DF]
      ">
      <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto sm:max-h-[75vh]">
        {/* No drag handle needed — it's a popup now */}
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg tracking-[0.2em] font-light uppercase">
            REFINE SELECTION
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-[#11100E] hover:text-[#A99684]"
            aria-label="Close filter"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filter Content */}
        <div className="space-y-6 text-xs font-sans">
          
          {/* Category Filter */}
          <div className="space-y-3">
            <h4 className="font-sans text-[11px] uppercase tracking-[0.25em] text-[#A99684] font-semibold">
              CATEGORY
            </h4>
            <div className="space-y-2">
              <button
                onClick={() => setFilters((f) => ({ ...f, category: 'ALL' }))}
                className={`block w-full text-left py-1 tracking-wider uppercase ${
                  filters.category === 'ALL' ? 'font-bold text-[#11100E] underline' : 'text-[#2C2925]'
                }`}
              >
                ALL CATEGORIES
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilters((f) => ({ ...f, category: cat }))}
                  className={`block w-full text-left py-1 tracking-wider uppercase ${
                    filters.category === cat ? 'font-bold text-[#11100E] underline' : 'text-[#2C2925]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Collection Filter */}
          <div className="space-y-3 pt-4 border-t border-[#EEE8DF]">
            <h4 className="font-sans text-[11px] uppercase tracking-[0.25em] text-[#A99684] font-semibold">
              COLLECTION
            </h4>
            <div className="space-y-2">
              <button
                onClick={() => setFilters((f) => ({ ...f, collection: 'ALL' }))}
                className={`block w-full text-left py-1 tracking-wider uppercase ${
                  filters.collection === 'ALL' ? 'font-bold text-[#11100E] underline' : 'text-[#2C2925]'
                }`}
              >
                ALL COLLECTIONS
              </button>
              {collections.map((col) => (
                <button
                  key={col}
                  onClick={() => setFilters((f) => ({ ...f, collection: col }))}
                  className={`block w-full text-left py-1 tracking-wider uppercase ${
                    filters.collection === col ? 'font-bold text-[#11100E] underline' : 'text-[#2C2925]'
                  }`}
                >
                  {col}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="space-y-3 pt-4 border-t border-[#EEE8DF]">
            <div className="flex justify-between items-center">
              <h4 className="font-sans text-[11px] uppercase tracking-[0.25em] text-[#A99684] font-semibold">
                MAX PRICE
              </h4>
              <span className="font-semibold text-[#11100E]">
                {formatPrice(filters.maxPrice)}
              </span>
            </div>
            <input
              type="range"
              min="1000"
              max="100000"
              step="1000"
              value={filters.maxPrice}
              onChange={(e) => setFilters((f) => ({ ...f, maxPrice: Number(e.target.value) }))}
              className="w-full accent-[#11100E] cursor-pointer"
            />
          </div>

          {/* Availability Filter */}
          <div className="pt-4 border-t border-[#EEE8DF]">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={filters.inStockOnly}
                onChange={(e) => setFilters((f) => ({ ...f, inStockOnly: e.target.checked }))}
                className="w-4 h-4 accent-[#11100E]"
              />
              <span className="uppercase tracking-wider text-xs">IN STOCK ONLY</span>
            </label>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="pt-6 mt-4 border-t border-[#EEE8DF] flex items-center justify-between gap-4 pb-safe sm:pb-0">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-[#A99684] hover:text-[#11100E] uppercase tracking-wider font-sans"
          >
            <RefreshCw size={14} /> RESET
          </button>
          <button
            onClick={onClose}
            className="bg-[#11100E] text-[#F5F1EB] px-6 py-2.5 text-xs uppercase tracking-[0.2em] font-sans hover:bg-[#A99684] transition-colors"
          >
            APPLY
          </button>
        </div>

      </div>
    </div>
    </div>
    </>
  );
};


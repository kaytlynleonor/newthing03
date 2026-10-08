import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Home, Compass, Search, Heart, ShoppingBag } from 'lucide-react';

export const MobileBottomBar: React.FC = () => {
  const {
    activeView,
    setActiveView,
    cartCount,
    wishlist,
    setIsCartOpen,
    setIsSearchOpen,
    setActiveCategoryFilter
  } = useStore();

  if (activeView === 'product' || activeView === 'checkout') return null;

  const handleNav = (view: string) => {
    if (view === 'shop') {
      setActiveCategoryFilter('ALL');
    }
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#F5F1EB]/95 backdrop-blur-md border-t border-[#EEE8DF] px-4 py-2 flex items-center justify-around text-[#11100E] shadow-lg">
      <button
        onClick={() => handleNav('home')}
        className={`flex flex-col items-center gap-0.5 text-[9px] uppercase tracking-wider ${
          activeView === 'home' ? 'text-[#11100E] font-semibold' : 'text-[#A99684]'
        }`}
      >
        <Home size={18} strokeWidth={activeView === 'home' ? 2 : 1.5} />
        <span>HOME</span>
      </button>

      <button
        onClick={() => handleNav('shop')}
        className={`flex flex-col items-center gap-0.5 text-[9px] uppercase tracking-wider ${
          activeView === 'shop' ? 'text-[#11100E] font-semibold' : 'text-[#A99684]'
        }`}
      >
        <Compass size={18} strokeWidth={activeView === 'shop' ? 2 : 1.5} />
        <span>SHOP</span>
      </button>

      <button
        onClick={() => setIsSearchOpen(true)}
        className="flex flex-col items-center gap-0.5 text-[9px] uppercase tracking-wider text-[#A99684]"
      >
        <Search size={18} strokeWidth={1.5} />
        <span>SEARCH</span>
      </button>

      <button
        onClick={() => handleNav('wishlist')}
        className={`relative flex flex-col items-center gap-0.5 text-[9px] uppercase tracking-wider ${
          activeView === 'wishlist' ? 'text-[#11100E] font-semibold' : 'text-[#A99684]'
        }`}
      >
        <Heart size={18} strokeWidth={activeView === 'wishlist' ? 2 : 1.5} />
        <span>WISHLIST</span>
        {wishlist.length > 0 && (
          <span className="absolute -top-1 right-2 bg-[#11100E] text-[#F5F1EB] text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
            {wishlist.length}
          </span>
        )}
      </button>

      <button
        onClick={() => setIsCartOpen(true)}
        className="relative flex flex-col items-center gap-0.5 text-[9px] uppercase tracking-wider text-[#A99684]"
      >
        <ShoppingBag size={18} strokeWidth={1.5} />
        <span>BAG</span>
        {cartCount > 0 && (
          <span className="absolute -top-1 right-2 bg-[#A99684] text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
            {cartCount}
          </span>
        )}
      </button>
    </nav>
  );
};

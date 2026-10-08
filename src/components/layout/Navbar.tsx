import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { Search, ShoppingBag, Heart, User, X, PackageSearch } from 'lucide-react';
import { navigateToTracking } from '../../lib/orderTracking';

export const Navbar: React.FC = () => {
  const {
    activeView,
    navigateFromNavbar,
    cartCount,
    wishlist,
    setIsCartOpen,
    isSearchOpen,
    setIsSearchOpen,
    setIsAccountOpen,
    activeCategoryFilter,
    setActiveView,
  } = useStore();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isClosingMenu, setIsClosingMenu] = useState(false);
  const menuCloseTimer = useRef<number | null>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (menuCloseTimer.current !== null) window.clearTimeout(menuCloseTimer.current);
    };
  }, []);

  const isShopCataloguePage = activeView === 'shop' && (activeCategoryFilter === 'ALL' || activeCategoryFilter === 'BEAUTY');
  const showImageBackground = isShopCataloguePage && !isScrolled && !isSearchOpen;

  const openMenu = () => {
    if (menuCloseTimer.current !== null) { window.clearTimeout(menuCloseTimer.current); menuCloseTimer.current = null; }
    setIsClosingMenu(false);
    setMobileMenuOpen(true);
  };

  const closeMenu = () => {
    if (!mobileMenuOpen || isClosingMenu) return;
    setIsClosingMenu(true);
    menuCloseTimer.current = window.setTimeout(() => {
      setMobileMenuOpen(false);
      setIsClosingMenu(false);
      menuCloseTimer.current = null;
    }, 320);
  };

  const forceCloseMenu = () => {
    if (menuCloseTimer.current !== null) { window.clearTimeout(menuCloseTimer.current); menuCloseTimer.current = null; }
    setIsClosingMenu(false);
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    const handler = () => forceCloseMenu();
    window.addEventListener('kl-close-mobile-menu', handler);
    return () => window.removeEventListener('kl-close-mobile-menu', handler);
  }, []);

  // Prevent background scrolling while mobile hamburger menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalTouchAction = document.body.style.touchAction;
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.touchAction = originalTouchAction;
      };
    }
  }, [mobileMenuOpen]);

  const isMenuIconOpen = mobileMenuOpen && !isClosingMenu;

  const navigateTo = (view: string, category: string = 'ALL') => {
    navigateFromNavbar(view, category);
    closeMenu();
  };

  const openTracking = () => {
    forceCloseMenu();
    setIsSearchOpen(false);
    navigateToTracking(setActiveView);
  };

  const actionBtnClass =
    'group flex items-center gap-1.5 py-1.5 px-2.5 rounded-full hover:bg-[#A99684]/15 transition-all duration-300';
  const actionLabelClass =
    'max-w-0 opacity-0 group-hover:max-w-[120px] group-hover:opacity-100 transition-all duration-300 ease-out overflow-hidden whitespace-nowrap uppercase text-[10px] font-medium tracking-[0.2em] pl-0.5';

  return (
    <>
      <header className={`sticky top-0 z-50 w-full transition-all duration-300 ease-in-out ${activeView === 'product'
          ? 'bg-white text-[#11100E] border-b border-[#EEE8DF] shadow-sm py-2 md:py-2.5'
          : showImageBackground
            ? 'bg-transparent text-[#F5F1EB] border-b border-transparent shadow-none py-2 md:py-2.5 md:hover:bg-white md:hover:text-[#11100E] md:hover:border-[#EEE8DF] md:hover:shadow-sm'
            : 'bg-white text-[#11100E] border-b border-[#EEE8DF] shadow-sm py-2 md:py-2.5'
        }`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative flex items-center justify-between min-h-[58px]">

          {/* Desktop Left Nav */}
          <nav className="hidden lg:flex items-center gap-7 text-[11px] font-sans tracking-[0.2em] font-medium">
            {[
              { label: 'HOME', view: 'home' },
              { label: 'SHOP', view: 'shop', cat: 'ALL' },
              { label: 'NEW', view: 'shop', cat: 'NEW ARRIVALS' },
              { label: 'COLLECTIONS', view: 'shop', cat: 'COLLECTIONS' },
              { label: 'JOURNAL', view: 'journal' },
            ].map(item => (
              <button key={item.label} onClick={() => navigateTo(item.view, item.cat)}
                className="editorial-link transition-colors hover:text-[#A99684]">
                {item.label}
              </button>
            ))}
          </nav>


          {/* Mobile Hamburger */}
          <button
            onClick={() => (mobileMenuOpen && !isClosingMenu ? closeMenu() : openMenu())}
            className="lg:hidden absolute right-5 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center focus:outline-none"
            aria-label={isMenuIconOpen ? 'Close mobile menu' : 'Open mobile menu'}
          >
            <span className={`absolute left-1/2 top-1/2 h-[1.5px] w-6 -translate-x-1/2 bg-current transition-all duration-300 ${isMenuIconOpen ? 'translate-y-0 rotate-45' : '-translate-y-2'}`} />
            <span className={`absolute left-1/2 top-1/2 h-[1.5px] w-6 -translate-x-1/2 bg-current transition-all duration-200 ${isMenuIconOpen ? 'scale-x-0 opacity-0' : 'scale-x-100 opacity-100'}`} />
            <span className={`absolute left-1/2 top-1/2 h-[1.5px] w-6 -translate-x-1/2 bg-current transition-all duration-300 ${isMenuIconOpen ? 'translate-y-0 -rotate-45' : 'translate-y-2'}`} />
          </button>

          {/* Center Logo */}
          <button type="button"
            className="absolute left-1/2 -translate-x-1/2 flex items-center cursor-pointer select-none group pointer-events-auto z-50 bg-transparent border-0 p-0"
            onClick={() => navigateTo('home')} aria-label="Go to home">
            <img src="/Luxury%20Gold%20KL%20Monogram%20Logo.png" alt="Kaytlyn Leonor"
              className="h-12 md:h-16 w-auto object-contain transition-transform duration-300 group-hover:scale-105" />
          </button>

          {/* Desktop Right Actions */}
          <div className="hidden lg:flex items-center gap-1 md:gap-2 text-[11px] font-sans tracking-[0.2em] ml-auto lg:ml-0">

            <button type="button" onClick={() => { setIsSearchOpen(!isSearchOpen); setIsAccountOpen(false); }} className={actionBtnClass} aria-label="Search">
              <Search size={18} strokeWidth={1.5} className="shrink-0 transition-transform duration-300 group-hover:scale-110" />
              <span className={actionLabelClass}>Search</span>
            </button>

            <button
              type="button"
              onClick={openTracking}
              className={`${actionBtnClass} ${activeView === 'tracking' ? 'bg-[#A99684]/20' : ''}`}
              aria-label="Track order"
            >
              <PackageSearch size={18} strokeWidth={1.5} className="shrink-0 transition-transform duration-300 group-hover:scale-110" />
              <span className={actionLabelClass}>Track order</span>
            </button>

            <button type="button" onClick={() => { setIsAccountOpen(true); setIsSearchOpen(false); }} className={actionBtnClass} aria-label="Account">
              <User size={18} strokeWidth={1.5} className="shrink-0 transition-transform duration-300 group-hover:scale-110" />
              <span className={actionLabelClass}>Account</span>
            </button>

            <button type="button" onClick={() => navigateTo('wishlist')} className={`${actionBtnClass} relative`} aria-label="Wishlist">
              <div className="relative shrink-0">
                <Heart size={18} strokeWidth={1.5} className="transition-transform duration-300 group-hover:scale-110" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#11100E] text-[#F5F1EB] text-[9px] font-semibold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                    {wishlist.length}
                  </span>
                )}
              </div>
              <span className={actionLabelClass}>Wishlist</span>
            </button>

            <button type="button" onClick={() => { setIsCartOpen(true); setIsSearchOpen(false); }} className={`${actionBtnClass} relative`} aria-label="Shopping Bag">
              <div className="relative shrink-0">
                <ShoppingBag size={18} strokeWidth={1.5} className="transition-transform duration-300 group-hover:scale-110" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#A99684] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-sm">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className={actionLabelClass}>Bag</span>
            </button>

          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {(mobileMenuOpen || isClosingMenu) && (
        <div
          className={`fixed inset-0 z-50 bg-[#11100E]/80 backdrop-blur-md overscroll-none touch-none ${isClosingMenu ? 'animate-fade-out' : 'animate-fade-in'}`}
          onClick={closeMenu}
        >
          <div
            className={`w-full h-full bg-[#F5F1EB] text-[#11100E] flex flex-col shadow-2xl overscroll-contain touch-pan-y ${isClosingMenu ? 'animate-slide-out-right' : 'animate-slide-in-right'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="shrink-0 px-7 pt-7 pb-5 flex items-center justify-between border-b border-[#EEE8DF]">
              <span className="font-serif text-lg tracking-[0.25em] font-light">KAYTLYN LEONOR</span>
              <button onClick={closeMenu} className="p-1 text-[#11100E] hover:text-[#A99684]" aria-label="Close"><X size={22} /></button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto px-7 py-6 overscroll-contain touch-pan-y">
              <div className="flex flex-col text-[15px] font-sans tracking-[0.22em] uppercase font-medium">
                {[
                  { label: 'HOME', action: () => navigateTo('home') },
                  { label: 'SHOP', action: () => navigateTo('shop', 'ALL') },
                  { label: 'NEW ARRIVALS', action: () => navigateTo('shop', 'NEW ARRIVALS') },
                  { label: 'SIGNATURE', action: () => navigateTo('shop', 'SIGNATURE') },
                  { label: 'HANDBAGS', action: () => navigateTo('shop', 'BAGS') },
                  { label: 'SHOES', action: () => navigateTo('shop', 'SHOES') },
                  { label: 'BEAUTY & FRAGRANCE', action: () => navigateTo('shop', 'BEAUTY') },
                  { label: 'THE JOURNAL', action: () => navigateTo('journal') },
                  { label: 'TRACK ORDER', action: openTracking },
                  { label: 'ACCOUNT', action: () => { forceCloseMenu(); setIsAccountOpen(true); } },
                  { label: 'WISHLIST', action: () => navigateTo('wishlist'), badge: wishlist.length },
                ].map((item, index) => (
                  <button key={item.label} onClick={item.action}
                    className={`text-left py-3.5 border-b border-[#EEE8DF]/70 hover:text-[#A99684] transition-colors ${isClosingMenu ? 'opacity-0' : 'animate-menu-item'}`}
                    style={isClosingMenu ? undefined : { animationDelay: `${index * 45}ms` }}>
                    <span className="flex items-center justify-between gap-4">
                      <span>{item.label}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="text-[10px] bg-[#11100E] text-[#F5F1EB] px-2 py-0.5 rounded-full font-semibold">{item.badge}</span>
                      )}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

import React, { useLayoutEffect } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { AuthProvider } from './context/AuthContext';

// Layout
import { AnnouncementBar } from './components/layout/AnnouncementBar';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { MobileBottomBar } from './components/layout/MobileBottomBar';
import { StructuredData } from './components/layout/StructuredData';
import { CookieConsent } from './components/layout/CookieConsent';

// Common
import { ScrollToTop } from './components/common/ScrollToTop';
import { TrackingViewBridge } from './components/common/TrackingViewBridge';

// Home View Sections
import { Hero } from './components/home/Hero';


import { BestSellingBoots } from './components/home/BestSellingBoots';
import { FeaturedCollection } from './components/home/FeaturedCollection';
import { ShopByCategory } from './components/home/ShopByCategory';
import { BestsellersCarousel } from './components/home/BestsellersCarousel';
import { BrandStory } from './components/home/BrandStory';
import { SocialGallery } from './components/home/SocialGallery';

// Other Page Views
import { ShopView } from './components/shop/ShopView';
import { WishlistView } from './components/wishlist/WishlistView';
import { JournalView } from './components/journal/JournalView';
import { CheckoutModal } from './components/checkout/CheckoutModal';
import { Error404View } from './components/common/Error404View';
import { ContactView } from './components/common/ContactView';
import { PrivacyPolicyView } from './components/common/PrivacyPolicyView';
import { TermsOfUseView } from './components/common/TermsOfUseView';
import { LoginPage } from './components/account/pages/LoginPage';
import { SignupPage } from './components/account/pages/SignupPage';
import { BagPage } from './components/account/pages/BagPage';
import { OrdersPage } from './components/account/pages/OrdersPage';
import { OrderDetailPage } from './components/account/pages/OrderDetailPage';
import { OrderTrackingPage } from './components/track/OrderTrackingPage';
import { ProfilePage } from './components/account/pages/ProfilePage';

// Modals & Drawers
import { ProductDetailModal } from './components/product/ProductDetailModal';
import { MiniCartDrawer } from './components/cart/MiniCartDrawer';
import { SearchOverlay } from './components/search/SearchOverlay';
import { SizeGuideModal } from './components/product/SizeGuideModal';
import { CMSAdminModal } from './components/cms/CMSAdminModal';
import { CMSPage } from './components/cms/CMSPage';
import { AccountDrawer } from './components/account/AccountDrawer';
import { PolicyModal } from './components/common/PolicyModal';
import { ArticleModal } from './components/journal/ArticleModal';
import { ToastContainer } from './components/common/Toast';
import { LoadingScreen } from './components/common/LoadingScreen';

const MainContent: React.FC = () => {
  const { activeView } = useStore();

  useLayoutEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';

    const restoreFrame = window.requestAnimationFrame(() => {
      const savedScrollY = Number(sessionStorage.getItem('kl_scroll_y') || 0);
      window.scrollTo(0, savedScrollY);
    });

    const saveScrollPosition = () => {
      sessionStorage.setItem('kl_scroll_y', String(window.scrollY));
    };

    let saveFrame = 0;
    const scheduleScrollSave = () => {
      window.cancelAnimationFrame(saveFrame);
      saveFrame = window.requestAnimationFrame(saveScrollPosition);
    };

    window.addEventListener('scroll', scheduleScrollSave, { passive: true });
    window.addEventListener('pagehide', saveScrollPosition);

    return () => {
      window.cancelAnimationFrame(restoreFrame);
      window.cancelAnimationFrame(saveFrame);
      window.removeEventListener('scroll', scheduleScrollSave);
      window.removeEventListener('pagehide', saveScrollPosition);
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-[#11100E] selection:text-[#F5F1EB]">
        <TrackingViewBridge />
      <StructuredData />
      <LoadingScreen />
      
      <div>
        <AnnouncementBar />
        <Navbar />

        {/* Dynamic Page Routing View */}
        <main className="animate-fade-up">
          {activeView === 'home' && (
            <>
              <Hero />
              
              <BestSellingBoots />
              <FeaturedCollection />
              <ShopByCategory />
              <BestsellersCarousel />
              <BrandStory />
              <SocialGallery />
            </>
          )}

          {activeView === 'shop' && <ShopView />}
          {activeView === 'product' && <ProductDetailModal />}
          {activeView === 'wishlist' && <WishlistView />}
          {activeView === 'journal' && <JournalView />}
          {activeView === 'contact' && <ContactView />}
          {activeView === 'checkout' && <CheckoutModal />}
          {activeView === 'login' && <LoginPage />}
          {activeView === 'signup' && <SignupPage />}
          {activeView === 'bag' && <BagPage />}
          {activeView === 'orders' && <OrdersPage />}
          {activeView === 'order-detail' && <OrderDetailPage />}
          {activeView === 'profile' && <ProfilePage />}
          {(activeView === 'tracking' || activeView === 'order-tracking') && <OrderTrackingPage />}
          {activeView === 'privacy' && <PrivacyPolicyView />}
          {activeView === 'terms' && <TermsOfUseView />}
          {activeView === 'cms' && <CMSPage />}

          {activeView === '404' && <Error404View />}
        </main>
      </div>

      <Footer />
      <MobileBottomBar />

      {/* Global Interactive Overlays & Modals */}
      <MiniCartDrawer />
      <AccountDrawer />
      <SearchOverlay />
      <SizeGuideModal />
      <CMSAdminModal />
      <PolicyModal />
      <ArticleModal />
      <ToastContainer />
      <CookieConsent />

      {/* Scroll to Top Button */}
      <ScrollToTop />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <AuthProvider>
        <MainContent />
      </AuthProvider>
    </StoreProvider>
  );
}

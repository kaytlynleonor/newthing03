import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, CartItem, Currency, Order, CMSConfig, ProductVariant } from '../types/ecommerce';
import { INITIAL_PRODUCTS } from '../data/products';
import { DEFAULT_CMS_CONFIG } from '../data/initialCMS';
import { onSnapshot, doc, setDoc, collection, query, orderBy } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../lib/firebase';

interface ToastState {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'error';
}

interface StoreContextType {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  
  cart: CartItem[];
  addToCart: (product: Product, selectedVariant: ProductVariant, selectedSize: string, quantity?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQty: (cartItemId: string, delta: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  
  wishlist: string[]; // Product IDs
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  
  activeView: string;
  setActiveView: (view: string) => void;
  /** Leave an open product page and go to a main site view (navbar / logo). */
  navigateFromNavbar: (view: string, category?: string) => void;
  
  selectedProductId: string | null;
  openProductDetail: (productId: string) => void;
  closeProductDetail: () => void;
  
  selectedArticleId: string | null;
  openArticle: (articleId: string) => void;
  closeArticle: () => void;
  
  // UI drawers & overlays
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  
  isFilterOpen: boolean;
  setIsFilterOpen: (open: boolean) => void;
  
  isAccountOpen: boolean;
  setIsAccountOpen: (open: boolean) => void;
  
  isSizeGuideOpen: boolean;
  setIsSizeGuideOpen: (open: boolean) => void;
  
  isCMSOpen: boolean;
  setIsCMSOpen: (open: boolean) => void;

  isPolicyOpen: boolean;
  policyType: string;
  openPolicy: (type: string) => void;
  closePolicy: () => void;
  
  currency: Currency;
  setCurrency: (c: Currency) => void;
  formatPrice: (amountInINR: number) => string;
  
  // Customer Orders
  orders: Order[];
  addOrder: (order: Order) => void;
  // Selected order for detail view
  selectedOrder: Order | null;
  setSelectedOrder: (order: Order | null) => void;
  
  // Toasts
  toasts: ToastState[];
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;
  
  // CMS Config
  cmsConfig: CMSConfig;
  updateCMSConfig: (newConfig: Partial<CMSConfig>) => void;
  
  // Quick Category Filter Helper
  activeCategoryFilter: string;
  setActiveCategoryFilter: (category: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const CURRENCY_RATES = {
  INR: { rate: 1, symbol: '₹', code: 'INR' },
  USD: { rate: 0.012, symbol: '$', code: 'USD' },
  EUR: { rate: 0.011, symbol: '€', code: 'EUR' }
};

/** Generate a signature of INITIAL_PRODUCTS so any code edits automatically invalidate stale localStorage cache */
function getProductsSignature(): string {
  return INITIAL_PRODUCTS.map(
    (p) => `${p.id}_${p.name}_${p.price}_${p.images?.[0] || ''}_${p.variants?.length || 0}_${p.category || ''}`
  ).join('::');
}

function loadCatalogProducts(): Product[] {
  const codeSignature = getProductsSignature();
  const storedSignature = localStorage.getItem('kl_catalog_signature');
  const saved = localStorage.getItem('kl_products');

  if (!saved || storedSignature !== codeSignature) {
    localStorage.setItem('kl_catalog_signature', codeSignature);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Product[];
        // Preserve any custom products added dynamically via admin that aren't in INITIAL_PRODUCTS
        const customProducts = parsed.filter(p => !INITIAL_PRODUCTS.some(ip => ip.id === p.id));
        const merged = [...INITIAL_PRODUCTS, ...customProducts];
        localStorage.setItem('kl_products', JSON.stringify(merged));
        return merged;
      } catch {
        // fallback to initial
      }
    }
    localStorage.setItem('kl_products', JSON.stringify(INITIAL_PRODUCTS));
    return INITIAL_PRODUCTS;
  }

  try {
    const parsed = JSON.parse(saved) as Product[];
    // Ensure newly added items in INITIAL_PRODUCTS are included
    const parsedIds = new Set(parsed.map(p => p.id));
    let hasNew = false;
    for (const ip of INITIAL_PRODUCTS) {
      if (!parsedIds.has(ip.id)) {
        parsed.push(ip);
        hasNew = true;
      }
    }
    if (hasNew) {
      localStorage.setItem('kl_products', JSON.stringify(parsed));
    }
    return parsed;
  } catch {
    return INITIAL_PRODUCTS;
  }
}

function loadCMSConfig(): CMSConfig {
  const codeSignature = JSON.stringify(DEFAULT_CMS_CONFIG);
  const storedSignature = localStorage.getItem('kl_cms_signature');
  const saved = localStorage.getItem('kl_cms_config');

  if (!saved || storedSignature !== codeSignature) {
    localStorage.setItem('kl_cms_signature', codeSignature);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Partial<CMSConfig>;
        const merged = { ...DEFAULT_CMS_CONFIG, ...parsed };
        localStorage.setItem('kl_cms_config', JSON.stringify(merged));
        return merged;
      } catch {
        // fallback to default
      }
    }
    localStorage.setItem('kl_cms_config', JSON.stringify(DEFAULT_CMS_CONFIG));
    return DEFAULT_CMS_CONFIG;
  }

  try {
    return { ...DEFAULT_CMS_CONFIG, ...JSON.parse(saved) };
  } catch {
    return DEFAULT_CMS_CONFIG;
  }
}

function refreshCartProductPrices(items: CartItem[]): CartItem[] {
  return items.map((item) => {
    const fresh = INITIAL_PRODUCTS.find((p) => p.id === item.product.id);
    return fresh ? { ...item, product: fresh } : item;
  });
}

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(loadCatalogProducts);
  const [isFirestoreReady, setIsFirestoreReady] = useState(false);

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('kl_cart');
    if (!saved) return [];
    try {
      return refreshCartProductPrices(JSON.parse(saved) as CartItem[]);
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('kl_wishlist');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      // Clean up legacy hardcoded demo wishlist ['kl-001', 'kl-004']
      if (Array.isArray(parsed)) {
        if (parsed.length === 2 && parsed.includes('kl-001') && parsed.includes('kl-004')) {
          localStorage.setItem('kl_wishlist', JSON.stringify([]));
          return [];
        }
        return parsed;
      }
      return [];
    } catch {
      return [];
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('kl_orders');
    return saved ? JSON.parse(saved) : [
      {
        id: 'KL-ORD-8921',
        date: '2026-09-12',
        items: [
          {
            productName: 'The Atelier Double-Breasted Silk Coat',
            variantName: 'Warm Ivory',
            size: 'S',
            quantity: 1,
            price: 9500,
            image: '/assets/images/hero_campaign_1.jpg'
          }
        ],
        totalAmount: 9500,
        currency: 'INR',
        status: 'Delivered',
        shippingAddress: {
          fullName: 'Kaytlyn Leonor Customer',
          addressLine: 'Suite 402, Taj Lands End Crescent',
          city: 'Mumbai',
          postalCode: '400050',
          country: 'India'
        },
        paymentMethod: 'UPI Express',
        trackingNumber: 'KL-IN-98218391'
      }
    ];
  });

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [activeView, setActiveViewState] = useState<string>(() => {
    // Keep admin panel across hard refreshes
    const adminPersisted = localStorage.getItem('kl_admin_view');
    if (adminPersisted === 'cms') return 'cms';
    const savedView = sessionStorage.getItem('kl_active_view') || 'home';
    return savedView === 'auth' ? 'home' : savedView;
  });
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [productReturnView, setProductReturnView] = useState<string>(() => sessionStorage.getItem('kl_product_return_view') || 'shop');
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>(() => sessionStorage.getItem('kl_active_category') || 'ALL');

  const clearProductFromUrl = useCallback(() => {
    try {
      const url = new URL(window.location.href);
      if (!url.searchParams.has('product')) return;
      url.searchParams.delete('product');
      window.history.replaceState(null, '', url.pathname + (url.search ? url.search : ''));
    } catch (_) {
      // ignore malformed URLs in non-browser environments
    }
  }, []);

  const setActiveView = useCallback(
    (view: string) => {
      if (view !== 'product') {
        setSelectedProductId(null);
        clearProductFromUrl();
      }
      setActiveViewState(view);
    },
    [clearProductFromUrl]
  );

  const navigateFromNavbar = useCallback(
    (view: string, category: string = 'ALL') => {
      sessionStorage.removeItem('kl_product_return_view');
      sessionStorage.removeItem('kl_product_return_scroll_y');
      setActiveCategoryFilter(category);
      setActiveView(view);
    },
    [setActiveView]
  );

  // Drawers
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [isAccountOpen, setIsAccountOpen] = useState<boolean>(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState<boolean>(false);
  const [isCMSOpen, setIsCMSOpen] = useState<boolean>(false);
  const [isPolicyOpen, setIsPolicyOpen] = useState<boolean>(false);
  const [policyType, setPolicyType] = useState<string>('privacy');

  const [currency, setCurrency] = useState<Currency>('INR');
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const [cmsConfig, setCmsConfig] = useState<CMSConfig>(loadCMSConfig);

  // Save to LocalStorage
  useEffect(() => {
    sessionStorage.setItem('kl_active_view', activeView);
    // Persist admin view across hard refreshes
    if (activeView === 'cms') {
      localStorage.setItem('kl_admin_view', 'cms');
    } else {
      localStorage.removeItem('kl_admin_view');
    }
  }, [activeView]);

  useEffect(() => {
    sessionStorage.setItem('kl_active_category', activeCategoryFilter);
  }, [activeCategoryFilter]);

  useEffect(() => {
    localStorage.setItem('kl_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('kl_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('kl_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('kl_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('kl_cms_config', JSON.stringify(cmsConfig));
  }, [cmsConfig]);

  // ── Firestore Sync ──
  // 1. Live sync: products collection → products state (single source of truth)
  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('name'));
    const unsub = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        const fetched = snap.docs.map(d => ({ ...d.data(), _docId: d.id } as any as Product));
        setProducts(fetched);
      }
      setIsFirestoreReady(true);
    }, (err) => {
      console.warn('Firestore products sync error:', err);
      setIsFirestoreReady(true);
    });
    return unsub;
  }, []);

  // 2. Live sync: store/cms → cmsConfig state (so admin changes propagate to all users)
  useEffect(() => {
    const cmsRef = doc(db, 'store', 'cms');
    const unsub = onSnapshot(cmsRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data && Object.keys(data).length > 0) {
          setCmsConfig((prev) => ({ ...prev, ...data }));
        }
      }
    }, (err) => {
      console.warn('Firestore CMS sync error:', err);
    });
    return unsub;
  }, []);

  // Sync user-specific data (cart, wishlist, orders) to Firestore when authenticated
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!user || !isFirestoreReady) return;
      const uid = user.uid;
      const userRef = doc(db, 'users', uid);
      const unsubSnap = onSnapshot(userRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data.cart && Array.isArray(data.cart)) setCart(refreshCartProductPrices(data.cart as CartItem[]));
          if (data.wishlist && Array.isArray(data.wishlist)) {
            if (data.wishlist.length === 2 && data.wishlist.includes('kl-001') && data.wishlist.includes('kl-004')) {
              setWishlist([]);
            } else {
              setWishlist(data.wishlist as string[]);
            }
          }
          if (data.orders && Array.isArray(data.orders)) setOrders(data.orders as Order[]);
        }
      }, (err) => console.warn('Firestore user sync error:', err));
      return () => unsubSnap();
    });
    return () => unsubAuth();
  }, [isFirestoreReady]);

  // Push user changes back to Firestore
  useEffect(() => {
    const user = auth.currentUser;
    if (!user || !isFirestoreReady) return;
    const uid = user.uid;
    const save = async () => {
      try {
        await setDoc(doc(db, 'users', uid), {
          cart,
          wishlist,
          orders,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      } catch (err) {
        console.warn('Failed to sync to Firestore:', err);
      }
    };
    // Debounce saves
    const timer = setTimeout(save, 500);
    return () => clearTimeout(timer);
  }, [cart, wishlist, orders, isFirestoreReady]);

  // Push CMS config to Firestore (admin-managed)
  useEffect(() => {
    if (!isFirestoreReady) return;
    const save = async () => {
      try {
        await setDoc(doc(db, 'store', 'cms'), cmsConfig, { merge: true });
      } catch (err) {
        console.warn('Failed to sync CMS config:', err);
      }
    };
    const timer = setTimeout(save, 500);
    return () => clearTimeout(timer);
  }, [cmsConfig, isFirestoreReady]);

  // Scroll to top on view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeView]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addToCart = (
    product: Product, 
    selectedVariant: ProductVariant, 
    selectedSize: string, 
    quantity: number = 1
  ) => {
    const itemId = `${product.id}-${selectedVariant.id}-${selectedSize}`;
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.id === itemId);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [...prevCart, { id: itemId, product, selectedVariant, selectedSize, quantity }];
    });
    showToast(`Added "${product.name}" (${selectedVariant.name}, ${selectedSize}) to Bag`);
    setIsCartOpen(true);
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
    showToast('Item removed from shopping bag', 'info');
  };

  const updateCartQty = (cartItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === cartItemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const toggleWishlist = (productId: string) => {
    const exists = wishlist.includes(productId);
    const targetProduct = products.find((p) => p.id === productId);
    const productName = targetProduct ? targetProduct.name : 'Item';
    if (exists) {
      showToast(`Removed "${productName}" from Wishlist`, 'info');
      setWishlist((prev) => prev.filter((id) => id !== productId));
    } else {
      showToast(`Saved "${productName}" to Wishlist`, 'success');
      setWishlist((prev) => [...prev, productId]);
    }
  };

  // Handle deep-linking to shared products via ?product=ID (initial load only)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const sharedProdId = params.get('product');
      if (sharedProdId) {
        const found = products.find(p => p.id === sharedProdId);
        if (found) {
          if (!sessionStorage.getItem('kl_product_return_view')) {
            const savedView = sessionStorage.getItem('kl_active_view') || 'shop';
            const returnView =
              savedView === 'product' || savedView === 'auth' ? 'shop' : savedView;
            setProductReturnView(returnView);
            sessionStorage.setItem('kl_product_return_view', returnView);
          }
          setSelectedProductId(sharedProdId);
          setActiveViewState('product');
        }
      }
    } catch (e) {
      console.error('Error parsing product URL param', e);
    }
  }, [products]);

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  const openProductDetail = (productId: string) => {
    if (activeView !== 'product') {
      setProductReturnView(activeView);
      sessionStorage.setItem('kl_product_return_view', activeView);
      sessionStorage.setItem('kl_product_return_scroll_y', String(window.scrollY));
      window.scrollTo(0, 0);
    }
    setSelectedProductId(productId);
    setActiveView('product');
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('product', productId);
      window.history.replaceState(null, '', url.toString());
    } catch (_) {}
  };

  const closeProductDetail = () => {
    setSelectedProductId(null);
    setActiveView(productReturnView || 'shop');
    const returnScrollY = Number(sessionStorage.getItem('kl_product_return_scroll_y') || 0);
    sessionStorage.removeItem('kl_product_return_view');
    sessionStorage.removeItem('kl_product_return_scroll_y');
    sessionStorage.removeItem('kl_active_view');
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('product');
      window.history.replaceState(null, '', url.pathname + (url.search ? url.search : ''));
    } catch (_) {}
    window.requestAnimationFrame(() => window.scrollTo(0, returnScrollY));
  };

  const openArticle = (articleId: string) => {
    setSelectedArticleId(articleId);
  };

  const closeArticle = () => {
    setSelectedArticleId(null);
  };

  const openPolicy = (type: string) => {
    setPolicyType(type);
    setIsPolicyOpen(true);
  };

  const closePolicy = () => {
    setIsPolicyOpen(false);
  };

  const formatPrice = (amountInINR: number): string => {
    const info = CURRENCY_RATES[currency];
    const converted = amountInINR * info.rate;
    if (currency === 'INR') {
      return `₹${Math.round(converted).toLocaleString('en-IN')}`;
    } else if (currency === 'USD') {
      return `$${converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
      return `€${converted.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  };

  const addOrder = (order: Order) => {
    setOrders((prev) => [order, ...prev]);
  };

  const updateCMSConfig = (newConfig: Partial<CMSConfig>) => {
    setCmsConfig((prev) => ({ ...prev, ...newConfig }));
    showToast('Brand CMS settings updated successfully', 'success');
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        setProducts,
        cart,
        addToCart,
        removeFromCart,
        updateCartQty,
        clearCart,
        cartCount,
        cartSubtotal,
        wishlist,
        toggleWishlist,
        isInWishlist,
        activeView,
        setActiveView,
        navigateFromNavbar,
        selectedProductId,
        openProductDetail,
        closeProductDetail,
        selectedArticleId,
        openArticle,
        closeArticle,
        isCartOpen,
        setIsCartOpen,
        isSearchOpen,
        setIsSearchOpen,
        isFilterOpen,
        setIsFilterOpen,
        isAccountOpen,
        setIsAccountOpen,
        isSizeGuideOpen,
        setIsSizeGuideOpen,
        isCMSOpen,
        setIsCMSOpen,
        isPolicyOpen,
        policyType,
        openPolicy,
        closePolicy,
        currency,
        setCurrency,
        formatPrice,
        orders,
        addOrder,
        // Order detail handling
        selectedOrder,
        setSelectedOrder,
        toasts,
        showToast,
        removeToast,
        cmsConfig,
        updateCMSConfig,
        activeCategoryFilter,
        setActiveCategoryFilter      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

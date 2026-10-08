import React from 'react';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from '../product/ProductCard';
import { Heart, ShoppingBag } from 'lucide-react';

export const WishlistView: React.FC = () => {
  const { wishlist, products, addToCart, toggleWishlist, formatPrice, setActiveView } = useStore();

  const wishlistedProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="py-16 md:py-24 px-6 lg:px-12 bg-[#F5F1EB] min-h-screen">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-[11px] font-sans uppercase tracking-[0.4em] text-[#A99684]">
            SAVED CREATIONS
          </span>
          <h1 className="font-serif text-3xl md:text-5xl tracking-[0.2em] uppercase font-light">
            YOUR WISHLIST ({wishlistedProducts.length})
          </h1>
          <p className="text-xs font-sans text-[#2C2925] tracking-wider font-light">
            Curate your personal collection of Kaytlyn Leonor pieces.
          </p>
        </div>

        {wishlistedProducts.length === 0 ? (
          <div className="py-20 text-center space-y-4 max-w-md mx-auto">
            <Heart size={48} className="mx-auto text-[#A99684]" strokeWidth={1} />
            <h3 className="font-serif text-2xl tracking-[0.15em] uppercase">YOUR WISHLIST IS EMPTY</h3>
            <p className="text-xs font-sans text-[#A99684] tracking-wider">
              As you explore our collections, save your favorite pieces to your wishlist by clicking the heart icon.
            </p>
            <button
              onClick={() => setActiveView('shop')}
              className="bg-[#11100E] text-[#F5F1EB] text-xs uppercase tracking-[0.25em] px-8 py-3 hover:bg-[#A99684] transition-colors mt-2"
            >
              DISCOVER COLLECTIONS
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlistedProducts.map((p) => (
              <div key={p.id} className="relative group flex flex-col justify-between">
                <ProductCard product={p} />
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => {
                      const defVariant = p.variants[0];
                      const defSize = p.sizes[0] || 'One Size';
                      addToCart(p, defVariant, defSize, 1);
                    }}
                    className="flex-1 bg-[#11100E] text-[#F5F1EB] py-2.5 text-[10px] uppercase tracking-[0.2em] font-sans hover:bg-[#A99684] transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ShoppingBag size={12} /> MOVE TO BAG
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

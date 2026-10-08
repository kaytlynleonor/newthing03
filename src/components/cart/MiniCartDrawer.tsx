import React from 'react';
import { useStore } from '../../context/StoreContext';
import { useRequireAuthCheckout } from '../../hooks/useRequireAuthCheckout';
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight, Shield } from 'lucide-react';

export const MiniCartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateCartQty,
    cartSubtotal,
    formatPrice,
    cmsConfig,
    setActiveView,
  } = useStore();
  const { goToCheckout } = useRequireAuthCheckout();

  if (!isCartOpen) return null;

  const threshold = cmsConfig.freeShippingThreshold || 5000;
  const progressPercent = Math.min((cartSubtotal / threshold) * 100, 100);
  const remainingForFreeShipping = Math.max(threshold - cartSubtotal, 0);

  const handleProceedToCheckout = () => {
    goToCheckout(() => setIsCartOpen(false));
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#11100E]/70 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-[#F5F1EB] text-[#11100E] h-full flex flex-col justify-between shadow-2xl border-l border-[#EEE8DF] animate-fade-in-scale relative">
        
        {/* Header */}
        <div className="p-6 border-b border-[#EEE8DF] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-[#11100E]" />
            <h3 className="font-serif text-xl tracking-[0.2em] font-light uppercase">
              YOUR SHOPPING BAG
            </h3>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1 text-[#11100E] hover:text-[#A99684] transition-colors"
            aria-label="Close cart"
          >
            <X size={22} />
          </button>
        </div>

        {/* Free Shipping Animated Progress Indicator */}
        <div className="bg-[#EEE8DF] px-6 py-3 border-b border-[#D8C8B7]/60">
          <div className="flex items-center justify-between text-[11px] font-sans uppercase tracking-wider mb-1.5 font-medium">
            {remainingForFreeShipping > 0 ? (
              <span>YOU'RE <strong className="text-[#11100E]">{formatPrice(remainingForFreeShipping)}</strong> AWAY FROM COMPLIMENTARY SHIPPING</span>
            ) : (
              <span className="text-[#11100E] font-semibold">✓ COMPLIMENTARY EXPRESS SHIPPING UNLOCKED</span>
            )}
          </div>
          <div className="w-full h-1.5 bg-[#D8C8B7]/50 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#11100E] transition-all duration-700 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Cart Product Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-[#A99684]">
              <ShoppingBag size={48} strokeWidth={1} />
              <h4 className="font-serif text-xl tracking-[0.15em] text-[#11100E] uppercase">
                YOUR BAG IS EMPTY
              </h4>
              <p className="text-xs font-sans tracking-wider max-w-xs">
                Explore our Signature apparel, Florentine leather handbags, and fine footwear.
              </p>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  setActiveView('shop');
                }}
                className="bg-[#11100E] text-[#F5F1EB] text-xs uppercase tracking-[0.25em] px-8 py-3 hover:bg-[#A99684] transition-colors mt-2"
              >
                EXPLORE COLLECTION
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 pb-6 border-b border-[#EEE8DF] items-start"
              >
                {/* Thumbnail */}
                <div className="w-20 h-24 bg-[#EEE8DF] shrink-0 overflow-hidden">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between h-full space-y-1">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className="font-serif text-sm font-semibold tracking-wider text-[#11100E] uppercase line-clamp-1">
                        {item.product.name}
                      </h4>
                      <span className="text-[10px] font-sans text-[#A99684] uppercase tracking-wider block">
                        {item.selectedVariant.name} • SIZE {item.selectedSize}
                      </span>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-[#A99684] hover:text-red-700 transition-colors p-1"
                      aria-label="Remove item"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    {/* Quantity Selector */}
                    <div className="flex items-center border border-[#A99684]/40 bg-white text-xs">
                      <button
                        onClick={() => updateCartQty(item.id, -1)}
                        className="px-2 py-1 text-[#11100E] hover:bg-[#EEE8DF]"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="px-3 py-1 font-sans font-medium text-[11px]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQty(item.id, 1)}
                        className="px-2 py-1 text-[#11100E] hover:bg-[#EEE8DF]"
                        aria-label="Increase quantity"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <span className="font-sans text-xs font-semibold text-[#11100E]">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Checkout Summary */}
        {cart.length > 0 && (
          <div className="p-6 bg-[#EEE8DF] border-t border-[#D8C8B7]/60 space-y-4">
            <div className="flex items-center justify-between text-xs font-sans uppercase tracking-wider font-light">
              <span>SUBTOTAL</span>
              <span className="text-base font-semibold text-[#11100E]">
                {formatPrice(cartSubtotal)}
              </span>
            </div>

            <p className="text-[10px] text-[#A99684] font-sans tracking-wider">
              Taxes and insured white-glove shipping calculated at checkout.
            </p>

            <button
              onClick={handleProceedToCheckout}
              className="w-full bg-[#11100E] text-[#F5F1EB] py-4 text-xs font-sans uppercase tracking-[0.3em] font-medium hover:bg-[#A99684] transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              <span>PROCEED TO CHECKOUT</span>
              <ArrowRight size={16} />
            </button>

            <div className="flex items-center justify-center gap-2 text-[10px] text-[#A99684] font-sans uppercase tracking-wider">
              <Shield size={12} /> 256-BIT ENCRYPTED LUXURY CHECKOUT
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

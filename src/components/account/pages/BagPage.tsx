import React from 'react';
import { useStore } from '../../../context/StoreContext';
import { useRequireAuthCheckout } from '../../../hooks/useRequireAuthCheckout';
import { AuthLayout } from './AuthLayout';
import { ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react';

export const BagPage: React.FC = () => {
  const {
    cart,
    removeFromCart,
    updateCartQty,
    cartSubtotal,
    formatPrice,
    setIsCartOpen,
  } = useStore();
  const { goToCheckout } = useRequireAuthCheckout();

  const handleCheckout = () => {
    goToCheckout(() => setIsCartOpen(false));
  };

  return (
    <AuthLayout title="Your Shopping Bag">
      {cart.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingBag size={48} className="mx-auto text-[#A99684]" strokeWidth={1} />
          <h2 className="font-serif text-3xl uppercase mt-4">Your Bag is Empty</h2>
        </div>
      ) : (
        <div className="space-y-6">
          {cart.map((item) => (
            <div key={item.id} className="flex items-center gap-4 border-b pb-4">
              <img src={item.product.images[0]} alt={item.product.name} className="w-16 h-16 object-cover" />
              <div className="flex-1">
                <h3 className="font-serif text-sm uppercase">{item.product.name}</h3>
                <p className="text-xs text-[#A99684]">{item.selectedVariant.name} – {item.selectedSize}</p>
                <p className="text-sm font-medium">{formatPrice(item.product.price * item.quantity)}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => updateCartQty(item.id, -1)} className="p-1">
                  <Minus size={16} />
                </button>
                <span className="px-2 text-sm">{item.quantity}</span>
                <button onClick={() => updateCartQty(item.id, 1)} className="p-1">
                  <Plus size={16} />
                </button>
                <button onClick={() => removeFromCart(item.id)} className="p-1 text-[#A99684]">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          <div className="flex justify-between items-center pt-4">
            <span className="font-serif text-lg">Subtotal</span>
            <span className="font-medium">{formatPrice(cartSubtotal)}</span>
          </div>
          <button
            onClick={handleCheckout}
            className="w-full bg-[#11100E] text-[#F5F1EB] py-3 uppercase tracking-[0.2em] hover:bg-[#A99684] transition-colors"
          >
            Proceed to Checkout
          </button>
        </div>
      )}
    </AuthLayout>
  );
};

import React, { useState } from 'react';
import { Product } from '../../types/ecommerce';
import { useStore } from '../../context/StoreContext';
import { Heart, ShoppingBag, Share2, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { openProductDetail, toggleWishlist, isInWishlist, formatPrice, addToCart } = useStore();
  const [isHovered, setIsHovered] = useState(false);
  const [copied, setCopied] = useState(false);

  const primaryImage = product.images[0] || '/assets/images/hero_campaign_1.jpg';
  const secondaryImage = product.images[1] || primaryImage;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    const defaultVariant = product.variants[0];
    const defaultSize = product.sizes[0] || 'One Size';
    addToCart(product, defaultVariant, defaultSize, 1);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const handleShareClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/?product=${product.id}`;
    const shareData = {
      title: `${product.name} | KAYTLYN LEONOR`,
      text: `Check out ${product.name} from KAYTLYN LEONOR (${formatPrice(product.price)})`,
      url: shareUrl
    };

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        // user closed native sheet
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const wishlisted = isInWishlist(product.id);

  return (
    <div
      onClick={() => openProductDetail(product.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group flex h-full cursor-pointer flex-col overflow-hidden border border-[#EEE8DF] bg-white transition-all duration-300 md:border-transparent md:bg-[#F5F1EB] md:p-2 md:hover:border-[#EEE8DF]"
    >
      {/* Image Container */}
      <div className="relative aspect-square w-full select-none overflow-hidden bg-[#EEE8DF] md:aspect-[3/4]">
        {/* Badges */}
        <div className="absolute left-2 top-2 z-10 flex flex-col items-start gap-1 md:left-3 md:top-3">
          {product.isNew && (
            <span className="bg-white/90 px-2 py-1 text-[9px] font-sans font-medium uppercase tracking-[0.15em] text-[#2C2925] md:bg-[#11100E] md:px-2.5 md:text-[#F5F1EB] md:tracking-[0.25em]">
              new
            </span>
          )}
          {product.isBestseller && (
            <span className="bg-[#A99684] px-2 py-1 text-[8px] font-sans font-medium uppercase tracking-[0.1em] text-white md:px-2.5 md:text-[9px] md:tracking-[0.25em]">
              SIGNATURE
            </span>
          )}
          {product.isLimitedEdition && (
            <span className="bg-[#2C2925] px-2 py-1 text-[8px] font-sans font-medium uppercase tracking-[0.1em] text-[#F5F1EB] md:px-2.5 md:text-[9px] md:tracking-[0.25em] shadow-sm">
              LIMITED EDITION
            </span>
          )}
        </div>

        {/* Top Right Action Buttons (Wishlist & Share) */}
        <div className="absolute right-3 top-3 z-10 flex flex-col gap-2">
          {/* Wishlist Icon Button */}
          <button
            onClick={handleWishlistClick}
            className={`w-9 h-9 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center transition-all duration-300 ${
              wishlisted
                ? 'text-red-700 opacity-100 scale-100'
                : 'text-[#11100E] opacity-90 md:opacity-0 md:group-hover:opacity-100 hover:scale-110'
            }`}
            aria-label="Wishlist"
            title={wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            <Heart size={16} fill={wishlisted ? 'currentColor' : 'none'} />
          </button>

          {/* Share Button */}
          <button
            onClick={handleShareClick}
            className={`w-9 h-9 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center transition-all duration-300 relative ${
              copied
                ? 'text-emerald-700 opacity-100 scale-105 bg-emerald-50'
                : 'text-[#11100E] opacity-90 md:opacity-0 md:group-hover:opacity-100 hover:scale-110'
            }`}
            title={copied ? 'Link Copied!' : 'Share with friends'}
            aria-label="Share"
          >
            {copied ? <Check size={15} className="text-emerald-600" /> : <Share2 size={15} />}
            {copied && (
              <span className="absolute -bottom-7 right-0 bg-[#11100E] text-[#F5F1EB] text-[9px] font-sans px-2 py-0.5 rounded shadow-lg whitespace-nowrap animate-fade-in">
                COPIED!
              </span>
            )}
          </button>
        </div>

        {/* Image — hover swaps to second image on desktop */}
        <img
          src={isHovered ? secondaryImage : primaryImage}
          alt={product.name}
          className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />

        {/* Quick Add Slide-up Action Button */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-[#11100E]/80 via-[#11100E]/40 to-transparent transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out hidden md:flex gap-2">
          <button
            onClick={handleQuickAdd}
            className="flex-1 bg-[#11100E] hover:bg-[#A99684] text-[#F5F1EB] py-2.5 text-[10px] uppercase tracking-[0.2em] font-sans transition-colors flex items-center justify-center gap-1.5 shadow-md"
          >
            <ShoppingBag size={13} /> QUICK ADD
          </button>
        </div>
      </div>

      {/* Product Details Section */}
      <div className="flex flex-grow flex-col justify-between px-2 pb-2 pt-2 md:px-1 md:pb-2 md:pt-4">
        <div>
          <div className="mb-1 flex items-center gap-1 text-[9px] font-sans text-[#A99684] md:hidden" aria-label={`Rated ${product.rating} out of 5, ${product.reviewCount} reviews`}>
            <span className="tracking-[0.05em] text-[#11100E]">{'★'.repeat(Math.round(product.rating))}</span>
            <span>({product.reviewCount})</span>
          </div>

          <div className="mb-1 hidden items-center justify-between text-[10px] font-sans uppercase tracking-[0.2em] text-[#A99684] md:flex">
            <span>{product.category}</span>
            {product.rating > 0 && <span>★ {product.rating.toFixed(1)}</span>}
          </div>

          <h3 className="line-clamp-2 font-sans text-[11px] font-medium normal-case leading-tight text-[#11100E] transition-colors group-hover:text-[#A99684] md:line-clamp-1 md:font-serif md:text-lg md:font-normal md:uppercase md:tracking-[0.08em]">
            {product.name}
          </h3>

          <p className="mt-0.5 line-clamp-1 text-[10px] font-sans tracking-wide text-[#A99684] md:text-[11px] md:tracking-wider">
            {product.subtitle}
          </p>
        </div>

        <div className="mt-2 border-t border-[#EEE8DF]/80 pt-2 md:mt-3">
          <button
            type="button"
            onClick={handleQuickAdd}
            className="w-full border border-[#A99684]/70 bg-white px-1.5 py-2 text-[10px] font-sans lowercase tracking-wide text-[#2C2925] transition-colors hover:bg-[#11100E] hover:text-white md:hidden"
          >
            add to cart - {formatPrice(product.price)}
          </button>

          <div className="hidden items-center justify-between md:flex">
            <div className="flex items-center gap-2">
              <span className="font-sans text-xs font-semibold tracking-wider text-[#11100E] md:text-sm">
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice && (
                <span className="font-sans text-[11px] line-through text-[#A99684]">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>

            {/* Variant Color Swatch Dots */}
            {product.variants.length > 0 && (
              <div className="flex items-center gap-1">
                {product.variants.slice(0, 3).map((v) => (
                  <span
                    key={v.id}
                    className="w-2.5 h-2.5 rounded-full border border-black/20"
                    style={{ backgroundColor: v.colorHex || '#11100E' }}
                    title={v.name}
                  />
                ))}
                {product.variants.length > 3 && (
                  <span className="text-[9px] text-[#A99684] font-sans">
                    +{product.variants.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

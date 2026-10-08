import React, { useRef, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { ProductVariant } from '../../types/ecommerce';
import { X, ArrowLeft, Heart, ShoppingBag, Truck, RotateCcw, ChevronDown, ChevronUp, Check, Star, ShieldCheck, Share2, Copy, MessageCircle } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { useRequireAuthCheckout } from '../../hooks/useRequireAuthCheckout';
import { doc, updateDoc, increment, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export const ProductDetailModal: React.FC = () => {
  const {
    products,
    selectedProductId,
    closeProductDetail,
    addToCart,
    toggleWishlist,
    isInWishlist,
    formatPrice,
    setIsSizeGuideOpen,
  } = useStore();
  const { goToCheckout } = useRequireAuthCheckout();

  const product = selectedProductId ? products.find((p) => p.id === selectedProductId) : null;

  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [isZoomOpen, setIsZoomOpen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const recommendationsRef = useRef<HTMLDivElement>(null);
  const [activeRecommendation, setActiveRecommendation] = useState(0);

  // Accordion state
  const [openAccordion, setOpenAccordion] = useState<string | null>('details');

  // Initialize selected variant and size on product load
  React.useEffect(() => {
    if (product) {
      setSelectedVariant(product.variants[0] || null);
      setSelectedSize(product.sizes[0] || 'One Size');
      setSelectedImageIndex(0);
      setQuantity(1);
    }
  }, [product]);

  // Track product view — fire-and-forget, never blocks UI
  React.useEffect(() => {
    if (!product) return;
    (async () => {
      try {
        // Find the Firestore doc by product id field
        const q = query(collection(db, 'products'), where('id', '==', product.id));
        const snap = await getDocs(q);
        if (!snap.empty) {
          await updateDoc(snap.docs[0].ref, { viewCount: increment(1) });
        }
      } catch { /* silently ignore — offline / permissions */ }
    })();
  }, [product?.id]);

  if (!product || !selectedVariant) return null;

  const currentImage = product.images[selectedImageIndex] || product.images[0];
  const wishlisted = isInWishlist(product.id);
  const sameCategoryProducts = products.filter((candidate) =>
    candidate.id !== product.id &&
    (candidate.category === product.category || candidate.collection === product.collection)
  );
  const sameCategoryProductIds = new Set(sameCategoryProducts.map((candidate) => candidate.id));
  const recommendedProducts = [
    ...sameCategoryProducts,
    ...products.filter((candidate) => candidate.id !== product.id && !sameCategoryProductIds.has(candidate.id))
  ].slice(0, 8);

  const handleAddToCart = () => {
    addToCart(product, selectedVariant, selectedSize, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedVariant, selectedSize, quantity);
    goToCheckout(() => closeProductDetail());
  };

  const getProductShareUrl = () => {
    return `${window.location.origin}/?product=${product.id}`;
  };

  const handleNativeShare = async () => {
    const shareUrl = getProductShareUrl();
    const shareData = {
      title: `${product.name} | KAYTLYN LEONOR`,
      text: `Look at this luxury piece from KAYTLYN LEONOR: ${product.name} (${formatPrice(product.price)})`,
      url: shareUrl
    };

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        // user closed native share sheet
      }
    }

    handleCopyLink();
  };

  const handleWhatsAppShare = () => {
    const shareUrl = getProductShareUrl();
    const message = encodeURIComponent(`Look at this luxury piece from KAYTLYN LEONOR: *${product.name}* (${formatPrice(product.price)})\n${shareUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${message}`, '_blank');
  };

  const handleCopyLink = () => {
    const shareUrl = getProductShareUrl();
    try {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const toggleAccordionSection = (key: string) => {
    setOpenAccordion(openAccordion === key ? null : key);
  };

  return (
    <div className="min-h-screen bg-[#F5F1EB] px-4 pb-28 pt-6 text-[#11100E] md:px-12 md:py-10">
      <div className="relative mx-auto w-full max-w-7xl">
        
        {/* Return to the page the product was opened from */}
        <button
          onClick={closeProductDetail}
          className="mb-6 inline-flex items-center gap-2 border border-[#A99684]/40 px-4 py-2.5 text-[10px] font-sans uppercase tracking-[0.2em] text-[#11100E] transition-colors hover:bg-[#11100E] hover:text-[#F5F1EB]"
          aria-label="Back to previous page"
        >
          <ArrowLeft size={16} /> BACK
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 p-6 md:p-12">
          
          {/* LEFT: Image Gallery Component */}
          <div className="lg:col-span-7 space-y-4">
            {/* Main Stage Image */}
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#EEE8DF] group">
              <div className="absolute left-3 top-3 z-10 flex flex-col items-start gap-1">
                {product.isNew && (
                  <span className="bg-[#11100E] px-2.5 py-1 text-[9px] font-sans font-medium uppercase tracking-[0.25em] text-[#F5F1EB]">
                    NEW
                  </span>
                )}
                {product.isBestseller && (
                  <span className="bg-[#A99684] px-2.5 py-1 text-[9px] font-sans font-medium uppercase tracking-[0.25em] text-white">
                    SIGNATURE
                  </span>
                )}
                {product.isLimitedEdition && (
                  <span className="bg-[#2C2925] px-2.5 py-1 text-[9px] font-sans font-medium uppercase tracking-[0.25em] text-[#F5F1EB] shadow-sm">
                    LIMITED EDITION
                  </span>
                )}
              </div>
              <img
                src={currentImage}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            {/* Thumbnail Selectors */}
            {product.images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-20 h-24 shrink-0 overflow-hidden border-2 transition-all ${
                      selectedImageIndex === idx ? 'border-[#11100E] scale-95' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Product Information & Purchase Controls */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-0">
            
            {/* Category & Rating */}
            <div className="flex items-center justify-between text-[11px] font-sans uppercase tracking-[0.25em] text-[#A99684]">
              <span>{product.category} • {product.collection}</span>
              <span className="flex items-center gap-1 font-semibold text-[#11100E]">
                <Star size={13} className="fill-amber-500 text-amber-500" /> {product.rating} ({product.reviewCount})
              </span>
            </div>

            {/* Product Title */}
            <div>
              <h1 className="font-serif text-2xl md:text-4xl tracking-[0.1em] uppercase text-[#11100E] font-light leading-tight">
                {product.name}
              </h1>
              <p className="text-xs font-sans text-[#A99684] tracking-widest mt-1">
                {product.subtitle} • SKU: {product.sku}
              </p>
            </div>

            {/* Pricing */}
            <div className="flex items-baseline gap-3 pt-1 border-t border-[#EEE8DF]">
              <span className="font-sans text-xl md:text-2xl font-bold tracking-wider text-[#11100E]">
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice && (
                <span className="font-sans text-sm line-through text-[#A99684]">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
              <span className="text-[10px] text-[#A99684] uppercase tracking-wider ml-auto">
                TAX INCLUDED
              </span>
            </div>

            {/* Short Description */}
            <p className="text-xs font-sans text-[#2C2925] tracking-wider leading-relaxed font-light">
              {product.shortDescription}
            </p>

            {/* Color/Variant Swatches */}
            {product.variants.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs font-sans tracking-wider uppercase">
                  <span className="text-[#A99684]">COLOR VARIANT:</span>
                  <span className="font-bold text-[#11100E]">{selectedVariant.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={`relative w-8 h-8 rounded-full border-2 transition-all ${
                        selectedVariant.id === v.id ? 'border-[#11100E] scale-110 shadow-sm' : 'border-black/20 hover:scale-105'
                      }`}
                      style={{ backgroundColor: v.colorHex || '#11100E' }}
                      title={v.name}
                    >
                      {selectedVariant.id === v.id && (
                        <span className="absolute inset-0 flex items-center justify-center text-white text-[10px]">
                          ✓
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector + Size Guide Modal Trigger */}
            {product.sizes.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center text-xs font-sans tracking-wider uppercase">
                  <span className="text-[#A99684]">SELECT SIZE:</span>
                  <button
                    onClick={() => setIsSizeGuideOpen(true)}
                    className="text-[11px] underline text-[#11100E] hover:text-[#A99684] transition-colors"
                  >
                    SIZE GUIDE
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`px-4 py-2.5 text-xs font-sans uppercase tracking-wider border transition-all ${
                        selectedSize === sz
                          ? 'border-[#11100E] bg-[#11100E] text-[#F5F1EB]'
                          : 'border-[#A99684]/40 bg-white text-[#11100E] hover:border-[#11100E]'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Counter */}
            <div className="hidden items-center gap-4 pt-2 md:flex">
              <span className="text-xs font-sans text-[#A99684] uppercase tracking-wider">QUANTITY:</span>
              <div className="flex items-center border border-[#A99684]/40 bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1.5 text-xs hover:bg-[#EEE8DF]"
                >
                  -
                </button>
                <span className="px-4 py-1.5 font-sans font-medium text-xs">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1.5 text-xs hover:bg-[#EEE8DF]"
                >
                  +
                </button>
              </div>
            </div>

            {/* Main Action Buttons */}
            <div className="space-y-3 pt-4">
              <div className="hidden gap-3 md:flex">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-[#11100E] text-[#F5F1EB] py-4 text-xs font-sans uppercase tracking-[0.25em] font-medium hover:bg-[#A99684] transition-colors flex items-center justify-center gap-2 shadow-lg"
                >
                  <ShoppingBag size={16} /> ADD TO BAG
                </button>
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`w-14 border border-[#11100E] flex items-center justify-center transition-colors ${
                    wishlisted ? 'bg-red-700 text-white border-red-700' : 'hover:bg-[#11100E] hover:text-white'
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart size={18} fill={wishlisted ? 'currentColor' : 'none'} />
                </button>
              </div>

              <button
                onClick={handleBuyNow}
                className="w-full bg-[#EEE8DF] border border-[#11100E] text-[#11100E] py-3.5 text-xs font-sans uppercase tracking-[0.25em] font-semibold hover:bg-[#11100E] hover:text-[#F5F1EB] transition-colors"
              >
                EXPRESS BUY NOW
              </button>

              {/* Share With Friends Bar */}
              <div className="pt-2">
                <div className="p-3.5 bg-[#EEE8DF]/40 border border-[#EEE8DF] rounded-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-sans uppercase tracking-[0.25em] text-[#A99684] font-semibold flex items-center gap-1.5">
                      <Share2 size={12} /> SHARE WITH FRIENDS
                    </span>
                    {copied && (
                      <span className="text-[10px] text-emerald-700 font-sans tracking-wider animate-fade-in flex items-center gap-1 font-medium">
                        <Check size={11} /> LINK COPIED!
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <button
                      onClick={handleNativeShare}
                      className="py-2.5 px-2 bg-white border border-[#EEE8DF] hover:border-[#11100E] text-[#11100E] text-[10px] font-sans uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                      title="Share using your device apps"
                    >
                      <Share2 size={12} /> SHARE
                    </button>
                    
                    <button
                      onClick={handleWhatsAppShare}
                      className="py-2.5 px-2 bg-white border border-[#EEE8DF] hover:border-emerald-600 hover:text-emerald-700 text-[#11100E] text-[10px] font-sans uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                      title="Share directly on WhatsApp"
                    >
                      <MessageCircle size={12} className="text-emerald-600" /> WHATSAPP
                    </button>

                    <button
                      onClick={handleCopyLink}
                      className={`py-2.5 px-2 border text-[10px] font-sans uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors shadow-xs ${
                        copied 
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-700 font-semibold' 
                          : 'bg-white border-[#EEE8DF] hover:border-[#11100E] text-[#11100E]'
                      }`}
                      title="Copy product link to clipboard"
                    >
                      {copied ? <Check size={12} /> : <Copy size={12} />}
                      {copied ? 'COPIED' : 'COPY LINK'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Accordion Details */}
            <div className="pt-6 border-t border-[#EEE8DF] space-y-3 text-xs font-sans">
              
              {/* Details Accordion */}
              <div className="border-b border-[#EEE8DF] pb-3">
                <button
                  onClick={() => toggleAccordionSection('details')}
                  className="w-full flex items-center justify-between text-left font-serif uppercase tracking-wider text-sm font-medium"
                >
                  <span>PRODUCT DETAILS & CRAFT</span>
                  {openAccordion === 'details' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {openAccordion === 'details' && (
                  <div className="mt-3 space-y-2 text-[#2C2925] tracking-wider leading-relaxed animate-fade-up">
                    <p>{product.description}</p>
                    <ul className="list-disc pl-4 space-y-1 pt-1">
                      {product.details.map((dt, idx) => (
                        <li key={idx}>{dt}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Materials Accordion */}
              <div className="border-b border-[#EEE8DF] pb-3">
                <button
                  onClick={() => toggleAccordionSection('materials')}
                  className="w-full flex items-center justify-between text-left font-serif uppercase tracking-wider text-sm font-medium"
                >
                  <span>COMPOSITION & CARE</span>
                  {openAccordion === 'materials' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {openAccordion === 'materials' && (
                  <div className="mt-3 space-y-2 text-[#2C2925] tracking-wider leading-relaxed animate-fade-up">
                    <p><strong>Composition:</strong> {product.materials}</p>
                    <p><strong>Care Instructions:</strong> {product.careInstructions}</p>
                  </div>
                )}
              </div>

              {/* Shipping Accordion */}
              <div className="border-b border-[#EEE8DF] pb-3">
                <button
                  onClick={() => toggleAccordionSection('shipping')}
                  className="w-full flex items-center justify-between text-left font-serif uppercase tracking-wider text-sm font-medium"
                >
                  <span>COMPLIMENTARY SHIPPING & RETURNS</span>
                  {openAccordion === 'shipping' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {openAccordion === 'shipping' && (
                  <div className="mt-3 space-y-2 text-[#2C2925] tracking-wider leading-relaxed animate-fade-up">
                    <p className="flex items-center gap-2"><Truck size={14} className="text-[#A99684]" /> {product.shippingInfo}</p>
                    <p className="flex items-center gap-2"><RotateCcw size={14} className="text-[#A99684]" /> 14-day white-glove returns and exchanges.</p>
                  </div>
                )}
              </div>

              {/* Customer Reviews Accordion */}
              <div className="pb-3">
                <button
                  onClick={() => toggleAccordionSection('reviews')}
                  className="w-full flex items-center justify-between text-left font-serif uppercase tracking-wider text-sm font-medium"
                >
                  <span>VERIFIED CLIENT REVIEWS ({product.reviewCount})</span>
                  {openAccordion === 'reviews' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {openAccordion === 'reviews' && (
                  <div className="mt-3 space-y-3 animate-fade-up">
                    {product.reviews && product.reviews.length > 0 ? (
                      product.reviews.map((rev) => (
                        <div key={rev.id} className="p-3 bg-white border border-[#EEE8DF] space-y-1">
                          <div className="flex justify-between text-[11px] font-sans">
                            <span className="font-semibold text-[#11100E] flex items-center gap-1">
                              {rev.userName} <Check size={12} className="text-emerald-700" />
                            </span>
                            <span className="text-[#A99684]">{rev.date}</span>
                          </div>
                          <div className="text-amber-500 text-xs">{"★".repeat(rev.rating)}</div>
                          <p className="text-xs text-[#2C2925] font-light leading-relaxed">{rev.comment}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-[#A99684]">Be the first to leave a review for this piece.</p>
                    )}
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>

      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#EEE8DF] bg-[#F5F1EB]/95 px-3 py-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] shadow-[0_-4px_16px_rgba(17,16,14,0.08)] backdrop-blur-md md:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-2">
          <div className="flex h-11 shrink-0 items-center border border-[#A99684]/50 bg-white">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="h-full px-3 text-base text-[#11100E]"
              aria-label="Decrease quantity"
            >
              -
            </button>
            <span className="min-w-7 text-center text-xs font-medium">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="h-full px-3 text-base text-[#11100E]"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          <button
            type="button"
            onClick={handleAddToCart}
            className="flex h-11 min-w-0 flex-1 items-center justify-center gap-2 bg-[#11100E] px-3 text-[10px] font-sans font-medium uppercase tracking-[0.12em] text-[#F5F1EB]"
          >
            <ShoppingBag size={15} className="shrink-0" />
            <span className="truncate">ADD TO BAG</span>
            <span className="shrink-0">{formatPrice(product.price * quantity)}</span>
          </button>
        </div>
      </div>

      {recommendedProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-16 md:px-12">
          <div className="mb-6 text-center">
            <span className="text-[10px] font-sans uppercase tracking-[0.3em] text-[#A99684]">
              DISCOVER MORE
            </span>
            <h2 className="mt-1 font-serif text-2xl font-light uppercase tracking-[0.12em] text-[#11100E] md:text-3xl">
              YOU MAY ALSO LIKE
            </h2>
          </div>
          <div
            ref={recommendationsRef}
            onScroll={(event) => {
              const firstCard = event.currentTarget.firstElementChild as HTMLElement | null;
              if (firstCard) {
                const step = firstCard.getBoundingClientRect().width + 16;
                setActiveRecommendation(Math.min(Math.round(event.currentTarget.scrollLeft / step), recommendedProducts.length - 1));
              }
            }}
            className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3"
          >
            {recommendedProducts.map((recommendedProduct) => (
              <div key={recommendedProduct.id} className="w-[82vw] max-w-[360px] shrink-0 snap-start sm:w-[340px]">
                <ProductCard product={recommendedProduct} />
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-center gap-2" aria-label="Recommendation slides">
            {recommendedProducts.map((recommendedProduct, index) => (
              <button
                key={recommendedProduct.id}
                type="button"
                onClick={() => {
                  const card = recommendationsRef.current?.children.item(index) as HTMLElement | null;
                  card?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
                }}
                aria-label={`Show recommendation ${index + 1}`}
                aria-current={activeRecommendation === index ? 'true' : undefined}
                className={`h-2 w-2 rounded-full transition-colors ${
                  activeRecommendation === index ? 'bg-[#11100E]' : 'bg-[#A99684]/50'
                }`}
              />
            ))}
          </div>
        </section>
      )}

    </div>
  );
};

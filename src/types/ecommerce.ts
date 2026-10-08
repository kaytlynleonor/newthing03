export type CategoryType = 
  | 'NEW ARRIVALS'
  | 'SIGNATURE'
  | 'SHOES'
  | 'BAGS'
  | 'ACCESSORIES'
  | 'BEAUTY'
  | 'COLLECTIONS';

export interface ProductVariant {
  id: string;
  name: string;
  colorHex?: string;
  image?: string;
  stock: number;
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  subtitle: string;
  price: number; // In INR base
  compareAtPrice?: number;
  category: CategoryType;
  collection: string;
  images: string[];
  description: string;
  shortDescription: string;
  details: string[];
  materials: string;
  careInstructions: string;
  shippingInfo: string;
  variants: ProductVariant[];
  sizes: string[];
  sku: string;
  rating: number;
  reviewCount: number;
  /** Number of times the product page was viewed. */
  viewCount?: number;
  reviews?: Review[];
  isBestseller?: boolean;
  isNew?: boolean;
  isLimitedEdition?: boolean;
  tags: string[];
}

export interface CartItem {
  id: string;
  product: Product;
  selectedVariant: ProductVariant;
  selectedSize: string;
  quantity: number;
}

export type Currency = 'INR' | 'USD' | 'EUR';

export interface Order {
  id: string;
  date: string;
  items: {
    productName: string;
    variantName: string;
    size: string;
    quantity: number;
    price: number;
    image: string;
  }[];
  totalAmount: number;
  currency: Currency;
  status: 'Processing' | 'Shipped' | 'Delivered';
  shippingAddress: {
    fullName: string;
    addressLine: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  trackingNumber: string;
  /** Email used at checkout — used for guest order lookup */
  customerEmail?: string;
  /** ISO timestamp when order was moved to CMS trash */
  trashedAt?: string | null;
}

export interface JournalArticle {
  id: string;
  slug: string;
  title: string;
  category: 'Campaigns' | 'Fashion' | 'Beauty' | 'Stories' | 'Behind the Brand';
  readTime: string;
  date: string;
  image: string;
  excerpt: string;
  content: string[];
  quote?: string;
}

export interface FilterState {
  category: string;
  collection: string;
  minPrice: number;
  maxPrice: number;
  colors: string[];
  sizes: string[];
  inStockOnly: boolean;
  sortBy: 'featured' | 'newest' | 'price-low-high' | 'price-high-low' | 'bestsellers';
}

export interface CMSConfig {
  announcementMessage: string;
  announcementActive: boolean;
  heroHeadline: string;
  heroSubheadline: string;
  heroImage: string;
  heroCtaText: string;
  freeShippingThreshold: number; // in INR
}

export type MediaKind = 'image' | 'video';

export interface MediaAsset {
  id: string;
  url: string;
  name: string;
  kind: MediaKind;
  mimeType: string;
  size: number;
  createdAt?: unknown;
  /** Product IDs this asset was explicitly linked to from the media library */
  linkedProductIds?: string[];
}

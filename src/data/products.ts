import { Product } from '../types/ecommerce';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'kl-001',
    name: 'The Atelier Double-Breasted Silk Coat',
    slug: 'atelier-double-breasted-silk-coat',
    subtitle: 'Signature Couture Tailoring',
    price: 9500,
    compareAtPrice: 10000,
    category: 'NEW ARRIVALS',
    collection: 'Signature Collection',
    images: [
      '/assets/images/hero_campaign_1.jpg',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1200'
    ],
    description: 'Masterfully structured from 100% heavy mulberry silk crepe, the Atelier Double-Breasted Silk Coat embodies modern luxury. Featuring horn buttons, sharp peaked lapels, and a sweeping floor-length silhouette designed to command quiet elegance.',
    shortDescription: 'Double-breasted floor-length coat sculpted from 100% mulberry silk crepe.',
    details: [
      'Architectural peaked lapels',
      'Double-breasted horn button closure',
      'Fully lined in 100% cupro satin',
      'Deep welt side pockets & chest pocket',
      'Hand-finished hem stitch in Milan'
    ],
    materials: '100% Mulberry Silk Crepe (Outer), 100% Cupro Satin (Lining)',
    careInstructions: 'Dry clean only by luxury garment specialist. Cool iron on reverse with pressing cloth.',
    shippingInfo: 'Complimentary signature white glove delivery in India. International express shipping available.',
    variants: [
      { id: 'v-1-1', name: 'Warm Ivory', colorHex: '#F5F1EB', stock: 5 },
      { id: 'v-1-2', name: 'Midnight Onyx', colorHex: '#11100E', stock: 8 },
      { id: 'v-1-3', name: 'Soft Taupe', colorHex: '#A99684', stock: 3 }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    sku: 'KL-COAT-2026-01',
    rating: 4.9,
    reviewCount: 28,
    isBestseller: true,
    isNew: true,
    tags: ['Silk', 'Coat', 'Tailoring', 'Outerwear', 'Signature'],
    reviews: [
      {
        id: 'r-1',
        userName: 'Aria V.',
        rating: 5,
        date: '2026-08-14',
        comment: 'The drape and hand-feel of this silk coat are beyond compare. Truly feels like bespoke haute couture.',
        verified: true
      },
      {
        id: 'r-2',
        userName: 'Elena Rostova',
        rating: 5,
        date: '2026-09-02',
        comment: 'Subtle, commanding, immaculate craftsmanship. The warm ivory color catches the evening light beautifully.',
        verified: true
      }
    ]
  },
  {
    id: 'kl-002',
    name: 'Maison Sculpted Italian Leather Tote',
    slug: 'maison-sculpted-italian-leather-tote',
    subtitle: 'Hand-burnished Calfskin Leather',
    price: 8900,
    category: 'BAGS',
    collection: 'Maison Accessories',
    images: [
      '/assets/images/category_bags.jpg',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&q=80&w=1200'
    ],
    description: 'Crafted in Florence by third-generation leather artisans, the Maison Tote showcases smooth full-grain Italian calfskin with micro-foil gold branding. Architectural side gussets provide a pristine structural silhouette.',
    shortDescription: 'Minimalist Italian calfskin leather tote bag with gold-tone hardware.',
    details: [
      'Full-grain Italian calfskin leather',
      'Hand-painted edge finishing',
      'Interior magnetic clasp closure',
      'Removable zipped leather pouch included',
      'Protective metal feet at base'
    ],
    materials: '100% Italian Calfskin Leather, Suede Lining',
    careInstructions: 'Store in provided organic cotton dust bag. Avoid direct exposure to prolonged sunlight and water.',
    shippingInfo: 'Complimentary shipping across India within 2-4 business days.',
    variants: [
      { id: 'v-2-1', name: 'Warm Taupe', colorHex: '#A99684', stock: 12 },
      { id: 'v-2-2', name: 'Deep Ebony', colorHex: '#11100E', stock: 7 },
      { id: 'v-2-3', name: 'Champagne Nude', colorHex: '#D8C8B7', stock: 4 }
    ],
    sizes: ['One Size'],
    sku: 'KL-BAG-2026-02',
    rating: 5.0,
    reviewCount: 42,
    isBestseller: true,
    isNew: false,
    tags: ['Bag', 'Leather', 'Tote', 'Handbag', 'Bestseller']
  },
  {
    id: 'kl-003',
    name: 'Satin Pointed Ankle Stiletto Pumps',
    slug: 'satin-pointed-ankle-stiletto-pumps',
    subtitle: 'Evening Footwear Edition',
    price: 7500,
    compareAtPrice: 9000,
    category: 'SHOES',
    collection: 'Signature Collection',
    images: [
      '/assets/images/category_shoes.jpg',
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1596568359553-a56de6970068?auto=format&fit=crop&q=80&w=1200'
    ],
    description: 'Sculpted with a sharp pointed toe and 105mm stiletto heel, these Italian satin pumps feature an adjustable slim ankle strap fastened with a delicate champagne gold buckle.',
    shortDescription: '105mm luxury satin pointed pumps with ankle strap.',
    details: [
      '105mm (4.1 in) covered stiletto heel',
      'Lustrous Italian duchess satin upper',
      'Smooth leather lining and outsole',
      'Padded memory leather footbed for comfort',
      'Handcrafted in Riviera del Brenta, Italy'
    ],
    materials: 'Silk Satin Upper, 100% Calf Leather Sole',
    careInstructions: 'Treat satin gently. Spot clean with clean damp cloth.',
    shippingInfo: 'Includes signature presentation box and dust bags.',
    variants: [
      { id: 'v-3-1', name: 'Midnight Satin', colorHex: '#11100E', stock: 6 },
      { id: 'v-3-2', name: 'Nude Champagne', colorHex: '#D8C8B7', stock: 9 }
    ],
    sizes: ['EU 36', 'EU 37', 'EU 38', 'EU 39', 'EU 40'],
    sku: 'KL-SHOE-2026-03',
    rating: 4.8,
    reviewCount: 19,
    isBestseller: false,
    isNew: true,
    tags: ['Shoes', 'Heels', 'Satin', 'Stiletto', 'Evening']
  },
  {
    id: 'kl-004',
    name: 'Aurelia Eau de Parfum & Velvet Rouge Set',
    slug: 'aurelia-eau-de-parfum-velvet-rouge-set',
    subtitle: 'Maison Beauty Ritual',
    price: 4500,
    category: 'BEAUTY',
    collection: 'Modern Radiance Beauty',
    images: [
      '/assets/images/category_beauty.jpg',
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=1200'
    ],
    description: 'The definitive Kaytlyn Leonor scent paired with our signature velvet matte lipstick. Aurelia opens with notes of rare amber, damask rose, and powdery iris, settling into warm sandalwood.',
    shortDescription: '100ml Eau de Parfum accompanied by velvet matte lipstick in Shade 01 Leonor Crimson.',
    details: [
      '100ml / 3.4 fl. oz. Eau de Parfum in hand-cut glass bottle',
      'Signature heavy 24k gold-plated flacon top',
      'Matte velvet lipstick with hydrating hyaluronic spheres',
      'Cruelty-free & dermatologist tested formula',
      'Made in Grasse, France'
    ],
    materials: 'French Glass, Organic Botanical Essences, Hyaluronic Spheres',
    careInstructions: 'Store in cool dry environment away from heat.',
    shippingInfo: 'Delivered in luxury velvet gift casing with personalized card.',
    variants: [
      { id: 'v-4-1', name: 'Leonor Crimson', colorHex: '#8B0000', stock: 24 },
      { id: 'v-4-2', name: 'Nude Velvet', colorHex: '#C8B5A5', stock: 15 }
    ],
    sizes: ['100ml Set'],
    sku: 'KL-BEAUTY-2026-04',
    rating: 4.95,
    reviewCount: 56,
    isBestseller: true,
    isNew: true,
    tags: ['Beauty', 'Perfume', 'Lipstick', 'Fragrance', 'Gift Set']
  },
  {
    id: 'kl-005',
    name: 'The Backless Silk Evening Gown',
    slug: 'backless-silk-evening-gown',
    subtitle: 'Red Carpet & Campaign Edit',
    price: 9999,
    category: 'SIGNATURE',
    collection: 'Signature Collection',
    images: [
      '/assets/images/campaign_editorial_2.jpg',
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1200'
    ],
    description: 'A masterpiece of sensual minimalism. Cut on the bias from liquid silk charmeuse, this floor-sweeping gown features a dramatic plunge back, delicate shoulder straps, and a fluid pool train.',
    shortDescription: 'Bias-cut liquid silk charmeuse gown with plunge open back.',
    details: [
      '100% Heavyweight Silk Charmeuse',
      'Bias cut for fluid silhouette that skims curves',
      'Deep U-shaped open back',
      'Concealed invisible side zip',
      'Hand-rolled narrow hem'
    ],
    materials: '100% Silk Charmeuse',
    careInstructions: 'Specialist dry clean only.',
    shippingInfo: 'Delivered in archival garment bag with padded satin hanger.',
    variants: [
      { id: 'v-5-1', name: 'Noir Black', colorHex: '#11100E', stock: 4 },
      { id: 'v-5-2', name: 'Ivory Cream', colorHex: '#F5F1EB', stock: 2 }
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    sku: 'KL-GOWN-2026-05',
    rating: 5.0,
    reviewCount: 14,
    isBestseller: true,
    isNew: true,
    tags: ['Gown', 'Silk', 'Evening', 'Backless', 'Signature']
  },
  {
    id: 'kl-006',
    name: 'Maison Hammered Gold & Pearl Earrings',
    slug: 'maison-hammered-gold-pearl-earrings',
    subtitle: 'Fine Jewelry Fine Craft',
    price: 6500,
    category: 'ACCESSORIES',
    collection: 'Maison Accessories',
    images: [
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=1200'
    ],
    description: 'Sculptural drop earrings featuring 18k gold vermeil over recycled sterling silver, holding AAA baroque South Sea pearls. Each pearl possesses an individual, organic luster.',
    shortDescription: '18k gold vermeil drop earrings with natural South Sea baroque pearls.',
    details: [
      '18k Gold Vermeil (2.5 micron gold over 925 Sterling Silver)',
      'Hand-selected AAA South Sea Baroque Pearls',
      'Hypoallergenic post & butterfly back',
      'Hand-hammered organic finish',
      'Handcrafted in Jaipur'
    ],
    materials: '18k Gold Vermeil, 925 Sterling Silver, Baroque South Sea Pearls',
    careInstructions: 'Avoid contact with perfume, hairspray, and water. Store in anti-tarnish pouch.',
    shippingInfo: 'Ships in velvet presentation box with certificate of authenticity.',
    variants: [
      { id: 'v-6-1', name: 'Gold & Cream Pearl', colorHex: '#D8C8B7', stock: 10 }
    ],
    sizes: ['One Size'],
    sku: 'KL-JEWEL-2026-06',
    rating: 4.9,
    reviewCount: 31,
    isBestseller: false,
    isNew: false,
    tags: ['Jewelry', 'Earrings', 'Gold', 'Pearls', 'Accessories']
  },
  {
    id: 'kl-007',
    name: 'Cashmere & Silk Oversized Blazer',
    slug: 'cashmere-silk-oversized-blazer',
    subtitle: 'Contemporary Tailoring',
    price: 9200,
    category: 'COLLECTIONS',
    collection: 'Velvet Dusk',
    images: [
      'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1200'
    ],
    description: 'An effortless study in relaxed tailoring. Crafted from a blend of Grade-A Mongolian cashmere and fine silk, offering unparalleled softness and a structured shoulder silhouette.',
    shortDescription: 'Oversized tailored blazer in Grade-A cashmere and silk blend.',
    details: [
      '70% Grade-A Mongolian Cashmere, 30% Mulberry Silk',
      'Lightly padded structured shoulders',
      'Single button horn closure',
      'Dual back vents for movement',
      'Custom jacquard lining'
    ],
    materials: '70% Cashmere, 30% Silk',
    careInstructions: 'Dry clean only.',
    shippingInfo: 'Complimentary shipping across India.',
    variants: [
      { id: 'v-7-1', name: 'Oatmeal Beige', colorHex: '#EEE8DF', stock: 7 },
      { id: 'v-7-2', name: 'Deep Espresso', colorHex: '#2C1D18', stock: 5 }
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    sku: 'KL-BLAZER-2026-07',
    rating: 4.85,
    reviewCount: 16,
    isBestseller: false,
    isNew: true,
    tags: ['Blazer', 'Cashmere', 'Tailoring', 'Outerwear']
  },
  {
    id: 'kl-008',
    name: 'Luminous Glow Hydration Elixir',
    slug: 'luminous-glow-hydration-elixir',
    subtitle: 'Maison Skincare Essential',
    price: 3500,
    category: 'BEAUTY',
    collection: 'Modern Radiance Beauty',
    images: [
      encodeURI('/Heart Mirror Beauty Studio Scene.png'),
      'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&q=80&w=1200'
    ],
    description: 'A concentrated facial oil enriched with damask rose extract, bakuchiol, and botanical squalane. Restores lipid barrier function and illuminates skin with a natural glass-like glow.',
    shortDescription: '30ml potent facial oil with damask rose & natural bakuchiol.',
    details: [
      '30ml / 1 fl. oz. frosted glass bottle with dropper',
      'Formulated with 99.4% natural origin ingredients',
      'Improves skin elasticity and moisture retention',
      'Non-comedogenic, suitable for all skin types',
      'Formulated in Paris'
    ],
    materials: 'Botanical Oils, Damask Rose Extract, Squalane, Bakuchiol',
    careInstructions: 'Apply 2-3 drops to cleansed skin morning and night.',
    shippingInfo: 'Ships in eco-conscious luxury recyclable packaging.',
    variants: [
      { id: 'v-8-1', name: 'Original Glow Formula', colorHex: '#EEE8DF', stock: 30 }
    ],
    sizes: ['30ml'],
    sku: 'KL-BEAUTY-2026-08',
    rating: 4.92,
    reviewCount: 68,
    isBestseller: true,
    isNew: false,
    tags: ['Skincare', 'Beauty', 'Facial Oil', 'Glow', 'Serums']
  }
];

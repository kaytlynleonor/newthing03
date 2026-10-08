export interface CollectionInfo {
  id: string;
  name: string;
  slug: string;
  subtitle: string;
  description: string;
  image: string;
  itemCount: number;
}

export const COLLECTIONS_DATA: CollectionInfo[] = [
  {
    id: 'col-1',
    name: 'Signature Collection',
    slug: 'signature',
    subtitle: 'The Quintessence of Modern Luxury',
    description: 'Impeccable silk tailoring, liquid silhouettes, and timeless evening outerwear crafted to transcend seasons.',
    image: '/assets/images/hero_campaign_1.jpg',
    itemCount: 14
  },
  {
    id: 'col-2',
    name: 'Maison Accessories',
    slug: 'maison-accessories',
    subtitle: 'Sculptured Leather & Fine Jewelry',
    description: 'Hand-burnished Italian calfskin handbags and 18k gold vermeil jewelry finished by master goldsmiths.',
    image: '/Leonor%20Kaytlyn%20Luxury%20Packaging%20Still%20Life.png',
    itemCount: 9
  },
  {
    id: 'col-3',
    name: 'Modern Radiance Beauty',
    slug: 'modern-radiance',
    subtitle: 'Sensual Botanical Beauty Rituals',
    description: 'Artisanal French perfumery, hydrating velvet matte lipsticks, and skin-transforming botanical elixirs.',
    image: '/assets/images/category_beauty.jpg',
    itemCount: 12
  },
  {
    id: 'col-4',
    name: 'Velvet Dusk',
    slug: 'velvet-dusk',
    subtitle: 'Autumn / Winter Couture',
    description: 'Cashmere outerwear, structured blazers, and dark twilight tones inspired by Mediterranean evening light.',
    image: '/assets/images/campaign_editorial_2.jpg',
    itemCount: 8
  }
];

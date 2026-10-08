import React from 'react';
import { useStore } from '../../context/StoreContext';

export const StructuredData: React.FC = () => {
  const { products, selectedProductId } = useStore();

  const currentProduct = selectedProductId ? products.find(p => p.id === selectedProductId) : null;

  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'KAYTLYN LEONOR',
    url: 'https://kaytlynleonor.com',
    logo: 'https://kaytlynleonor.com/Luxury%20Gold%20KL%20Monogram%20Logo.png',
    sameAs: [
      'https://instagram.com/kaytlynleonor',
      'https://pinterest.com/kaytlynleonor'
    ],
    description: 'High fashion & luxury beauty house defined by quiet confidence and intentional craftsmanship.'
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'KAYTLYN LEONOR',
    url: 'https://kaytlynleonor.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://kaytlynleonor.com/search?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  };

  let productSchema = null;
  if (currentProduct) {
    productSchema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: currentProduct.name,
      image: currentProduct.images.map(img => img.startsWith('http') ? img : `https://kaytlynleonor.com${img}`),
      description: currentProduct.description,
      sku: currentProduct.sku,
      brand: {
        '@type': 'Brand',
        name: 'KAYTLYN LEONOR'
      },
      offers: {
        '@type': 'Offer',
        url: `https://kaytlynleonor.com/products/${currentProduct.slug}`,
        priceCurrency: 'INR',
        price: currentProduct.price,
        availability: 'https://schema.org/InStock',
        itemCondition: 'https://schema.org/NewCondition'
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: currentProduct.rating,
        reviewCount: currentProduct.reviewCount
      }
    };
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      {productSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
      )}
    </>
  );
};

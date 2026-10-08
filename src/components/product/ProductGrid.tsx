import React from 'react';
import { Product } from '../../types/ecommerce';
import { ProductCard } from './ProductCard';
import { PackageX } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  title?: string;
  subtitle?: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ products, title, subtitle }) => {
  if (products.length === 0) {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto">
        <PackageX size={48} className="mx-auto text-[#A99684]" strokeWidth={1} />
        <h3 className="font-serif text-2xl tracking-[0.15em] uppercase">NO PIECES FOUND</h3>
        <p className="text-xs font-sans text-[#A99684] tracking-wider">
          We could not find products matching your exact filter criteria. Try clearing selected filters or exploring our Signature collection.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {(title || subtitle) && (
        <div className="text-center space-y-1">
          {subtitle && (
            <span className="text-[10px] font-sans uppercase tracking-[0.3em] text-[#A99684]">
              {subtitle}
            </span>
          )}
          {title && (
            <h2 className="font-serif text-3xl md:text-4xl tracking-[0.2em] uppercase font-light">
              {title}
            </h2>
          )}
        </div>
      )}

      {/* 4-col desktop, 2-col mobile responsive grid */}
      <div className="grid grid-cols-2 gap-x-2 gap-y-3 md:grid-cols-3 md:gap-8 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

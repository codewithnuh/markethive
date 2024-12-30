"use client";
import ProductCard from "./product-card";
/**
 * Type definition for displaying product data
 */
export type Product = {
  id: string;
  name: string;
  description: string;
  images: string[];
  price: number;
  stock: number;
  ratings?: number;
  category: string;
  attributes: Array<{ key: string; value: string }>;
};
type ProductGridType = {
  products: Product[];
};
export default function ProductGrid({ products }: ProductGridType) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.length <= 0 ? (
        <p>No products found</p>
      ) : (
        products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))
      )}
    </div>
  );
}

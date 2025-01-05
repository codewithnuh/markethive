import { getRelatedProducts } from "@/lib/actions/product/actions";
import { Suspense } from "react";
import { ProductCardSkeleton } from "./new-products";
import ProductCard from "./product-card";

export default async function RelatedProducts({
  category,
}: {
  category: string;
}) {
  const relatedProducts = await getRelatedProducts(category);
  return (
    <section className="mt-12">
      <h2 className="mb-6 text-2xl font-bold">Related Products</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {relatedProducts.data ? (
          relatedProducts.data.map((product) => (
            <Suspense key={product.id} fallback={<ProductCardSkeleton />}>
              <ProductCard product={product} />
            </Suspense>
          ))
        ) : (
          <h2>No Related Product Found</h2>
        )}
      </div>
    </section>
  );
}

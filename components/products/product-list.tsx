import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

import { PaginatedResponse } from "@/lib/actions/product/actions";
import PaginationComponent from "./pagination";

export function ProductList({ products }: { products: PaginatedResponse }) {
  console.log(products.data?.products);
  if (!products || !products.data?.pagination) {
    return <div>Error loading products.</div>;
  }
  if (products.data.products.length == 0) {
    return <h1>No Product Found</h1>;
  }
  const { currentPage, totalPages } = products.data.pagination;

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
        {products.data.products.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <CardContent className="p-4">
              <Image
                src={product.images[0] || "/placeholder.svg"}
                alt={product.name}
                width={200}
                height={200}
                className="w-full h-48 object-cover mb-4 rounded-md"
              />
              <h3 className="font-semibold mb-2">{product.name}</h3>
              <p className="text-muted-foreground mb-2">{product.category}</p>
              <p className="font-bold">
                $
                {product.discountedPrice?.toFixed(2) ||
                  product.price.toFixed(2)}
              </p>
              {product.discountedPrice && (
                <p className="text-sm text-muted-foreground line-through">
                  ${product.price.toFixed(2)}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      <PaginationComponent
        pathName="products"
        currentPage={currentPage}
        totalPages={totalPages}
      />
    </div>
  );
}

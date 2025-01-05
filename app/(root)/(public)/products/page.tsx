import { Suspense } from "react";
import { ProductList } from "@/components/products/product-list";
import { ProductFilters } from "@/components/products/product-filter";
import { getAllProducts } from "@/lib/actions/product/actions";
import { ProductCardSkeleton } from "@/components/products/new-products";
import { connection } from "next/server";

export const experimental_ppr = true;

// Update the type to reflect the async nature of searchParams

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;
export default async function ProductsPage(props: {
  searchParams: SearchParams;
}) {
  await connection();

  // Await searchParams to access its values
  const searchParams = await props.searchParams;

  const query =
    typeof searchParams.query === "string" ? searchParams.query : undefined;
  const maxPrice =
    typeof searchParams.maxPrice === "string"
      ? parseInt(searchParams.maxPrice)
      : undefined;
  const minPrice =
    typeof searchParams.minPrice === "string"
      ? parseInt(searchParams.minPrice)
      : undefined;
  const page =
    typeof searchParams.page === "string"
      ? parseInt(searchParams.page, 10)
      : undefined;
  const pageSize =
    typeof searchParams.pageSize === "string"
      ? parseInt(searchParams.pageSize, 10)
      : undefined;
  const sortBy =
    typeof searchParams.sortBy === "string"
      ? (searchParams.sortBy as "price-asc" | "price-desc" | "name" | "id")
      : undefined;
  const allProducts = await getAllProducts({
    pageSize: pageSize || 12,
    page: page || 1,
    query,
    sortBy,
    minPrice,
    maxPrice,
  });
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Our Products</h1>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/4">
          <ProductFilters />
        </div>
        <div className="w-full md:w-3/4">
          <Suspense
            fallback={
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 place-items-center gap-4">
                {Array(10)
                  .fill(2)
                  .map((_, index) => (
                    <ProductCardSkeleton key={index} />
                  ))}
              </div>
            }
          >
            <ProductList products={allProducts} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

import { Metadata } from "next";
import ProductDetails, { Product } from "@/components/products/product-details";
import RelatedProducts from "@/components/products/related-products";
import { getProduct } from "@/lib/actions/product/actions";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Product Details",
  description: "View details of our amazing product",
};

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  const { data: product } = await getProduct(id);
  if (!product) {
    notFound();
  }
  return (
    <div className="container mx-auto px-4 py-8">
      <ProductDetails product={product as unknown as Product} />
      <RelatedProducts />
    </div>
  );
}

import { Metadata } from "next";
import ProductDetails from "@/components/products/product-details";
import RelatedProducts from "@/components/products/related-products";

export const metadata: Metadata = {
  title: "Product Details",
  description: "View details of our amazing product",
};

export default function ProductPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <ProductDetails />
      <RelatedProducts />
    </div>
  );
}

import { Metadata } from "next";
import { getProduct } from "@/lib/actions/product/actions";
import UpdateProductForm from "@/components/products/update-product-form";
export const metadata: Metadata = {
  title: "Update product",
  description: "Update product to your inventory",
};

export default async function CreateProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  const product = await getProduct(id);
  console.log(product.data);
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Update Product</h1>
      {product.data ? (
        <UpdateProductForm product={product.data} />
      ) : (
        <p>Product not found</p>
      )}
    </div>
  );
}

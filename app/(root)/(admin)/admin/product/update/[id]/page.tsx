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
  return (
    <div className="container mx-auto px-4 py-24">
       <div className="max-w-4xl mx-auto space-y-12">
        <div className="space-y-2 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Edit Product</h1>
          <p className="text-xl text-muted-foreground">Refine the details for {product.data?.name || 'your product'}.</p>
        </div>
        {product.data ? (
          <UpdateProductForm product={product.data} />
        ) : (
          <div className="bg-secondary/30 rounded-[2rem] p-12 text-center">
             <p className="text-xl font-medium">Product not found</p>
          </div>
        )}
      </div>
    </div>
  );
}

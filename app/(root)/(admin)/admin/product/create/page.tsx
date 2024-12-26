import { Metadata } from "next";
import ProductCreationForm from "@/components/products/product-creation-form";

export const metadata: Metadata = {
  title: "Create New Product",
  description: "Add a new product to your inventory",
};

export default function CreateProductPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Create New Product</h1>
      <ProductCreationForm />
    </div>
  );
}

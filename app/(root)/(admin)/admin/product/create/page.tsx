import { Metadata } from "next";
import ProductCreationForm from "@/components/products/product-creation";

export const metadata: Metadata = {
  title: "Create New Product",
  description: "Add a new product to your inventory",
};

export default function CreateProductPage() {
  return (
    <div className="container mx-auto px-4 py-24">
       <div className="max-w-4xl mx-auto space-y-12">
        <div className="space-y-2 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-center">New Product</h1>
          <p className="text-xl text-muted-foreground">Expand your collection with a new addition.</p>
        </div>
        <ProductCreationForm type="Create" />
      </div>
    </div>
  );
}

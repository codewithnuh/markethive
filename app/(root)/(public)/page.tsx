import Hero from "@/components/hero";
import ProductGrid from "@/components/products/product-grid";
import Sidebar from "@/components/products/product-sidebar";
import { getAllProducts } from "@/lib/actions/product/actions";
import React from "react";

const HomePage = async () => {
  const products = await getAllProducts();
  return (
    <div className="container">
      <Hero />
      <div className="flex gap-8">
        <Sidebar />
        <div className="">
          <div className="flex sm:flex-row flex-col sm:space-x-20 w-full  space-y-4 sm:space-y-0  items-center mb-8">
            <h1 className="text-3xl font-bold">Electronics</h1>
            <p className="text-muted-foreground">Showing 1-6 of 100 products</p>
          </div>
          <ProductGrid products={products?.data || []} />
        </div>
      </div>
    </div>
  );
};

export default HomePage;

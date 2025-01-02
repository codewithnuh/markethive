import Hero from "@/components/hero";
import WhatsNewSection from "@/components/products/new-products";

import { getAllProducts } from "@/lib/actions/product/actions";
import React from "react";
export const experimental_ppr = true;
const HomePage = async () => {
  const products = await getAllProducts();
  console.log(products.data);
  return (
    <div className="container">
      <Hero />
      <WhatsNewSection products={products.data!} />
    </div>
  );
};

export default HomePage;

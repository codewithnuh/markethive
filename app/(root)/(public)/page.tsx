import Hero from "@/components/hero";
import WhatsNewSection from "@/components/products/new-products";
import { getNewProducts } from "@/lib/actions/product/actions";
import React from "react";
const HomePage = async () => {
  const products = await getNewProducts();

  return (
    <div className="container">
      <Hero />
      <WhatsNewSection products={products.data!} />
    </div>
  );
};

export default HomePage;

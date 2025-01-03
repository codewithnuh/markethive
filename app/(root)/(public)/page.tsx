import Hero from "@/components/hero";
import WhatsNewSection from "@/components/products/new-products";
import { connection } from "next/server";
import { getAllProducts } from "@/lib/actions/product/actions";
import React from "react";
export const experimental_ppr = true;
const HomePage = async () => {
  await connection();
  const products = await getAllProducts();

  return (
    <div className="container">
      <Hero />
      <WhatsNewSection products={products.data!} />
    </div>
  );
};

export default HomePage;

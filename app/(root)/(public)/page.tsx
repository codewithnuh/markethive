import Hero from "@/components/hero";
import ProductCard from "@/components/products/product-card";
import React from "react";

const HomePage = () => {
  return (
    <div className="container">
      <Hero />
      <div className="grid-cols-1 grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        {Array(5)
          .fill(5)
          .map((_, index) => (
            <ProductCard key={index} />
          ))}
      </div>
    </div>
  );
};

export default HomePage;

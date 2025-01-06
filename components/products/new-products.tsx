"use client";

import * as React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import ProductCard from "./product-card";
import { Skeleton } from "../ui/skeleton";

export const ProductCardSkeleton = () => {
  return (
    <div className="w-52 h-52 p-5 flex flex-col space-y-3">
      <Skeleton className="py-14" />
      <Skeleton className="py-4" />
      <Skeleton className="py-2" />
    </div>
  );
};
export interface Product {
  id: string;
  name: string;
  description: string;
  images: string[];
  price: number;
  stock: number;
  ratings?: number;
  category: string;
  discountedPrice?: number;
  attributes: Array<{ key: string; value: string }>;
}

export default function WhatsNewSection({ products }: { products: Product[] }) {
  return (
    <section className="w-full py-12">
      <div className="container px-4">
        <div className="relative mb-10 text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
            See What&apos;s New Today
          </h2>
          <p className="mx-auto mt-4 max-w-[700px] text-muted-foreground">
            Experience the powerful synergy of nature and nurture in our
            delicate products, delivering glowing results that celebrate the
            holistic care your skin deserves
          </p>
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <div className="absolute right-16 mb-6 -top-5  justify-center flex items-center  z-10">
            <CarouselPrevious className=" h-8 w-8" />
            <CarouselNext className="h-8 w-8" />
          </div>
          <CarouselContent className="-ml-2 md:-ml-4 ">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </CarouselContent>
        </Carousel>

        <div className="mt-8 text-center">
          <Button variant="outline" asChild size="lg">
            <Link href={"/products"}>View Products</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

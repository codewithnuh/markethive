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
import { Card, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

const ProductCardSkeleton = () => {
  return (
    <div className="w-full md:w-1/2 lg:w-1/4 px-2 md:px-4 mb-4">
      <Card className="border-0 shadow-xl p-4">
        <CardContent className="p-0">
          <div className="relative">
            <Skeleton className="absolute left-2 top-2 h-6 w-16 rounded-full" />
            <Skeleton className="mx-auto aspect-square h-[300px] w-full rounded-lg" />
          </div>
          <div className="mt-4 space-y-2 text-center">
            <Skeleton className="mx-auto h-4 w-24" />
            <Skeleton className="mx-auto h-6 w-40" />
            <div className="flex items-center justify-center gap-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        </CardContent>
      </Card>
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

// const products: Product[] = [
//   {
//     id: 1,
//     name: "LENOVO AMD RYESEN",
//     category: "Laptop",
//     originalPrice: 100.0,
//     discountedPrice: 52.5,
//     discount: 35,
//     image: "/laptop.webp",
//   },
//   {
//     id: 2,
//     name: "LENOVO AMD RYESEN",
//     category: "Laptop",
//     originalPrice: 100.0,
//     discountedPrice: 52.5,
//     discount: 35,
//     image: "/placeholder.svg?height=300&width=300",
//   },
//   {
//     id: 3,
//     name: "LENOVO AMD RYESEN",
//     category: "Laptop",
//     originalPrice: 100.0,
//     discountedPrice: 52.5,
//     discount: 35,
//     image: "/placeholder.svg?height=300&width=300",
//   },
//   {
//     id: 4,
//     name: "LENOVO AMD RYESEN",
//     category: "Laptop",
//     originalPrice: 100.0,
//     discountedPrice: 52.5,
//     discount: 35,
//     image: "/placeholder.svg?height=300&width=300",
//   },
//   {
//     id: 5,
//     name: "LENOVO AMD RYESEN",
//     category: "Laptop",
//     originalPrice: 100.0,
//     discountedPrice: 52.5,
//     discount: 35,
//     image: "/placeholder.svg?height=300&width=300",
//   },
// ];

export default function WhatsNewSection({ products }: { products: Product[] }) {
  console.log(products);
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
          <div className="absolute right-0 -top-5  flex items-center  z-10">
            <CarouselPrevious className="relative h-8 w-8" />
            <CarouselNext className="relative h-8 w-8" />
          </div>
          <CarouselContent className="-ml-2 md:-ml-4 ">
            {products.map((product) => (
              <React.Suspense
                key={product.id}
                fallback={<ProductCardSkeleton />}
              >
                <ProductCard product={product} />
              </React.Suspense>
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

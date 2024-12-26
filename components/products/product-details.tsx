"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const product = {
  name: "Ergonomic Desk Chair",
  description:
    "Experience ultimate comfort with our ergonomic desk chair. Designed to support your body during long work hours, this chair features adjustable lumbar support, breathable mesh back, and customizable armrests.",
  price: 299.99,
  images: [
    "/placeholder.svg?height=400&width=400",
    "/placeholder.svg?height=400&width=400",
    "/placeholder.svg?height=400&width=400",
  ],
  attributes: [
    { name: "Material", value: "Mesh and High-grade Plastic" },
    { name: "Color", value: "Black" },
    { name: "Weight Capacity", value: "300 lbs" },
    { name: "Adjustable Height", value: "Yes" },
  ],
};

export default function ProductDetails() {
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Carousel className="w-full max-w-xl">
        <CarouselContent>
          {product.images.map((src, index) => (
            <CarouselItem key={index}>
              <div className="p-1">
                <Card>
                  <CardContent className="flex aspect-square items-center justify-center p-6">
                    <Image
                      src={src}
                      alt={`${product.name} - Image ${index + 1}`}
                      width={400}
                      height={400}
                      className="rounded-md object-cover"
                    />
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>

      <div className="space-y-6">
        <h1 className="text-3xl font-bold">{product.name}</h1>
        <p className="text-muted-foreground">{product.description}</p>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Attributes</h2>
          <ul className="space-y-1">
            {product.attributes.map((attr, index) => (
              <li key={index} className="flex justify-between">
                <span className="font-medium">{attr.name}:</span>
                <span className="text-muted-foreground">{attr.value}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold">
            ${product.price.toFixed(2)}
          </span>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
            >
              -
            </Button>
            <span className="w-8 text-center">{quantity}</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setQuantity(quantity + 1)}
            >
              +
            </Button>
          </div>
        </div>
        <Button className="w-full" size="lg">
          Add to Cart
        </Button>
        <div className="flex items-center justify-between">
          <Badge variant="secondary">Free Shipping</Badge>
          <Badge variant="secondary">In Stock</Badge>
        </div>
      </div>
    </div>
  );
}

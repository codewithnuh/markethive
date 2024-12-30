"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "./product-grid";
import Link from "next/link";
export default function ProductCard({ product }: { product: Product }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === product.images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? product.images.length - 1 : prevIndex - 1
    );
  };

  return (
    <Card className="flex flex-col h-full relative group">
      <Button
        className="absolute right-2 top-2 p-2 rounded-full bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
        aria-label="Add to wishlist"
      >
        <Heart className="w-5 h-5" />
      </Button>
      <CardContent className="flex-grow p-4">
        <div className="h-60 relative mb-4 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
          <Image
            src={product.images[currentImageIndex]}
            alt={product.name}
            fill
            className="object-cover"
          />
          {product.images.length > 1 && (
            <>
              <Button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-white/70 dark:bg-gray-800/70 text-gray-800 dark:text-white"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-white/70 dark:bg-gray-800/70 text-gray-800 dark:text-white"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </>
          )}
        </div>
        <div className="space-y-2 flex-grow">
          <div className="flex justify-between items-start">
            <h3 className="font-medium text-lg line-clamp-2">{product.name}</h3>
            <Badge variant="secondary">{product.category}</Badge>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {product.description}
          </p>
          <div className="flex justify-between items-center mt-auto pt-2">
            <p className="text-xl font-bold">
              ${product.price.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </p>
          </div>
          {/* <div className="flex space-x-2 flex-wrap">
            {product.attributes.map((attr) => (
              <div key={attr.key} className="flex  items-center space-x-2">
                <span className="text-sm font-medium">{attr.key}:</span>
                <Badge variant="outline" className="text-xs">
                  {attr.value}
                </Badge>
              </div>
            ))}
          </div> */}
        </div>
      </CardContent>
      <CardFooter className="p-4">
        <Button className="w-full" asChild>
          <Link href={`/product/${product.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

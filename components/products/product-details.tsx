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
import { addToCart } from "@/lib/actions/product/cart/actions";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

// const product = {
//   name: "Ergonomic Desk Chair",
//   description:
//     "Experience ultimate comfort with our ergonomic desk chair. Designed to support your body during long work hours, this chair features adjustable lumbar support, breathable mesh back, and customizable armrests.",
//   price: 299.99,
//   images: [
//     "/placeholder.svg?height=400&width=400",
//     "/placeholder.svg?height=400&width=400",
//     "/placeholder.svg?height=400&width=400",
//   ],
//   attributes: [
//     { name: "Material", value: "Mesh and High-grade Plastic" },
//     { name: "Color", value: "Black" },
//     { name: "Weight Capacity", value: "300 lbs" },
//     { name: "Adjustable Height", value: "Yes" },
//   ],
//   id: "23", // Add a product ID for demonstration
// };

export type Product = {
  id: string;
  description: string;
  name: string;
  images: string[];
  price: number;
  stock: number;
  ratings: number;
  attributes?: Array<{ key: string; value: string }>;
};

export default function ProductDetails({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const handleAddToCart = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const response = await addToCart({
        productId: product.id,
        quantity,
      });

      if (response.success) {
        console.log("Item added to cart:", response.data);
        toast({
          title: "Product added",
          description: "Friday, February 10, 2023 at 5:57 PM",
        });
        // Optionally, show a success message or update UI
      } else {
        console.error("Failed to add item to cart:", response.error);
        toast({
          title: "Product not added",
          description: "Friday, February 10, 2023 at 5:57 PM",
        });
        // Optionally, show an error message
      }
    } catch (error) {
      console.error("Error adding item to cart:", error);
      // Optionally, show an error message
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <div className="flex space-x-2 flex-wrap">
            {product?.attributes &&
              product.attributes.map((attr) => (
                <div key={attr.key} className="flex  items-center space-x-2">
                  <span className="text-sm font-medium">{attr.key}:</span>
                  <Badge variant="outline" className="text-xs">
                    {attr.value}
                  </Badge>
                </div>
              ))}
          </div>
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
        <form onSubmit={handleAddToCart}>
          <Button className="w-full" size="lg" type="submit">
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" />
                Adding to cart...
              </>
            ) : (
              "Add to cart"
            )}
          </Button>
        </form>
        <div className="flex items-center justify-between">
          <Badge variant="secondary">Free Shipping</Badge>
          <Badge variant="secondary">In Stock</Badge>
        </div>
      </div>
    </div>
  );
}

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

export type Product = {
  id: string;
  description: string;
  name: string;
  images: string[];
  price: number; // Original price
  discountedPrice?: number; // Discounted price
  stock: number;
  ratings: number;
  category?: string;
  attributes?: Array<{ name: string; value: string }>;
};

export default function ProductDetails({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Calculate discount percentage
  const discountPercentage = product.discountedPrice
    ? Math.round(
        ((product.price - product.discountedPrice) / product.price) * 100
      )
    : 0;

  const handleAddToCart = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const response = await addToCart({
        productId: product.id,
        quantity,
      });

      const timestamp = new Date().toLocaleString();

      if (response.success) {
        toast({
          title: "Product added",
          description: `Added on ${timestamp}`,
        });
      } else {
        toast({
          title: "Product not added",
          description: `Failed on ${timestamp}`,
        });
      }
    } catch (error) {
      console.error("Error adding item to cart:", error);
      toast({
        title: "Error",
        description: "Something went wrong while adding to cart.",
      });
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
                      onError={(e) => {
                        e.currentTarget.src =
                          "/placeholder.svg?height=400&width=400";
                      }}
                    />
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious aria-label="Previous slide" />
        <CarouselNext aria-label="Next slide" />
      </Carousel>

      <div className="space-y-6">
        <h1 className="text-3xl font-bold">{product.name}</h1>
        <p className="text-muted-foreground">{product.description}</p>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Attributes</h2>
          <div className="flex space-x-2 flex-wrap">
            {product?.attributes &&
              product.attributes.map((attr, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{attr.name}:</span>
                  <Badge variant="outline" className="text-xs">
                    {attr.value}
                  </Badge>
                </div>
              ))}
          </div>
        </div>
        <div className="space-y-4">
          {/* Price and Discount Section */}
          {product.discountedPrice ? (
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-muted-foreground line-through text-xl">
                  ${product.price.toFixed(2)}
                </span>
                <span className="text-2xl font-bold text-primary">
                  ${product.discountedPrice.toFixed(2)}
                </span>
              </div>
              <Badge variant="destructive" className="text-sm">
                Save {discountPercentage}%!
              </Badge>
            </div>
          ) : (
            <span className="text-2xl font-bold">
              ${product.price.toFixed(2)}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            aria-label="Decrease quantity"
          >
            -
          </Button>
          <span className="w-8 text-center">{quantity}</span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setQuantity(Math.min(quantity + 1, product.stock))}
            aria-label="Increase quantity"
          >
            +
          </Button>
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
          {product.stock > 0 ? (
            <Badge variant="secondary">In Stock</Badge>
          ) : (
            <Badge variant="destructive">Out of Stock</Badge>
          )}
        </div>
      </div>
    </div>
  );
}

import React from "react";
import { Card, CardContent } from "../ui/card";
import { Link } from "lucide-react";
import { CarouselItem } from "../ui/carousel";
import Image from "next/image";
import { Product } from "./new-products";
const ProductCard = ({ product }: { product: Product }) => {
  return (
    <CarouselItem
      key={product.id}
      className="pl-2 md:basis-1/2 lg:basis-1/4 md:pl-4"
    >
      <Card className="border-0 shadow-xl p-4">
        <CardContent className="p-0">
          <div className="relative">
            <div className="absolute left-2 top-2 rounded-full bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground">
              34% OFF
            </div>
            <Image
              src={product.images[0]}
              alt={product.name}
              width={300}
              height={300}
              className="mx-auto aspect-square rounded-lg object-cover"
            />
          </div>
          <div className="mt-4 space-y-2 text-center">
            <p className="text-sm text-muted-foreground">{product.category}</p>
            <Link href={`/product/${product.id}`}>
              <h3 className="font-semibold">{product.name}</h3>
            </Link>
            <div className="flex items-center justify-center gap-2">
              <span className="text-muted-foreground line-through">
                ${product.price.toFixed(2)}
              </span>
              <span className="font-semibold text-primary">
                ${(3434.34).toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </CarouselItem>
  );
};

export default ProductCard;

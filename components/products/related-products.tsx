import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const relatedProducts = [
  {
    id: 1,
    name: "Office Desk",
    price: 199.99,
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: 2,
    name: "Desk Lamp",
    price: 49.99,
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: 3,
    name: "Footrest",
    price: 29.99,
    image: "/placeholder.svg?height=200&width=200",
  },
  {
    id: 4,
    name: "Monitor Stand",
    price: 79.99,
    image: "/placeholder.svg?height=200&width=200",
  },
];

export default function RelatedProducts() {
  return (
    <section className="mt-12">
      <h2 className="mb-6 text-2xl font-bold">Related Products</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {relatedProducts.map((product) => (
          <Card key={product.id}>
            <CardContent className="p-4">
              <Image
                src={product.image}
                alt={product.name}
                width={200}
                height={200}
                className="rounded-md object-cover"
              />
            </CardContent>
            <CardFooter className="flex flex-col items-start gap-2">
              <h3 className="font-semibold">{product.name}</h3>
              <p className="text-muted-foreground">
                ${product.price.toFixed(2)}
              </p>
              <Button asChild className="w-full">
                <Link href={`/product/${product.id}`}>View Details</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
}

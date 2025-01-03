"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Loader2 } from "lucide-react";
import CartItem from "./cart-item";
import { getCart } from "@/lib/actions/product/cart/actions";
import { useToast } from "@/hooks/use-toast";
import { createCheckoutSession } from "@/lib/actions/stripe/actions";

interface CartItemType {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
  };
}

export default function CartSidebar() {
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // Fetch cart items only when the sheet is opened
  useEffect(() => {
    if (isOpen) {
      const fetchCartItems = async () => {
        try {
          setIsLoading(true);
          const result = await getCart();
          if (result.success && result.data) {
            setCartItems(result.data);
          } else {
            toast({
              variant: "destructive",
              title: "Error",
              description: result.error || "Failed to fetch cart items",
            });
          }
        } catch (error) {
          console.error("Error fetching cart:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to fetch cart items",
          });
        } finally {
          setIsLoading(false);
        }
      };

      fetchCartItems();
    }
  }, [isOpen, toast]); // Only re-run when sheet opens or toast changes

  const updateQuantity = (id: string, newQuantity: number) => {
    setCartItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(0, newQuantity) } : item
      )
    );
  };

  const removeItem = (id: string) => {
    setCartItems((items) => items.filter((item) => item.id !== id));
  };

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const handleCheckout = async () => {
    try {
      const result = await createCheckoutSession();
      if (result.success) {
        router.push(result.url as string);
      }
      toast({
        variant: "default",
        title: "Redirecting",
        description: "Redirecting to checkout page",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Checkout Error",
        description: error instanceof Error ? error.message : "Checkout failed",
      });
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-xs text-primary-foreground flex items-center justify-center">
            {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
          </span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle>Your Cart</SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex-grow">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : cartItems.length === 0 ? (
            <div className="flex justify-center items-center h-40 text-muted-foreground">
              Your cart is empty
            </div>
          ) : (
            cartItems.map((item) => (
              <CartItem
                key={item.id}
                item={{
                  id: item.id,
                  name: item.product.name,
                  price: item.product.price,
                  quantity: item.quantity,
                  image: item.product.images[0],
                }}
                updateQuantity={updateQuantity}
                removeItem={removeItem}
              />
            ))
          )}
        </ScrollArea>
        <div className="border-t pt-4 mt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold">Total:</span>
            <span className="text-lg font-semibold">
              ${totalPrice.toFixed(2)}
            </span>
          </div>
          <form action={handleCheckout}>
            <Button
              className="w-full"
              type="submit"
              disabled={isLoading || cartItems.length === 0}
            >
              Checkout
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}

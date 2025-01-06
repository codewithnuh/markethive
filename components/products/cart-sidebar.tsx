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
import { CheckoutForm } from "./checkout-form";

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
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [discountedPercentage, setDiscountedPercentage] = useState<
    number | undefined
  >(0);
  const [isOpen, setIsOpen] = useState(false);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      const fetchCartItems = async () => {
        try {
          setIsLoading(true);
          const result = await getCart();
          if (result.success && result.data) {
            setCartItems(result.data);
            setDiscountedPercentage(result.discountPercentage || 0);
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
  }, [isOpen, toast]);

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

  const discountedPrice = discountedPercentage
    ? totalPrice - totalPrice * (discountedPercentage / 100)
    : totalPrice;

  const handleCheckout = () => {
    setShowCheckoutForm(true);
  };

  const handleCloseCheckout = () => {
    setShowCheckoutForm(false);
    setIsOpen(false);
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
      <ScrollArea className="flex-grow max-h-[400px]">
        <SheetContent className="w-full sm:max-w-lg flex flex-col">
          <SheetHeader>
            <SheetTitle>
              {showCheckoutForm ? "Checkout" : "Your Cart"}
            </SheetTitle>
          </SheetHeader>
          {showCheckoutForm ? (
            <CheckoutForm onClose={handleCloseCheckout} />
          ) : (
            <>
              {/* Wrapping the cart items in ScrollArea */}
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
              {/* Total and Checkout Button */}
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-lg font-semibold">
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>
                {discountedPercentage ? (
                  <div className="flex justify-between items-center mb-4 text-green-600">
                    <span className="text-sm font-medium">
                      Discounted Total:
                    </span>
                    <span className="text-lg font-semibold">
                      ${discountedPrice.toFixed(2)}
                    </span>
                  </div>
                ) : null}
                <Button
                  className="w-full"
                  type="button"
                  disabled={
                    isLoading || cartItems.length === 0 || isCheckingOut
                  }
                  onClick={handleCheckout}
                >
                  Proceed to Checkout
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </ScrollArea>
    </Sheet>
  );
}

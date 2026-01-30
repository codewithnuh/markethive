"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import CartItem from "./cart-item";
import { getCart } from "@/lib/actions/product/cart/actions";
import { useToast } from "@/hooks/use-toast";
import { CheckoutForm } from "./checkout-form";
import { Skeleton } from "../ui/skeleton";

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
  const [isCheckingOut] = useState(false);
  const [discountedPercentage, setDiscountedPercentage] = useState<
    number | undefined
  >(0);
  const [isOpen, setIsOpen] = useState(false);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const { toast } = useToast();

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
        <Button variant="ghost" size="icon" className="relative hover:bg-secondary/50 rounded-full h-10 w-10">
          <ShoppingCart className="h-5 w-5" />
          {cartItems.length > 0 && (
            <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-blue-600 text-[10px] font-bold text-white flex items-center justify-center">
              {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0 bg-background/95 backdrop-blur-xl border-l border-border/50">
          <SheetHeader className="p-8 border-b border-border/50">
            <SheetTitle className="text-2xl font-bold tracking-tight">
              {showCheckoutForm ? "Checkout" : "Bag"}
            </SheetTitle>
          </SheetHeader>

          <div className="flex-grow overflow-hidden flex flex-col">
            {showCheckoutForm ? (
              <ScrollArea className="flex-grow p-8">
                <CheckoutForm onClose={handleCloseCheckout} />
              </ScrollArea>
            ) : (
              <>
                <ScrollArea className="flex-grow px-8 py-4">
                  {isLoading ? (
                    <CartItemFallback />
                  ) : cartItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
                       <div className="bg-secondary/50 p-6 rounded-full">
                          <ShoppingCart className="h-10 w-10 text-muted-foreground" />
                       </div>
                       <div className="space-y-1">
                          <p className="text-lg font-bold">Your bag is empty</p>
                          <p className="text-sm text-muted-foreground">Ready to start shopping?</p>
                       </div>
                       <Button variant="link" onClick={() => setIsOpen(false)} className="text-blue-600 font-bold">
                          Browse products →
                       </Button>
                    </div>
                  ) : (
                    <div className="space-y-8 py-4">
                      {cartItems.map((item) => (
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
                      ))}
                    </div>
                  )}
                </ScrollArea>

                {cartItems.length > 0 && (
                  <div className="p-8 bg-secondary/10 border-t border-border/50 space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="font-medium">${totalPrice.toFixed(2)}</span>
                      </div>
                      {discountedPercentage ? (
                        <div className="flex justify-between items-center text-blue-600 font-bold">
                          <span>Special Offer ({discountedPercentage}%)</span>
                          <span>-${(totalPrice - discountedPrice).toFixed(2)}</span>
                        </div>
                      ) : null}
                      <div className="flex justify-between items-center pt-2 border-t border-border/50">
                        <span className="text-xl font-bold">Total</span>
                        <span className="text-xl font-bold">
                          ${discountedPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <Button
                      className="w-full h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-lg font-bold shadow-lg shadow-blue-600/20"
                      type="button"
                      disabled={isLoading || cartItems.length === 0 || isCheckingOut}
                      onClick={handleCheckout}
                    >
                      Check Out
                    </Button>
                    <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest font-bold">
                       Secure Checkout Powered by Stripe
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
      </SheetContent>
    </Sheet>
  );
}

export const CartItemFallback = () => (
  <div className="flex flex-col gap-y-6">
    {Array(5)
      .fill(5)
      .map((_, index) => (
        <div key={index} className="flex gap-2">
          <Skeleton className="h-20 w-20"></Skeleton>
          <div className="flex flex-col space-y-6 items-center justify-center">
            <Skeleton className="h-4 w-20"></Skeleton>
            <Skeleton className="h-4 w-20"></Skeleton>
          </div>
        </div>
      ))}
  </div>
);

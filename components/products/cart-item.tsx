// components/products/cart-item.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus, X } from "lucide-react";
import debounce from "lodash/debounce";
import {
  updateCartItem,
  removeFromCart,
} from "@/lib/actions/product/cart/actions";

interface CartItemProps {
  item: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  };
  updateQuantity: (id: string, newQuantity: number) => void;
  removeItem: (id: string) => void;
}

export default function CartItem({
  item,
  updateQuantity,
  removeItem,
}: CartItemProps) {
  const [localQuantity, setLocalQuantity] = useState(item.quantity);

  // Reset local quantity when item quantity props changes
  useEffect(() => {
    setLocalQuantity(item.quantity);
  }, [item.quantity]);

  // Debounced database update
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedUpdateQuantity = useCallback(
    debounce(async (id: string, quantity: number) => {
      const result = await updateCartItem({ id, quantity });
      if (result.success) {
        updateQuantity(id, quantity);
      }
    }, 500),
    []
  );

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    setLocalQuantity(newQuantity);
    debouncedUpdateQuantity(item.id, newQuantity);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      handleQuantityChange(value);
    }
  };

  const handleRemove = async () => {
    const result = await removeFromCart(item.id);
    if (result.success) {
      removeItem(item.id);
    }
  };

  return (
    <div className="flex items-center space-x-4 py-4 border-b last:border-b-0">
      <div className="relative h-16 w-16 flex-shrink-0">
        <Image
          src={item.image}
          alt={item.name}
          fill
          style={{ objectFit: "cover" }}
          className="rounded-md"
        />
      </div>
      <div className="flex-grow">
        <h3 className="text-sm font-medium">{item.name}</h3>
        <p className="text-sm text-muted-foreground">
          ${item.price.toFixed(2)}
        </p>
        <div className="flex items-center mt-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleQuantityChange(localQuantity - 1)}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            type="number"
            min="1"
            value={localQuantity}
            onChange={handleInputChange}
            className="h-8 w-12 mx-2 text-center"
          />
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleQuantityChange(localQuantity + 1)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="flex-shrink-0"
        onClick={handleRemove}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback, memo } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus, X } from "lucide-react";
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

export default memo(function CartItem({
  item,
  updateQuantity,
  removeItem,
}: CartItemProps) {
  const [localQuantity, setLocalQuantity] = useState(item.quantity);
  const [isUpdating, setIsUpdating] = useState(false);

  // Sync with external changes
  useEffect(() => {
    setLocalQuantity(item.quantity);
  }, [item.quantity]);

  const handleQuantityUpdate = useCallback(
    async (newQuantity: number) => {
      if (newQuantity < 1 || newQuantity === item.quantity || isUpdating)
        return;

      try {
        setIsUpdating(true);
        const result = await updateCartItem({
          id: item.id,
          quantity: newQuantity,
        });

        if (result.success) {
          setLocalQuantity(newQuantity);
          updateQuantity(item.id, newQuantity);
        } else {
          // Revert on failure
          setLocalQuantity(item.quantity);
        }
      } catch (error) {
        console.error("Update failed:", error);
        setLocalQuantity(item.quantity);
      } finally {
        setIsUpdating(false);
      }
    },
    [item.id, item.quantity, updateQuantity, isUpdating]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value, 10);
      if (!isNaN(value)) {
        handleQuantityUpdate(value);
      }
    },
    [handleQuantityUpdate]
  );

  const handleRemove = useCallback(async () => {
    if (isUpdating) return;

    try {
      setIsUpdating(true);
      const result = await removeFromCart(item.id);
      if (result.success) {
        removeItem(item.id);
      }
    } catch (error) {
      console.error("Remove failed:", error);
    } finally {
      setIsUpdating(false);
    }
  }, [item.id, removeItem, isUpdating]);

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
            onClick={() => handleQuantityUpdate(localQuantity - 1)}
            disabled={isUpdating}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            type="number"
            min="1"
            value={localQuantity}
            onChange={handleInputChange}
            className="h-8 w-12 mx-2 text-center"
            disabled={isUpdating}
          />
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleQuantityUpdate(localQuantity + 1)}
            disabled={isUpdating}
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
        disabled={isUpdating}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
});

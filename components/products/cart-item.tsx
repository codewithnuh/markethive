import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus, X } from "lucide-react";

interface CartItemProps {
  item: {
    id: number;
    name: string;
    price: number;
    quantity: number;
    image: string;
  };
  updateQuantity: (id: number, newQuantity: number) => void;
  removeItem: (id: number) => void;
}

export default function CartItem({
  item,
  updateQuantity,
  removeItem,
}: CartItemProps) {
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
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            type="number"
            min="0"
            value={item.quantity}
            onChange={(e) =>
              updateQuantity(item.id, parseInt(e.target.value, 10))
            }
            className="h-8 w-12 mx-2 text-center"
          />
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="flex-shrink-0"
        onClick={() => removeItem(item.id)}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

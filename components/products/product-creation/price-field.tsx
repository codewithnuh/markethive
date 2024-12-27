import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { ProductFormData } from "./schema";
interface PriceFieldProps {
  register: UseFormRegister<ProductFormData>;
  errors: FieldErrors<ProductFormData>;
}

export function PriceField({ register, errors }: PriceFieldProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor="price">Price</Label>
      <Input
        id="price"
        type="number"
        step="0.01"
        min={0}
        max={999999.99}
        {...register("price", { valueAsNumber: true })}
      />
      {errors.price && (
        <p className="text-sm text-red-500">{errors.price.message}</p>
      )}
    </div>
  );
}

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { ProductFormData } from "./schema";

interface StockFieldProps {
  register: UseFormRegister<ProductFormData>;
  errors: FieldErrors<ProductFormData>;
}

export function StockField({ register, errors }: StockFieldProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor="stock">Stock</Label>
      <Input
        id="stock"
        type="number"
        min={0}
        max={999999}
        {...register("stock", { valueAsNumber: true })}
      />
      {errors.stock && (
        <p className="text-sm text-red-500">{errors.stock.message}</p>
      )}
    </div>
  );
}

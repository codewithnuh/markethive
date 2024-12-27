import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Control, Controller, FieldErrors } from "react-hook-form";
import { ProductFormData, categories } from "./schema";

interface CategoryFieldProps {
  control: Control<ProductFormData>;
  errors: FieldErrors<ProductFormData>;
}

export function CategoryField({ control, errors }: CategoryFieldProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor="category">Category</Label>
      <Controller
        name="category"
        control={control}
        render={({ field }) => (
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      {errors.category && (
        <p className="text-sm text-red-500">{errors.category.message}</p>
      )}
    </div>
  );
}

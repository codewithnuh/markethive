"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import AttributeInput from "@/components/products/attribute-input";
import ImageUpload from "./image-uplaod";

// Define category type for type safety
type Category =
  | "Electronics"
  | "Clothing"
  | "Home & Garden"
  | "Toys"
  | "Books"
  | "Sports";

// Schema definition with strict typing
const productSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description must be 1000 characters or less"),
  category: z.enum([
    "Electronics",
    "Clothing",
    "Home & Garden",
    "Toys",
    "Books",
    "Sports",
  ] as const),
  stock: z
    .number()
    .int()
    .positive("Stock must be a positive number")
    .max(999999, "Stock must be less than 1,000,000"),
  price: z
    .number()
    .positive("Price must be a positive number")
    .max(999999.99, "Price must be less than 1,000,000"),
  attributes: z.array(z.string()).max(10, "Maximum 10 attributes allowed"),
  image: z.instanceof(File).optional(),
});

// Infer types from schema
type ProductFormData = z.infer<typeof productSchema>;

// Define API response types
interface ApiResponse {
  text: string;
  error?: string;
}

// Define categories with type safety
const categories: Category[] = [
  "Electronics",
  "Clothing",
  "Home & Garden",
  "Toys",
  "Books",
  "Sports",
];

export default function ProductCreationForm() {
  const [attributes, setAttributes] = useState<string[]>([]);
  const [isTitleLoading, setIsTitleLoading] = useState<boolean>(false);
  const [isDescriptionLoading, setIsDescriptionLoading] =
    useState<boolean>(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      stock: 0,
      price: 0,
      attributes: [],
    },
  });

  // Watch form fields with explicit typing
  const name = watch("name") as string;
  const description = watch("description") as string;

  // Handle title optimization with type safety
  const handleOptimizeTitle = async (): Promise<void> => {
    if (!name || isTitleLoading) return;

    setIsTitleLoading(true);
    try {
      const response = await fetch("/api/optimize-title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: name }),
      });

      if (!response.ok) throw new Error("Failed to optimize title");

      const data = (await response.json()) as ApiResponse;
      if (typeof data.text === "string") {
        setValue("name", data.text, { shouldValidate: true });
      }
    } catch (error) {
      console.error(
        "Error optimizing title:",
        error instanceof Error ? error.message : "Unknown error"
      );
    } finally {
      setIsTitleLoading(false);
    }
  };

  // Handle description enhancement with type safety
  const handleEnhanceDescription = async (): Promise<void> => {
    if (!description || isDescriptionLoading) return;

    setIsDescriptionLoading(true);
    try {
      const response = await fetch("/api/enhance-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: description }),
      });

      if (!response.ok) throw new Error("Failed to enhance description");

      const data = (await response.json()) as ApiResponse;
      if (typeof data.text === "string") {
        setValue("description", data.text, { shouldValidate: true });
      }
    } catch (error) {
      console.error(
        "Error enhancing description:",
        error instanceof Error ? error.message : "Unknown error"
      );
    } finally {
      setIsDescriptionLoading(false);
    }
  };

  const onSubmit = (data: ProductFormData): void => {
    console.log("Form data:", { ...data, attributes });
    // Handle form submission
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <Card>
        <CardContent className="grid gap-6 pt-6">
          {/* Product Name Field */}
          <div className="grid gap-2">
            <Label htmlFor="name">Product Name</Label>
            <Input id="name" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={handleOptimizeTitle}
              disabled={!name || isTitleLoading}
            >
              {isTitleLoading ? "Optimizing..." : "Optimize Title with AI"}
            </Button>
          </div>

          {/* Description Field */}
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register("description")} />
            {errors.description && (
              <p className="text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={handleEnhanceDescription}
              disabled={!description || isDescriptionLoading}
            >
              {isDescriptionLoading
                ? "Enhancing..."
                : "Enhance Description with AI"}
            </Button>
          </div>

          {/* Category Field */}
          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
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

          {/* Image Upload Field */}
          <div className="grid gap-2">
            <Label htmlFor="image">Product Image</Label>
            <Controller
              name="image"
              control={control}
              render={({ field }) => (
                <ImageUpload
                  onChange={(file) => field.onChange(file)}
                  value={field.value}
                />
              )}
            />
          </div>

          {/* Stock Field */}
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

          {/* Price Field */}
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

          {/* Attributes Field */}
          <div className="grid gap-2">
            <Label htmlFor="attributes">Attributes</Label>
            <AttributeInput
              attributes={attributes}
              setAttributes={setAttributes}
            />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full">
        Create Product
      </Button>
    </form>
  );
}

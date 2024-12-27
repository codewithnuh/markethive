import * as z from "zod";

export type Category =
  | "Electronics"
  | "Clothing"
  | "Home & Garden"
  | "Toys"
  | "Books"
  | "Sports";

export const productSchema = z.object({
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
  attributes: z
    .array(
      z.object({
        key: z.string().min(1, "Key is required"),
        value: z.string().min(1, "Value is required"),
      })
    )
    .max(10, "Maximum 10 attributes allowed"),
  image: z.instanceof(File).optional(),
});

export type ProductFormData = z.infer<typeof productSchema>;

export const categories: Category[] = [
  "Electronics",
  "Clothing",
  "Home & Garden",
  "Toys",
  "Books",
  "Sports",
];

export interface ApiResponse {
  text: string;
  error?: string;
}

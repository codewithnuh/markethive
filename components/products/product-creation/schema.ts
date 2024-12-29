import * as z from "zod";
const attributeSchema = z.object({
  key: z.string(),
  value: z.string(),
});

export type Category =
  | "Electronics"
  | "Laptop"
  | "Smartphone"
  | "Tablet"
  | "Desktop"
  | "Monitor"
  | "Accessories"
  | "Keyboard";

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
    "Laptop",
    "Smartphone",
    "Tablet",
    "Desktop",
    "Monitor",
    "Accessories",
    "Keyboard",
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
  attributes: z.array(attributeSchema).max(10, "Maximum 10 attributes allowed"),
  image: z.instanceof(File).optional(),
});

export type ProductFormData = z.infer<typeof productSchema>;

export const categories: Category[] = [
  "Electronics",
  "Laptop",
  "Smartphone",
  "Tablet",
  "Desktop",
  "Monitor",
  "Accessories",
  "Keyboard",
];

export interface ApiResponse {
  text: string;
  error?: string;
}

"use server";

import { z } from "zod";
import { db } from "@/lib/database/db";
import { revalidatePath } from "next/cache";

// Validation schema
const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  images: z.array(z.string()).optional(),
  price: z.number().min(0, "Price must be greater than or equal to 0"),
  stock: z.number().int().min(0, "Stock must be a non-negative integer"),
  ratings: z.number().min(0).max(5).optional(),
  categoryId: z.string().uuid(),
  attributes: z.array(z.string()).optional(),
});

// Types
type ProductInput = z.infer<typeof productSchema>;

type ProductResponse = {
  success: boolean;
  error?: string;
  data?: {
    id: string;
    name: string;
    price: number;
    stock: number;
    categoryId: string;
  };
};

// Action: Add a product
export async function addProduct(
  input: ProductInput
): Promise<ProductResponse> {
  try {
    // Validate input
    const validatedData = productSchema.safeParse(input);
    if (!validatedData.success) {
      return {
        success: false,
        error: validatedData.error.errors[0]?.message || "Invalid input",
      };
    }

    // Create a new product
    const newProduct = await db.product.create({
      data: {
        ...validatedData.data,
        description: validatedData.data.description ?? "",
        attributes: validatedData.data.attributes ?? [], // Provide a default value of an empty array
      },
      select: {
        id: true,
        name: true,
        price: true,
        stock: true,
        categoryId: true,
      },
    });

    // Revalidate paths
    revalidatePath("/products");

    return {
      success: true,
      data: newProduct,
    };
  } catch (error) {
    console.error("Error adding product:", error);
    return {
      success: false,
      error: "Failed to add product. Please try again.",
    };
  }
}

// Action: Update a product
const updateProductSchema = productSchema.extend({
  id: z.string().uuid(),
});

type UpdateProductInput = z.infer<typeof updateProductSchema>;

export async function updateProduct(
  input: UpdateProductInput
): Promise<ProductResponse> {
  try {
    // Validate input
    const validatedData = updateProductSchema.safeParse(input);
    if (!validatedData.success) {
      return {
        success: false,
        error: validatedData.error.errors[0]?.message || "Invalid input",
      };
    }

    // Check if product exists
    const existingProduct = await db.product.findUnique({
      where: { id: validatedData.data.id },
    });

    if (!existingProduct) {
      return {
        success: false,
        error: "Product not found",
      };
    }

    // Update product
    const updatedProduct = await db.product.update({
      where: { id: validatedData.data.id },
      data: validatedData.data,
      select: {
        id: true,
        name: true,
        price: true,
        stock: true,
        categoryId: true,
      },
    });

    // Revalidate paths
    revalidatePath("/products");

    return {
      success: true,
      data: updatedProduct,
    };
  } catch (error) {
    console.error("Error updating product:", error);
    return {
      success: false,
      error: "Failed to update product. Please try again.",
    };
  }
}

// Action: Get a single product
export async function getProduct(productId: string): Promise<ProductResponse> {
  try {
    const product = await db.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        description: true,
        images: true,
        price: true,
        stock: true,
        ratings: true,
        categoryId: true,
        attributes: true,
      },
    });

    if (!product) {
      return {
        success: false,
        error: "Product not found",
      };
    }

    return {
      success: true,
      data: product,
    };
  } catch (error) {
    console.error("Error fetching product:", error);
    return {
      success: false,
      error: "Failed to fetch product data",
    };
  }
}

// Action: Delete a product
export async function deleteProduct(
  productId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if product exists
    const existingProduct = await db.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return {
        success: false,
        error: "Product not found",
      };
    }

    // Delete product
    await db.product.delete({
      where: { id: productId },
    });

    // Revalidate paths
    revalidatePath("/products");

    return { success: true };
  } catch (error) {
    console.error("Error deleting product:", error);
    return {
      success: false,
      error: "Failed to delete product. Please try again.",
    };
  }
}

// Action: Fetch all products by category
export async function getProductsByCategory(categoryId: string): Promise<{
  success: boolean;
  error?: string;
  data?: ProductResponse["data"][];
}> {
  try {
    const products = await db.product.findMany({
      where: { categoryId },
      select: {
        id: true,
        name: true,
        price: true,
        stock: true,
        categoryId: true,
      },
    });

    return {
      success: true,
      data: products,
    };
  } catch (error) {
    console.error("Error fetching products by category:", error);
    return {
      success: false,
      error: "Failed to fetch products by category",
    };
  }
}

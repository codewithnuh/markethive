"use server";

import { z } from "zod";
import { db } from "@/lib/database/db";
import { revalidatePath } from "next/cache";

/**
 * Product validation schema
 * Defines the required fields and validation rules for a product
 */
const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string(),
  category: z.string(), // Fixed: Changed string() to z.string()
  images: z.array(z.string()),
  price: z.number().min(0, "Price must be greater than or equal to 0"),
  stock: z.number().int().min(0, "Stock must be a non-negative integer"),
  ratings: z.number().min(0).max(5).optional(),
  attributes: z.array(z.object({ key: z.string(), value: z.string() })), // Fixed: Changed to z.array() format
});

/**
 * Type definition for product input data
 */
type ProductInput = z.infer<typeof productSchema>;

/**
 * Type definition for API response when performing product operations
 */
type ProductResponse = {
  success: boolean;
  error?: string;
  data?: {
    id: string;
    name: string;
    price: number;
    stock: number;
  };
};

/**
 * Adds a new product to the database
 * @param input Product data conforming to ProductInput type
 * @returns Promise resolving to ProductResponse
 */
export async function addProduct(
  input: ProductInput
): Promise<ProductResponse> {
  try {
    // Validate input
    const validatedData = productSchema.safeParse(input);
    if (!validatedData.success) {
      // Fixed: Removed console.error of valid data
      console.log(validatedData);
      return {
        success: false,
        error: validatedData.error.errors[0]?.message || "Invalid input",
      };
    }
    console.log(validatedData.data);
    // Create a new product
    const newProduct = await db.product.create({
      data: {
        ...validatedData.data,
        attributes: validatedData.data.attributes || [], // Fixed: Added default empty array for attributes
      },
      select: {
        id: true,
        name: true,
        price: true,
        stock: true,
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

/**
 * Schema for updating an existing product
 * Extends the base product schema to include an ID
 */
const updateProductSchema = productSchema.extend({
  id: z.string().uuid(),
});

/**
 * Type definition for product update input data
 */
type UpdateProductInput = z.infer<typeof updateProductSchema>;

/**
 * Updates an existing product in the database
 * @param input Product data with ID conforming to UpdateProductInput type
 * @returns Promise resolving to ProductResponse
 */
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

/**
 * Retrieves a single product from the database
 * @param productId UUID of the product to retrieve
 * @returns Promise resolving to ProductResponse
 */
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

/**
 * Deletes a product from the database
 * @param productId UUID of the product to delete
 * @returns Promise resolving to success/error response
 */
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

"use server";

import { z } from "zod";
import { db } from "@/lib/database/db";

/**
 * Product validation schema
 * Defines the required fields and validation rules for a product
 */
const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description must be 1000 characters or less"),
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
export type ProductResponse = {
  success: boolean;
  error?: string;
  data?: {
    id: string;
    name: string;
    price: number;
    stock: number;
  };
};
export type SingleProductResponse = {
  success: boolean;
  error?: string;
  data?: {
    id: string;
    name: string;
    price: number;
    stock: number;
    description: string;
    category?: string;
    images: string[];
    ratings?: number;
    discountedPrice?: number;
    attributes: Array<{ key: string; value: string }>;
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
  id: z.string(),
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
export async function getProduct(
  productId: string
): Promise<SingleProductResponse> {
  try {
    // Fetch the product by ID
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
        category: true,
        attributes: true, // This is of type Json in your schema
      },
    });

    if (!product) {
      return {
        success: false,
        error: "Product not found",
      };
    }

    // Fetch the active discount (if any)
    const discount = await db.discount.findFirst();
    const discountPercentage = discount?.discount || 0; // Default to 0 if no discount is found

    // Calculate discounted price if a valid discount is present
    const discountedPrice =
      discountPercentage > 0 && discountPercentage <= 100
        ? product.price * (1 - discountPercentage / 100)
        : undefined;

    // Transform the attributes property
    const attributes = Array.isArray(product.attributes)
      ? product.attributes
          .map((attribute) => {
            if (
              typeof attribute === "object" &&
              attribute !== null &&
              "key" in attribute &&
              "value" in attribute
            ) {
              return {
                key: String(attribute.key),
                value: String(attribute.value),
              };
            }
            return { key: "", value: "" };
          })
          .filter((attribute) => attribute.key !== "") // Filter out empty objects
      : [];

    return {
      success: true,
      data: {
        ...product,
        attributes,
        discountedPrice, // Include the discounted price if applicable
      },
    };
  } catch (error: unknown) {
    console.error("Error fetching product:", error);

    // Prisma-specific error handling
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P1001") {
        return {
          success: false,
          error:
            "Unable to connect to the database. Please check your database connection settings or the database status.",
        };
      }
      return {
        success: false,
        error: `Prisma error: ${error.message}`,
      };
    }

    // Handle any unknown or general errors
    if (error instanceof Error) {
      return {
        success: false,
        error: `Unexpected error: ${error.message}`,
      };
    }

    // Fallback for any other unknown errors
    return {
      success: false,
      error: "An unknown error occurred while retrieving the product.",
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
    // Check if the product exists
    const product = await db.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return { success: false, error: "Product not found" };
    }

    // Use a transaction to delete all related data in the correct order
    await db.$transaction(async (transaction) => {
      // Delete cart items related to the product
      await transaction.cartItem.deleteMany({
        where: { productId },
      });

      // Delete order items related to the product
      await transaction.orderItem.deleteMany({
        where: { productId },
      });

      // Finally, delete the product itself
      await transaction.product.delete({
        where: { id: productId },
      });
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting product:", error);
    return {
      success: false,
      error: "Failed to delete product. Please try again.",
    };
  }
}

import { Prisma } from "@prisma/client";

/**
 * Retrieves all products from the database
 * @returns Promise resolving to a list of products or an error response
 */
export async function getAllProducts(): Promise<{
  success: boolean;
  data?: Array<{
    id: string;
    name: string;
    description: string;
    images: string[];
    price: number;
    discountedPrice?: number;
    stock: number;
    ratings?: number;
    category: string;
    attributes: Array<{ key: string; value: string }>;
  }>;
  error?: string;
}> {
  try {
    // Fetch all products from the database
    const products = await db.product.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        images: true,
        price: true,
        stock: true,
        ratings: true,
        category: true,
        attributes: true, // This is of type Json in your schema
      },
    });

    // Fetch the active discount (if any)
    const discount = await db.discount.findFirst();
    const discountPercentage = discount?.discount || 0; // Default to 0 if no discount is found

    // Transform products to include discounted price
    const transformedProducts = products.map((product) => {
      const attributes = Array.isArray(product.attributes)
        ? product.attributes.map((attribute) => {
            if (
              typeof attribute === "object" &&
              attribute !== null &&
              "key" in attribute &&
              "value" in attribute
            ) {
              return {
                key: String(attribute.key),
                value: String(attribute.value),
              };
            }
            throw new Error(
              `Invalid attribute format for product ID ${product.id}`
            );
          })
        : [];

      // Calculate discounted price if a valid discount is present
      const discountedPrice =
        discountPercentage > 0 && discountPercentage <= 100
          ? product.price * (1 - discountPercentage / 100)
          : undefined;

      return {
        ...product,
        attributes,
        discountedPrice, // Add discounted price if applicable
      };
    });

    return {
      success: true,
      data: transformedProducts,
    };
  } catch (error: unknown) {
    console.error("Error fetching products:", error);

    // Prisma-specific error handling
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P1001") {
        return {
          success: false,
          error:
            "Unable to connect to the database. Please check your database connection settings or the database status.",
        };
      }
      return {
        success: false,
        error: `Prisma error: ${error.message}`,
      };
    }

    // Handle any unknown or general errors
    if (error instanceof Error) {
      return {
        success: false,
        error: `Unexpected error: ${error.message}`,
      };
    }

    // Fallback for any other unknown errors
    return {
      success: false,
      error: "An unknown error occurred while retrieving products.",
    };
  }
}

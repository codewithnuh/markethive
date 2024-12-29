// lib/actions/cart/actions.ts
"use server";

import { db } from "@/lib/database/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

/**
 * Cart Item Input Schema
 * @property {string} productId - The ID of the product to add to cart
 * @property {number} quantity - The quantity of the product (must be positive)
 */
const cartItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive("Quantity must be positive"),
});

type CartItemInput = z.infer<typeof cartItemSchema>;

/**
 * Response type for addToCart action
 * @property {boolean} success - Indicates if the operation was successful
 * @property {string} [error] - Error message if operation failed
 * @property {Object} [data] - Cart item data if operation succeeded
 */
type AddToCartResponse = {
  success: boolean;
  error?: string;
  data?: {
    id: string;
    quantity: number;
    product: {
      id: string;
      name: string;
      price: number;
    };
  };
};

/**
 * Adds an item to the user's cart
 * @param {CartItemInput} input - The product ID and quantity to add
 * @returns {Promise<AddToCartResponse>} The result of the cart operation
 */
export async function addToCart(
  input: CartItemInput
): Promise<AddToCartResponse> {
  try {
    // Get authenticated user
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        error: "Please sign in to add items to cart",
      };
    }

    // Validate input
    const validatedData = cartItemSchema.safeParse(input);
    if (!validatedData.success) {
      return {
        success: false,
        error: validatedData.error.errors[0]?.message || "Invalid input",
      };
    }

    // Get or create user's cart
    let cart = await db.cart.findFirst({
      where: { userId },
    });

    if (!cart) {
      cart = await db.cart.create({
        data: { userId },
      });
    }

    // Check if product exists and has enough stock
    const product = await db.product.findUnique({
      where: { id: validatedData.data.productId },
    });

    if (!product) {
      return {
        success: false,
        error: "Product not found",
      };
    }

    if (product.stock < validatedData.data.quantity) {
      return {
        success: false,
        error: "Not enough stock available",
      };
    }

    // Check if item already exists in cart
    const existingCartItem = await db.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: validatedData.data.productId,
      },
    });

    let cartItem;

    if (existingCartItem) {
      // Update existing cart item
      cartItem = await db.cartItem.update({
        where: { id: existingCartItem.id },
        data: {
          quantity: existingCartItem.quantity + validatedData.data.quantity,
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
            },
          },
        },
      });
    } else {
      // Create new cart item
      cartItem = await db.cartItem.create({
        data: {
          cartId: cart.id,
          productId: validatedData.data.productId,
          quantity: validatedData.data.quantity,
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
            },
          },
        },
      });
    }

    // Revalidate cart page
    revalidatePath("/cart");

    return {
      success: true,
      data: cartItem,
    };
  } catch (error) {
    console.error("Error adding to cart:", error);
    return {
      success: false,
      error: "Failed to add item to cart",
    };
  }
}
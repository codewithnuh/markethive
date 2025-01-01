// lib/actions/cart/actions.ts
"use server";

import { db } from "@/lib/database/db";
import { auth } from "@clerk/nextjs/server";
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
    console.log(userId);

    if (!cart) {
      cart = await db.cart.create({
        data: { userId },
      });
    }
    console.log(cart);
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

/**
 * Response type for getCart action
 */
type GetCartResponse = {
  success: boolean;
  error?: string;
  data?: Array<{
    id: string;
    quantity: number;
    product: {
      id: string;
      name: string;
      price: number;
      images: string[];
    };
  }>;
};

/**
 * Retrieves all items in the user's cart
 * @returns {Promise<GetCartResponse>} The cart items or error response
 */
export async function getCart(): Promise<GetCartResponse> {
  try {
    // Get authenticated user
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        error: "Please sign in to view cart",
      };
    }

    // Get user's cart
    const cart = await db.cart.findFirst({
      where: { userId },
    });

    if (!cart) {
      return {
        success: true,
        data: [], // Return empty array if no cart exists
      };
    }

    // Get cart items with product details
    const cartItems = await db.cartItem.findMany({
      where: {
        cartId: cart.id,
      },
      select: {
        id: true,
        quantity: true,
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            images: true,
          },
        },
      },
    });

    return {
      success: true,
      data: cartItems,
    };
  } catch (error) {
    console.error("Error fetching cart:", error);
    return {
      success: false,
      error: "Failed to fetch cart items",
    };
  }
}

/**
 * Response type for cart item operations
 */
type CartItemResponse = {
  success: boolean;
  error?: string;
};

/**
 * Updates the quantity of a cart item
 * @param {Object} input - Update input data
 * @param {string} input.id - Cart item ID
 * @param {number} input.quantity - New quantity
 */

export async function updateCartItem(input: {
  id: string;
  quantity: number;
}): Promise<CartItemResponse> {
  try {
    await db.cartItem.update({
      where: { id: input.id },
      data: { quantity: input.quantity },
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating cart item:", error);
    return {
      success: false,
      error: "Failed to update cart item",
    };
  }
}

/**
 * Removes an item from the cart
 * @param {string} id - Cart item ID to remove
 */
export async function removeFromCart(id: string): Promise<CartItemResponse> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        error: "Please sign in to remove items",
      };
    }

    // Delete cart item
    await db.cartItem.delete({
      where: {
        id,
        cart: {
          userId,
        },
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Error removing cart item:", error);
    return {
      success: false,
      error: "Failed to remove cart item",
    };
  }
}

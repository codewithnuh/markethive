"use server";

import { auth } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/database/db";

/**
 * Response type for checkout order operations
 */
type CheckoutOrderResponse = {
  success: boolean;
  error?: string;
  url?: string;
};

/**
 * Response type for successful checkout handling
 */
type CheckoutSuccessResponse = {
  success: boolean;
  orderId: string;
};

/**
 * Custom error types
 */
class CheckoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CheckoutError";
  }
}

class SessionMetadataError extends CheckoutError {
  constructor() {
    super("Missing required metadata in the session");
  }
}

class CartError extends CheckoutError {
  constructor() {
    super("Cart not found or is empty");
  }
}

/**
 * Creates a Stripe checkout session for the user's cart items with optional discounts
 * @returns Promise<CheckoutOrderResponse>
 */
export async function createCheckoutSession(): Promise<CheckoutOrderResponse> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        error: "Please sign in to checkout",
      };
    }

    // Fetch user's cart
    const cart = await db.cart.findFirst({
      where: { userId },
      include: {
        cartItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                images: true,
              },
            },
          },
        },
      },
    });

    if (!cart || cart.cartItems.length === 0) {
      return {
        success: false,
        error: "Your cart is empty",
      };
    }

    // Fetch active discount (if any)
    const discount = await db.discount.findFirst();
    const discountPercentage = discount?.discount || 0;

    // Create Stripe checkout session
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "amazon_pay"],
      line_items: cart.cartItems.map((item) => {
        const originalPrice = item.product.price;
        const finalPrice =
          discountPercentage > 0 && discountPercentage <= 100
            ? originalPrice * (1 - discountPercentage / 100)
            : originalPrice;

        return {
          price_data: {
            currency: "usd",
            product_data: {
              name: item.product.name,
              images: [item.product.images[0] || ""],
            },
            unit_amount: Math.round(finalPrice * 100), // Convert to cents
          },
          quantity: item.quantity,
        };
      }),
      mode: "payment",
      metadata: {
        cartId: cart.id,
        userId: userId,
      },
      shipping_address_collection: {
        allowed_countries: ["US", "CA"],
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
    });

    if (stripeSession.url) {
      return {
        success: true,
        url: stripeSession.url,
      };
    }

    return {
      success: false,
      error: "Failed to create Stripe session",
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message || "Failed to create checkout session",
      };
    }
    return {
      success: false,
      error: "Failed to create checkout session",
    };
  }
}

/**
 * Handles successful checkout by creating an order and clearing the cart
 * @param sessionId - The Stripe checkout session ID
 * @returns Promise<CheckoutSuccessResponse>
 * @throws CheckoutError if session metadata is missing or cart cannot be found
 */
export async function handleCheckoutSuccess(
  sessionId: string
): Promise<CheckoutSuccessResponse> {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const { cartId, userId } = session.metadata || {};

    if (!cartId || !userId) {
      throw new SessionMetadataError();
    }

    // Retrieve cart
    const cart = await db.cart.findUnique({
      where: { id: cartId },
      include: {
        cartItems: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart || !cart.cartItems.length) {
      throw new CartError();
    }

    // Fetch active discount (if any)
    const discount = await db.discount.findFirst();
    const discountPercentage = discount?.discount || 0;

    // Calculate total price with discount
    const totalPrice = cart.cartItems.reduce((total, item) => {
      const originalPrice = item.product.price;
      const finalPrice =
        discountPercentage > 0 && discountPercentage <= 100
          ? originalPrice * (1 - discountPercentage / 100)
          : originalPrice;
      return total + finalPrice * item.quantity;
    }, 0);

    // Create order
    const order = await db.order.create({
      data: {
        userId: userId,
        totalPrice, // Final total price after discounts
        status: "PROCESSING",
        orderItems: {
          create: cart.cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price, // Store original product price
          })),
        },
      },
    });

    // Clear the cart
    await db.cart.delete({
      where: { id: cartId },
    });

    return {
      success: true,
      orderId: order.id,
    };
  } catch (error) {
    if (error instanceof CheckoutError) {
      throw error;
    }
    throw new CheckoutError("Failed to handle checkout success");
  }
}

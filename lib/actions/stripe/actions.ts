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
        allowed_countries: ["US", "CA", "PK"],
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/products`,
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
        paymentMethod: "STRIPE",
        paymentStatus: "PAID",
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

export async function createOrder({
  sessionId,
  paymentMethod,
  paymentAddress,
  cartId,
  userId,
}: {
  sessionId?: string;
  paymentMethod: "CASH_ON_DELIVERY" | "STRIPE";
  paymentAddress?: {
    name: string;
    address: string;
    countryName: string;
    postalCode: string;
  };
  cartId?: string;
  userId?: string;
}) {
  try {
    let totalPrice = 0;
    let discountPercentage = 0;
    let finalUserId = userId;
    let finalCartId = cartId;
    let paymentStatus: "PENDING" | "PAID" = "PENDING";
    let paymentAddressId: string | undefined;

    // Previous Stripe and COD logic remains the same...
    if (paymentMethod === "STRIPE") {
      if (!sessionId)
        throw new Error("Session ID is required for Stripe payments");

      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (!session || session.payment_status !== "paid") {
        throw new Error("Stripe payment not successful");
      }

      const { cartId: metadataCartId, userId: metadataUserId } =
        session.metadata || {};
      if (!metadataCartId || !metadataUserId) {
        throw new Error("Missing cartId or userId in Stripe session metadata");
      }

      finalCartId = metadataCartId;
      finalUserId = metadataUserId;
      paymentStatus = "PAID";

      const { address, name } = session.shipping_details || {};
      const savedAddress = await db.paymentAddress.create({
        data: {
          name: name || "Unknown",
          address: address?.line1 || "Unknown",
          countryName: address?.country || "Unknown",
          postalCode: address?.postal_code || "Unknown",
        },
      });

      paymentAddressId = savedAddress.id;
    } else if (paymentMethod === "CASH_ON_DELIVERY") {
      if (!finalCartId || !paymentAddress || !finalUserId) {
        throw new Error(
          "Cart ID, payment address, and user ID are required for Cash on Delivery"
        );
      }

      const savedAddress = await db.paymentAddress.create({
        data: paymentAddress,
      });

      paymentAddressId = savedAddress.id;
    } else {
      throw new Error("Unsupported payment method");
    }

    // Wrap all database operations in a transaction
    const result = await db.$transaction(async (tx) => {
      // Retrieve cart and items
      const cart = await tx.cart.findUnique({
        where: { id: finalCartId },
        include: {
          cartItems: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!cart || !cart.cartItems.length) {
        throw new Error("Cart is empty or not found");
      }

      // Calculate total price with discount
      const discount = await tx.discount.findFirst();
      discountPercentage =
        discount?.discount && discount.discount > 0 && discount.discount <= 100
          ? discount.discount
          : 0;

      totalPrice = cart.cartItems.reduce((total, item) => {
        const originalPrice = item.product.price;
        const finalPrice = originalPrice * (1 - discountPercentage / 100);
        return total + finalPrice * item.quantity;
      }, 0);

      // Create order first
      const order = await tx.order.create({
        data: {
          userId: finalUserId!,
          totalPrice,
          status: "PROCESSING",
          paymentMethod,
          paymentStatus,
          paymentAddressId,
          orderItems: {
            create: cart.cartItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price,
            })),
          },
        },
      });

      // Update product stats within the same transaction
      for (const item of cart.cartItems) {
        if (!item.quantity || !item.product.price) {
          console.error(
            `[createOrder] Invalid quantity or price for Product ID=${item.productId}`,
            { quantity: item.quantity, price: item.product.price }
          );
          continue;
        }

        const incrementQuantity = Number(item.quantity);
        const incrementRevenue =
          Number(item.quantity) * Number(item.product.price);

        await tx.product.update({
          where: { id: item.productId },
          data: {
            totalSold: { increment: incrementQuantity },
            totalRevenue: { increment: incrementRevenue },
          },
        });
      }

      // Delete cart after everything else succeeds
      await tx.cart.delete({
        where: { id: finalCartId },
      });

      return order;
    });

    return {
      success: true,
      orderId: result.id,
    };
  } catch (error) {
    console.error("[createOrder] Error creating order:", error);
    return {
      success: false,
      message: "Error creating order",
      err: error,
    };
  }
}

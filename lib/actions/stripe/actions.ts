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

export async function createOrder({
  sessionId,
  paymentMethod,
  paymentAddress,
  cartId,
  userId, // userId will be passed for COD
}: {
  sessionId?: string; // Only needed for Stripe
  paymentMethod: "CASH_ON_DELIVERY" | "STRIPE";
  paymentAddress?: {
    name: string;
    address: string;
    countryName: string;
    postalCode: string;
  }; // For Cash on Delivery
  cartId: string; // Only passed for both cases (for COD or Stripe)
  userId?: string; // userId passed as prop for COD
}) {
  try {
    let totalPrice = 0;
    let discountPercentage = 0;
    let finalUserId: string;

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
      throw new Error("Cart is empty or not found");
    }

    // Fetch active discount (if any)
    const discount = await db.discount.findFirst();
    discountPercentage = discount?.discount || 0;

    // Calculate total price with discount
    totalPrice = cart.cartItems.reduce((total, item) => {
      const originalPrice = item.product.price;
      const finalPrice =
        discountPercentage > 0 && discountPercentage <= 100
          ? originalPrice * (1 - discountPercentage / 100)
          : originalPrice;
      return total + finalPrice * item.quantity;
    }, 0);

    // Handle payment method
    let paymentStatus: "PENDING" | "PAID" = "PENDING";
    let paymentAddressId: string | undefined;

    if (paymentMethod === "STRIPE") {
      // For Stripe, fetch session and confirm payment
      const session = await stripe.checkout.sessions.retrieve(sessionId!);

      if (!session || session.payment_status !== "paid") {
        throw new Error("Stripe payment not successful");
      }

      // Retrieve cartId and userId from session metadata
      const { cartId: metadataCartId, userId: metadataUserId } =
        session.metadata || {};
      if (!metadataCartId || !metadataUserId) {
        throw new Error("Missing cartId or userId in Stripe session metadata");
      }

      // Ensure that the cartId from metadata matches the one in the request
      if (metadataCartId !== cartId) {
        throw new Error("CartId mismatch between request and Stripe session");
      }

      // Use userId from session metadata
      finalUserId = metadataUserId;
      paymentStatus = "PAID";

      // Check if shipping details exist and are valid
      if (!session.shipping_details || !session.shipping_details.address) {
        throw new Error("Shipping address is incomplete or missing");
      }
      const { address, name } = session.shipping_details;

      // Save the shipping address
      const savedAddress = await db.paymentAddress.create({
        data: {
          name: name!, // Use the "name" from shipping details
          address: address.line1!, // Use line1 as the primary address
          countryName: address.country!, // Map "country" from the address
          postalCode: address.postal_code!, // Map "postal_code" from the address
        },
      });

      paymentAddressId = savedAddress.id;
    } else if (paymentMethod === "CASH_ON_DELIVERY") {
      // For Cash on Delivery, save the provided address
      if (!paymentAddress || !userId) {
        throw new Error(
          "Payment address and userId are required for Cash on Delivery"
        );
      }

      // Use the provided userId and payment address
      finalUserId = userId;

      const savedAddress = await db.paymentAddress.create({
        data: {
          name: paymentAddress.name,
          address: paymentAddress.address,
          countryName: paymentAddress.countryName,
          postalCode: paymentAddress.postalCode,
        },
      });

      paymentAddressId = savedAddress.id;
    }

    // Create the order
    const order = await db.order.create({
      data: {
        userId: finalUserId,
        totalPrice, // Final total price after discounts
        status: "PROCESSING",
        paymentMethod,
        paymentStatus,
        paymentAddressId, // Link address
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
    console.error(error);
    throw new Error("Failed to create order");
  }
}

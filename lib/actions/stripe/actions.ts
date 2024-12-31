"use server";

import { auth } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/database/db";

type CheckoutOrderResponse = {
  success: boolean;
  error?: string;
  url?: string;
};

export async function createCheckoutSession(): Promise<CheckoutOrderResponse> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        error: "Please sign in to checkout",
      };
    }

    // Get user's cart items with product details
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

    // Create Stripe checkout session
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: cart.cartItems.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.product.name,
            images: [item.product.images[0] || ""], // Ensure images array is safe
          },
          unit_amount: Math.round(item.product.price * 100), // Convert to cents
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      metadata: {
        cartId: cart.id,
        userId: userId,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
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
    console.error("Checkout error:", error);
    return {
      success: false,
      error: "Failed to create checkout session",
    };
  }
}

// Handle successful checkout
export async function handleCheckoutSuccess(sessionId: string) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const { cartId, userId } = session.metadata || {};

    if (!cartId || !userId) {
      throw new Error("Missing required metadata in the session");
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
      throw new Error("Cart not found or is empty");
    }

    // Create order
    const order = await db.order.create({
      data: {
        userId,
        totalPrice: session.amount_total ? session.amount_total / 100 : 0, // Convert back to dollars
        status: "PROCESSING",
        orderItems: {
          create: cart.cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
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
    console.error("Error handling checkout success:", error);
    throw new Error("Failed to handle checkout success");
  }
}

// lib/actions/order/actions.ts
"use server";

import { PaymentStatus } from "@/components/admin/order-list";
import { db } from "@/lib/database/db";

export async function getAllOrders() {
  try {
    const orders = await db.order.findMany({
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        orderItems: {
          include: {
            product: {
              select: {
                name: true,
                price: true,
              },
            },
          },
        },
        paymentAddress: {
          // Including payment address details
          select: {
            name: true,
            address: true,
            countryName: true,
            postalCode: true,
          },
        },
      },
    });

    return {
      success: true,
      data: orders.map((order) => ({
        ...order,
        paymentMethod: order.paymentMethod, // Payment method (e.g., "CASH_ON_DELIVERY", "STRIPE")
        paymentStatus: order.paymentStatus, // Payment status (e.g., "PENDING", "PAID", "FAILED")
      })),
    };
  } catch (error) {
    console.error("Error fetching orders:", error);
    return {
      success: false,
      error: "Failed to fetch orders",
    };
  }
}

// lib/actions/order/actions.ts
enum OrderStatus {
  Processing = "PROCESSING",
  Shipping = "SHIPPING",
  Shipped = "SHIPPED",
}
export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus
) {
  try {
    const updatedOrder = await db.order.update({
      where: { id: orderId },
      data: {
        status: newStatus,
      },
    });
    return { success: true, data: updatedOrder };
  } catch (error) {
    console.error("Error updating order status:", error);
    return { success: false, error: "Failed to update order status" };
  }
}

export async function getAllSingleUserOrders({ userId }: { userId: string }) {
  try {
    const orders = await db.order.findMany({
      where: {
        userId,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        orderItems: {
          include: {
            product: {
              select: {
                name: true,
                price: true,
              },
            },
          },
        },
      },
    });
    return {
      success: true,
      data: orders,
    };
  } catch (error) {
    console.error("Error fetching orders:", error);
    return {
      success: false,
      error: "Failed to fetch orders",
    };
  }
}

export async function updatePaymentStatus(
  orderId: string,
  newStatus: PaymentStatus
) {
  try {
    const updatedOrder = await db.order.update({
      where: { id: orderId },
      data: { paymentStatus: newStatus },
    });

    return { success: true, data: updatedOrder };
  } catch (error) {
    console.error("Failed to update payment status:", error);
    return { success: false, error: "Failed to update payment status" };
  }
}

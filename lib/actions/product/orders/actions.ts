// lib/actions/order/actions.ts
"use server";

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

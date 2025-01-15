"use server";
import { db } from "@/lib/database/db";
export async function getTotalRevenueAndSales() {
  try {
    const result = await db.product.aggregate({
      _sum: {
        totalRevenue: true,
        totalSold: true,
      },
    });

    return {
      success: true,
      totalRevenue: result._sum.totalRevenue || 0,
      totalSold: result._sum.totalSold || 0,
    };
  } catch (error) {
    console.error("[getTotalRevenueAndSales] Error fetching data:", error);
    return {
      success: false,
      message: "Error fetching revenue and sales data",
    };
  }
}

export async function getBestSellingProducts(limit = 10) {
  try {
    const products = await db.product.findMany({
      orderBy: {
        totalSold: "desc",
      },
      take: limit, // Limit to top 'N' products
      select: {
        id: true,
        name: true,
        totalSold: true,
        totalRevenue: true,
        price: true,
      },
    });

    return {
      success: true,
      products,
    };
  } catch (error) {
    console.error("[getBestSellingProducts] Error fetching data:", error);
    return {
      success: false,
      message: "Error fetching best-selling products",
    };
  }
}
export async function getRevenueByCategory() {
  try {
    const revenueByCategory = await db.product.groupBy({
      by: ["category"],
      _sum: {
        totalRevenue: true,
      },
      orderBy: {
        _sum: {
          totalRevenue: "desc",
        },
      },
    });

    return {
      success: true,
      revenueByCategory,
    };
  } catch (error) {
    console.error("[getRevenueByCategory] Error fetching data:", error);
    return {
      success: false,
      message: "Error fetching revenue by category",
    };
  }
}
export async function getSalesTrends() {
  try {
    const salesTrends = await db.order.groupBy({
      by: ["createdAt"],
      _sum: {
        totalPrice: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return {
      success: true,
      salesTrends,
    };
  } catch (error) {
    console.error("[getSalesTrends] Error fetching data:", error);
    return {
      success: false,
      message: "Error fetching sales trends",
    };
  }
}
export async function getCustomerOrderStats(limit = 10) {
  try {
    const customerStats = await db.user.findMany({
      include: {
        orders: {
          select: {
            totalPrice: true,
          },
        },
      },
    });

    const formattedStats = customerStats.map((customer) => {
      const totalOrders = customer.orders.length;
      const totalRevenue = customer.orders.reduce(
        (sum, order) => sum + order.totalPrice,
        0
      );
      const averageOrderValue = totalRevenue / totalOrders || 0;

      return {
        customerId: customer.id,
        name: `${customer.firstName} ${customer.lastName}`,
        totalOrders,
        totalRevenue,
        averageOrderValue,
      };
    });

    return {
      success: true,
      customers: formattedStats
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, limit),
    };
  } catch (error) {
    console.error("[getCustomerOrderStats] Error fetching data:", error);
    return {
      success: false,
      message: "Error fetching customer order statistics",
    };
  }
}
export async function getProductPerformance(limit = 10) {
  try {
    const products = await db.product.findMany({
      orderBy: [{ ratings: "desc" }, { totalSold: "desc" }],
      take: limit,
      select: {
        id: true,
        name: true,
        ratings: true,
        totalSold: true,
        totalRevenue: true,
      },
    });

    return {
      success: true,
      products,
    };
  } catch (error) {
    console.error("[getProductPerformance] Error fetching data:", error);
    return {
      success: false,
      message: "Error fetching product performance insights",
    };
  }
}

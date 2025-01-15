// Type for the user data response
export type UserData = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  clerkId: string;
  createdAt: Date;
  updatedAt: Date;
};
// Type for best-selling products
type BestSellingProduct = {
  name: string;
  totalSold: number;
  totalRevenue: number;
};

// Type for revenue by category
type RevenueByCategory = {
  category: string;
  value: number;
};

// Type for sales trends
type SalesTrend = {
  date: string; // Date in string format (e.g., "2025-01-07")
  sales: number;
};

// Type for customer order stats
type OrderStat = {
  name: string;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: string; // string type due to the formatting of the decimal number in the example
};

// Main type for the entire structure
export type SalesData = {
  bestSellingProducts: BestSellingProduct[];
  revenueByCategory: RevenueByCategory[];
  salesTrends: SalesTrend[];
  orderStats: OrderStat[];
  totalRevenueAndSales: number;
  totalRevenueAndSold: number;
};

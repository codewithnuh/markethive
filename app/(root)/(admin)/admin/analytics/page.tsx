import { AnalyticsDashboard } from "@/components/admin/analytics/analytics-dashboard";
import {
  getTotalRevenueAndSales,
  getBestSellingProducts,
  getRevenueByCategory,
  getSalesTrends,
  getCustomerOrderStats,
} from "@/lib/actions/analytics/actions"; // Update path as necessary

export default async function AnalyticsPage() {
  // Fetch data from all the server actions
  const [
    totalRevenueAndSalesResponse,
    bestSellingProductsResponse,
    revenueByCategoryResponse,
    salesTrendsResponse,
    customerOrderStatsResponse,
  ] = await Promise.all([
    getTotalRevenueAndSales(),
    getBestSellingProducts(5), // Fetch top 5 products
    getRevenueByCategory(),
    getSalesTrends(),
    getCustomerOrderStats(3), // Fetch top 3 customers
  ]);

  // Handle any errors in the responses
  if (!totalRevenueAndSalesResponse.success)
    throw new Error("Error fetching total revenue and sales");
  if (!bestSellingProductsResponse.success)
    throw new Error("Error fetching best-selling products");
  if (!revenueByCategoryResponse.success)
    throw new Error("Error fetching revenue by category");
  if (!salesTrendsResponse.success)
    throw new Error("Error fetching sales trends");
  if (!customerOrderStatsResponse.success)
    throw new Error("Error fetching customer order statistics");

  // Format the data into the desired structure
  const data = {
    bestSellingProducts:
      bestSellingProductsResponse.products?.map((product) => ({
        name: product.name,
        totalSold: product.totalSold,
        totalRevenue: product.totalRevenue,
      })) || [],
    revenueByCategory:
      revenueByCategoryResponse.revenueByCategory?.map((category) => ({
        category: category.category,
        value: category._sum.totalRevenue || 0,
      })) || [],
    salesTrends:
      salesTrendsResponse.salesTrends?.map((trend) => ({
        date: new Date(trend.createdAt).toISOString().split("T")[0], // Format as YYYY-MM-DD
        sales: trend._sum.totalPrice || 0,
      })) || [],
    orderStats:
      customerOrderStatsResponse.customers?.map((customer) => ({
        name: customer.name,
        totalOrders: customer.totalOrders,
        totalRevenue: customer.totalRevenue,
        averageOrderValue: customer.averageOrderValue.toFixed(2), // Format to 2 decimal places
      })) || [],
    totalRevenueAndSales: totalRevenueAndSalesResponse.totalRevenue || 0,
    totalRevenueAndSold: totalRevenueAndSalesResponse.totalSold || 0,
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="border-b border-border">
        <div className="flex h-16 items-center px-4">
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        </div>
      </div>
      <AnalyticsDashboard data={data} />
    </div>
  );
}

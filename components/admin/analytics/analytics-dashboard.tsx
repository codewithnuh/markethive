"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTheme } from "next-themes";
import { SalesData } from "@/types";

export function AnalyticsDashboard({ data }: { data: SalesData }) {
  const { theme } = useTheme();
  const chartColors = {
    bar: theme === "dark" ? "#60a5fa" : "#2563eb",
    line: theme === "dark" ? "#60a5fa" : "#2563eb",
    pie: ["#2563eb", "#60a5fa", "#93c5fd", "#bfdbfe", "#dbeafe"],
  };
  return (
    <div className="flex-col pb-12">
      <div className="flex-1 space-y-8 p-4 md:p-8 pt-6">
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="bg-secondary/50 p-1 rounded-full h-12">
            <TabsTrigger value="overview" className="rounded-full px-8 h-10 data-[state=active]:bg-background transition-all">Overview</TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-full px-8 h-10 data-[state=active]:bg-background transition-all">Analytics</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-8 mt-0">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="rounded-[2rem] border-none shadow-none bg-secondary/30">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Total Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold tracking-tight">
                    ${data.totalRevenueAndSales.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-[2rem] border-none shadow-none bg-secondary/30">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Total Items Sold
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold tracking-tight">
                    {data.totalRevenueAndSold}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-full lg:col-span-4 rounded-[2.5rem] border-none shadow-none bg-secondary/20">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Best Selling Products</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={data.bestSellingProducts}>
                      <XAxis
                        dataKey="name"
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `$${value}`}
                      />
                      <Tooltip />
                      <Bar
                        dataKey="totalRevenue"
                        fill={chartColors.bar}
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card className="col-span-full lg:col-span-3 rounded-[2.5rem] border-none shadow-none bg-secondary/20">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Revenue by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={data.revenueByCategory}
                        dataKey="value"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        label
                      >
                        {data.revenueByCategory.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              chartColors.pie[index % chartColors.pie.length]
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-full lg:col-span-4 rounded-[2.5rem] border-none shadow-none bg-secondary/20">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Sales Trends</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={data.salesTrends}>
                      <XAxis
                        dataKey="date"
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `$${value}`}
                      />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="sales"
                        stroke={chartColors.line}
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card className="col-span-full lg:col-span-3 rounded-[2.5rem] border-none shadow-none bg-secondary/20">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Top Customers</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-none hover:bg-transparent bg-secondary/30">
                        <TableHead className="font-bold uppercase tracking-widest text-[10px]">Name</TableHead>
                        <TableHead className="font-bold uppercase tracking-widest text-[10px]">Orders</TableHead>
                        <TableHead className="font-bold uppercase tracking-widest text-[10px] text-right">Revenue</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.orderStats.map((customer) => (
                        <TableRow key={customer.name} className="border-b border-border/50 hover:bg-secondary/10 transition-colors">
                          <TableCell className="font-bold">{customer.name}</TableCell>
                          <TableCell className="font-medium text-muted-foreground">{customer.totalOrders}</TableCell>
                          <TableCell className="text-right font-bold">
                            ${customer.totalRevenue.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
              <Card className="bg-card text-card-foreground">
                <CardHeader>
                  <CardTitle>Revenue Over Time</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={data.salesTrends}>
                      <XAxis
                        dataKey="date"
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#888888"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `$${value}`}
                      />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="sales"
                        stroke={chartColors.line}
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card className="bg-card text-card-foreground">
                <CardHeader>
                  <CardTitle>Category Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={data.revenueByCategory}
                        dataKey="value"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        label
                      >
                        {data.revenueByCategory.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              chartColors.pie[index % chartColors.pie.length]
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

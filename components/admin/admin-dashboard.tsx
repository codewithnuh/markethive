import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { UsersList } from "./user-list";
import { Order, OrdersList } from "./order-list";
import { DiscountsManager } from "./discount-manager";
import { ProductsList } from "./product-list";
import { getAllProducts } from "@/lib/actions/product/actions";

export type User = {
  role: string;
  email: string;
  clerkId: string;
  firstName: string;
  lastName: string;
};

// Order Type

export async function AdminDashboard({
  users,
  orders,
  page,
  pageSize,
}: {
  users: User[];
  orders: Order[];
  page?: number;
  pageSize?: number;
}) {
  const products = await getAllProducts({
    pageSize: pageSize || 12,
    page: page || 1,
  });

  return (
    <div className="container mx-auto py-12 px-4 space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Management</h1>
          <p className="text-xl text-muted-foreground">Oversee your store operations and customers.</p>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-8">
        <TabsList className="bg-secondary/50 p-1 rounded-full h-12 inline-flex">
          <TabsTrigger value="users" className="rounded-full px-8 h-10 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">Users</TabsTrigger>
          <TabsTrigger value="products" className="rounded-full px-8 h-10 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">Products</TabsTrigger>
          <TabsTrigger value="orders" className="rounded-full px-8 h-10 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">Orders</TabsTrigger>
          <TabsTrigger value="discounts" className="rounded-full px-8 h-10 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all">Discounts</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-0">
          <Card className="rounded-[2.5rem] border-none shadow-none bg-secondary/20 p-8">
            <UsersList users={users} />
          </Card>
        </TabsContent>

        <TabsContent value="products" className="mt-0">
           <Card className="rounded-[2.5rem] border-none shadow-none bg-secondary/20 p-8">
            <ProductsList
              allProducts={products}
              pageSize={pageSize}
              page={page}
            />
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="mt-0">
           <Card className="rounded-[2.5rem] border-none shadow-none bg-secondary/20 p-8">
            <OrdersList ordersData={orders} />
          </Card>
        </TabsContent>

        <TabsContent value="discounts" className="mt-0">
           <Card className="rounded-[2.5rem] border-none shadow-none bg-secondary/20 p-8">
            <DiscountsManager />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="discounts">Discounts</TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <UsersList users={users} />
        </TabsContent>
        <TabsContent value="products">
          {/* You need to check if products.data is not undefined and if its length is greater than 0. */}
          <ProductsList
            allProducts={products}
            pageSize={pageSize}
            page={page}
          />
        </TabsContent>
        <TabsContent value="orders">
          <OrdersList ordersData={orders} />
        </TabsContent>
        <TabsContent value="discounts">
          <DiscountsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}

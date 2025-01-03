import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UsersList } from "./user-list";
import { OrdersList } from "./order-list";
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
type Order = {
  id: string;
  userId: string;
  status: string;
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
  user: {
    firstName: string;
    lastName: string;
  };
  orderItems: {
    id: string;
    orderId: string;
    productId: string;
    quantity: number;
    price: number;
    createdAt: Date;
    updatedAt: Date;
    product: {
      name: string;
      price: number;
    };
  }[];
};
export async function AdminDashboard({
  users,
  orders,
}: {
  users: User[];
  orders: Order[];
}) {
  const products = await getAllProducts();

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
          <ProductsList initialProducts={products.data ? products.data : []} />
        </TabsContent>
        <TabsContent value="orders">
          <OrdersList orders={orders} />
        </TabsContent>
        <TabsContent value="discounts">
          <DiscountsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}

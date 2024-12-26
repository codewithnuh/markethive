import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UsersList } from "./user-list";
import { OrdersList } from "./order-list";
import { DiscountsManager } from "./discount-manager";

export function AdminDashboard() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="discounts">Discounts</TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <UsersList />
        </TabsContent>
        <TabsContent value="orders">
          <OrdersList />
        </TabsContent>
        <TabsContent value="discounts">
          <DiscountsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { getAllOrders } from "@/lib/actions/product/orders/actions";
import { getAllUsers } from "@/lib/actions/user/actions";
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;
export default async function AdminPage(props: { searchParams: SearchParams }) {
  const users = await getAllUsers();
  const orders = await getAllOrders();
  const searchParams = await props.searchParams;
  const page =
    typeof searchParams.page === "string"
      ? parseInt(searchParams.page, 10)
      : undefined;
  const pageSize =
    typeof searchParams.pageSize === "string"
      ? parseInt(searchParams.pageSize, 10)
      : undefined;
  return (
    <main>
      <AdminDashboard
        users={users.data!}
        orders={orders.data ? orders.data : []}
        page={page}
        pageSize={pageSize}
      />
    </main>
  );
}

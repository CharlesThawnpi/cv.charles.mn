import AdminDashboardClient from "./AdminDashboardClient";
import { requireAdminSession } from "@/utils/adminSession";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await requireAdminSession();

  return <AdminDashboardClient />;
}


import { LayoutDashboard, Users, Store, Package, Tag } from "lucide-react";
import DashboardShell from "./DashboardShell";

const LINKS = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/shops", label: "Shops", icon: Store },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: Tag },
];

export default function AdminLayout() {
  return <DashboardShell heading="Admin" links={LINKS} />;
}

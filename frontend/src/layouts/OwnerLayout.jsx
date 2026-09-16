import { useNavigate } from "react-router-dom";
import { LayoutDashboard, Store, Package, Plus, Images, User, Settings, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import DashboardShell from "./DashboardShell";

export default function OwnerLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const LINKS = [
    { to: "/owner/dashboard", label: "Overview", icon: LayoutDashboard, end: true },
    { to: "/owner/shop", label: "My Shop", icon: Store },
    { to: "/owner/products", label: "Products", icon: Package },
    { to: "/owner/products/create", label: "Add Product", icon: Plus },
    { to: "/owner/photos", label: "Photos", icon: Images },
    { to: "/owner/profile", label: "Profile", icon: User },
    { to: "/owner/settings", label: "Settings", icon: Settings },
    {
      label: "Logout",
      icon: LogOut,
      onClick: () => {
        logout();
        navigate("/");
      },
    },
  ];

  return <DashboardShell heading="Shop Owner" links={LINKS} />;
}

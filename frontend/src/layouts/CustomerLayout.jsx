import { LayoutDashboard, Heart, Clock, User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardShell from "./DashboardShell";
import { useAuth } from "../context/AuthContext";

export default function CustomerLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const links = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/favorites", label: "Favorites", icon: Heart },
    { to: "/recently-viewed", label: "Recently Viewed", icon: Clock },
    { to: "/profile", label: "Profile", icon: User },
    {
      label: "Logout",
      icon: LogOut,
      onClick: () => {
        logout();
        navigate("/");
      },
    },
  ];

  return <DashboardShell heading="My Account" links={links} />;
}

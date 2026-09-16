import { Users, Store, Package, Star, ShieldCheck, Clock } from "lucide-react";

import { useAsync } from "../../hooks/useAsync";
import { fetchAdminStats } from "../../services/adminService";
import { LoadingSkeleton, ErrorState } from "../../components/ui";

export default function AdminDashboard() {
  const { data, loading, error, retry } = useAsync(() => fetchAdminStats(), []);

  if (loading) return <LoadingSkeleton count={6} className="grid-cols-2 sm:grid-cols-3" />;
  if (error) return <ErrorState onRetry={retry} />;

  const stats = [
    { label: "Total Users", value: data?.totalUsers ?? 0, icon: Users, tone: "blue" },
    { label: "Total Shops", value: data?.totalShops ?? 0, icon: Store, tone: "green" },
    { label: "Active Shops", value: data?.activeShops ?? 0, icon: ShieldCheck, tone: "green" },
    { label: "Pending Verification", value: data?.pendingShops ?? 0, icon: Clock, tone: "yellow" },
    { label: "Total Products", value: data?.totalProducts ?? 0, icon: Package, tone: "purple" },
    { label: "Total Reviews", value: data?.totalReviews ?? 0, icon: Star, tone: "orange" },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-primary mb-6">Overview</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white border border-border rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
                <Icon className="w-4 h-4 text-accent" />
              </div>
              <p className="text-sm text-secondary">{label}</p>
            </div>
            <p className="text-3xl font-bold text-primary">{value.toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

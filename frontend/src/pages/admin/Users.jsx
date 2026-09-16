import { useState } from "react";

import { useAsync } from "../../hooks/useAsync";
import { useToast } from "../../context/ToastContext";
import { fetchAdminUsers, updateUserRole, toggleUserActive } from "../../services/adminService";
import { Avatar, Badge, Button, Pagination, LoadingSkeleton, ErrorState } from "../../components/ui";
import { useDebounce } from "../../hooks/useDebounce";

const ROLES = ["customer", "shop_owner", "admin"];

export default function AdminUsers() {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const { data, loading, error, retry } = useAsync(
    () => fetchAdminUsers({ page, limit: 15, search: debouncedSearch, role: roleFilter }),
    [page, debouncedSearch, roleFilter]
  );

  const handleRoleChange = async (userId, role) => {
    try {
      await updateUserRole(userId, role);
      toast.success("Role updated.");
      retry();
    } catch (err) {
      toast.error(err.message || "Could not update role.");
    }
  };

  const handleToggleActive = async (user) => {
    try {
      await toggleUserActive(user._id, !user.isActive);
      toast.success(user.isActive ? "User deactivated." : "User activated.");
      retry();
    } catch (err) {
      toast.error(err.message || "Could not update user.");
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-primary mb-6">Users</h1>

      <div className="flex flex-wrap gap-3 mb-5">
        <input
          type="search"
          placeholder="Search name or email…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 min-w-48 rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-primary placeholder:text-secondary/70 focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="">All roles</option>
          {ROLES.map((r) => <option key={r} value={r}>{r.replace("_", " ")}</option>)}
        </select>
      </div>

      {loading && <LoadingSkeleton count={8} />}
      {error && <ErrorState onRetry={retry} />}

      {!loading && !error && (
        <>
          <div className="bg-white border border-border rounded-2xl overflow-hidden">
            {data?.users?.length === 0 && (
              <p className="text-sm text-secondary text-center py-10">No users found.</p>
            )}
            {data?.users?.map((user, i) => (
              <div key={user._id} className={`flex items-center gap-4 px-4 py-3 ${i !== 0 ? "border-t border-border" : ""}`}>
                <Avatar src={user.avatar} name={user.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-primary truncate">{user.name}</p>
                  <p className="text-xs text-secondary truncate">{user.email}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge tone={user.isActive ? "success" : "danger"}>{user.isActive ? "Active" : "Inactive"}</Badge>
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                    className="text-xs rounded-lg border border-border bg-white px-2 py-1.5 text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    {ROLES.map((r) => <option key={r} value={r}>{r.replace("_", " ")}</option>)}
                  </select>
                  <Button
                    size="sm"
                    variant={user.isActive ? "ghost" : "outline"}
                    className={user.isActive ? "text-danger hover:bg-danger/5" : ""}
                    onClick={() => handleToggleActive(user)}
                  >
                    {user.isActive ? "Deactivate" : "Activate"}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <Pagination page={page} totalPages={data?.pagination?.totalPages} onPageChange={setPage} />
          </div>
        </>
      )}
    </div>
  );
}

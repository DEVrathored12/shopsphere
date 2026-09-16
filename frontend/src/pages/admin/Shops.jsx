import { useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Trash2 } from "lucide-react";

import { useAsync } from "../../hooks/useAsync";
import { useToast } from "../../context/ToastContext";
import { fetchAdminShops, toggleShopVerified, adminDeleteShop } from "../../services/adminService";
import { Badge, Button, Pagination, LoadingSkeleton, ErrorState, ConfirmDialog } from "../../components/ui";
import { useDebounce } from "../../hooks/useDebounce";

export default function AdminShops() {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const debouncedSearch = useDebounce(search, 400);

  const { data, loading, error, retry } = useAsync(
    () => fetchAdminShops({ page, limit: 15, search: debouncedSearch }),
    [page, debouncedSearch]
  );

  const handleVerify = async (shop) => {
    try {
      await toggleShopVerified(shop._id, !shop.isVerified);
      toast.success(shop.isVerified ? "Verification removed." : "Shop verified.");
      retry();
    } catch (err) {
      toast.error(err.message || "Could not update shop.");
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await adminDeleteShop(toDelete._id);
      toast.success("Shop deleted.");
      retry();
    } catch (err) {
      toast.error(err.message || "Could not delete shop.");
    } finally {
      setDeleting(false);
      setToDelete(null);
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-primary mb-6">Shops</h1>

      <input
        type="search"
        placeholder="Search shops…"
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        className="w-full max-w-sm rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-primary placeholder:text-secondary/70 focus:outline-none focus:ring-2 focus:ring-accent mb-5"
      />

      {loading && <LoadingSkeleton count={8} />}
      {error && <ErrorState onRetry={retry} />}

      {!loading && !error && (
        <>
          <div className="bg-white border border-border rounded-2xl overflow-hidden">
            {data?.shops?.length === 0 && (
              <p className="text-sm text-secondary text-center py-10">No shops found.</p>
            )}
            {data?.shops?.map((shop, i) => (
              <div key={shop._id} className={`flex items-center gap-4 px-4 py-3 ${i !== 0 ? "border-t border-border" : ""}`}>
                {shop.coverImage ? (
                  <img src={shop.coverImage} alt={shop.shopName} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-border/40 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <Link to={`/shop/${shop._id}`} className="font-medium text-primary hover:text-accent truncate block">
                    {shop.shopName}
                  </Link>
                  <p className="text-xs text-secondary truncate">
                    {shop.city} · {shop.ownerId?.name} ({shop.ownerId?.email})
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge tone={shop.isActive ? "success" : "danger"}>{shop.isActive ? "Active" : "Inactive"}</Badge>
                  {shop.isVerified && <Badge tone="accent">Verified</Badge>}
                  <Button
                    size="sm"
                    variant={shop.isVerified ? "outline" : "primary"}
                    icon={ShieldCheck}
                    onClick={() => handleVerify(shop)}
                  >
                    {shop.isVerified ? "Unverify" : "Verify"}
                  </Button>
                  <Button size="sm" variant="ghost" icon={Trash2} className="text-danger hover:bg-danger/5" onClick={() => setToDelete(shop)} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <Pagination page={page} totalPages={data?.pagination?.totalPages} onPageChange={setPage} />
          </div>
        </>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        onCancel={() => setToDelete(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete shop?"
        description={`"${toDelete?.shopName}" and all its products will be permanently deleted.`}
        confirmLabel="Delete Shop"
      />
    </div>
  );
}

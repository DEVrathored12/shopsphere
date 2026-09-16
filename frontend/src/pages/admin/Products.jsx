import { useState } from "react";
import { Link } from "react-router-dom";
import { Trash2, Package } from "lucide-react";

import { useAsync } from "../../hooks/useAsync";
import { useToast } from "../../context/ToastContext";
import { fetchAdminProducts, adminDeleteProduct } from "../../services/adminService";
import { Badge, Button, Pagination, LoadingSkeleton, ErrorState, ConfirmDialog } from "../../components/ui";
import { formatPrice } from "../../utils/format";
import { useDebounce } from "../../hooks/useDebounce";

export default function AdminProducts() {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const debouncedSearch = useDebounce(search, 400);

  const { data, loading, error, retry } = useAsync(
    () => fetchAdminProducts({ page, limit: 15, search: debouncedSearch }),
    [page, debouncedSearch]
  );

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await adminDeleteProduct(toDelete._id);
      toast.success("Product deleted.");
      retry();
    } catch (err) {
      toast.error(err.message || "Could not delete product.");
    } finally {
      setDeleting(false);
      setToDelete(null);
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-primary mb-6">Products</h1>

      <input
        type="search"
        placeholder="Search products…"
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        className="w-full max-w-sm rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-primary placeholder:text-secondary/70 focus:outline-none focus:ring-2 focus:ring-accent mb-5"
      />

      {loading && <LoadingSkeleton count={8} />}
      {error && <ErrorState onRetry={retry} />}

      {!loading && !error && (
        <>
          <div className="bg-white border border-border rounded-2xl overflow-hidden">
            {data?.products?.length === 0 && (
              <p className="text-sm text-secondary text-center py-10">No products found.</p>
            )}
            {data?.products?.map((product, i) => (
              <div key={product._id} className={`flex items-center gap-4 px-4 py-3 ${i !== 0 ? "border-t border-border" : ""}`}>
                {product.images?.[0] ? (
                  <img src={product.images[0]} alt={product.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-border/40 flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 text-secondary/40" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${product._id}`} className="font-medium text-primary hover:text-accent truncate block">
                    {product.name}
                  </Link>
                  <p className="text-xs text-secondary truncate">
                    {product.shopId?.shopName} · {product.categoryId?.name} · {formatPrice(product)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge tone={product.isActive ? "success" : "danger"}>{product.isActive ? "Active" : "Hidden"}</Badge>
                  <Badge tone={product.availability === "available" ? "neutral" : "danger"}>
                    {product.availability === "available" ? "In stock" : "Out of stock"}
                  </Badge>
                  <Button size="sm" variant="ghost" icon={Trash2} className="text-danger hover:bg-danger/5" onClick={() => setToDelete(product)} />
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
        title="Delete product?"
        description={`"${toDelete?.name}" will be permanently deleted.`}
        confirmLabel="Delete"
      />
    </div>
  );
}

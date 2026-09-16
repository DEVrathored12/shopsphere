import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, Package, Eye, EyeOff } from "lucide-react";

import { useAsync } from "../../hooks/useAsync";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { fetchShops } from "../../services/shopService";
import { fetchProducts, deleteProduct, updateProduct } from "../../services/productService";
import { LoadingSkeleton, EmptyState, ErrorState, Badge, Button, Pagination, ConfirmDialog } from "../../components/ui";
import { formatPrice } from "../../utils/format";

export default function OwnerProducts() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(null);

  const shopData = useAsync(() => fetchShops({ ownerId: user?._id, limit: 1 }), [user?._id]);
  const shop = shopData.data?.shops?.[0] ?? null;

  const { data, loading, error, retry } = useAsync(
    () => (shop ? fetchProducts({ shopId: shop._id, page, limit: 10 }) : Promise.resolve(null)),
    [shop?._id, page]
  );

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteProduct(toDelete._id);
      toast.success("Product deleted.");
      retry();
    } catch (err) {
      toast.error(err.message || "Could not delete product.");
    } finally {
      setDeleting(false);
      setToDelete(null);
    }
  };

  const handleToggleVisibility = async (product) => {
    setToggling(product._id);
    try {
      await updateProduct(product._id, { isActive: !product.isActive });
      toast.success(product.isActive ? "Product hidden." : "Product visible.");
      retry();
    } catch (err) {
      toast.error(err.message || "Could not update product.");
    } finally {
      setToggling(null);
    }
  };

  if (shopData.loading) return <LoadingSkeleton count={4} />;

  if (!shop) {
    return (
      <EmptyState
        title="No shop found."
        description="Create your shop first before adding products."
        action={{ label: "Create Shop", onClick: () => navigate("/owner/shop/create") }}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-primary">Products</h1>
        <Button icon={Plus} onClick={() => navigate("/owner/products/create")}>Add Product</Button>
      </div>

      {loading && <LoadingSkeleton count={5} />}
      {error && <ErrorState onRetry={retry} />}

      {!loading && !error && !data?.products?.length && (
        <EmptyState
          title="No products yet."
          description="Add your first product to start showcasing your catalog."
          action={{ label: "Add Product", onClick: () => navigate("/owner/products/create") }}
        />
      )}

      {!loading && data?.products?.length > 0 && (
        <>
          <div className="bg-white border border-border rounded-2xl overflow-hidden">
            {data.products.map((product, i) => (
              <div
                key={product._id}
                className={`flex items-center gap-4 px-4 py-3 ${i !== 0 ? "border-t border-border" : ""}`}
              >
                {product.images?.[0] ? (
                  <img src={product.images[0]} alt={product.name} className="w-12 h-12 rounded-lg object-cover shrink-0" loading="lazy" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-border/40 flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 text-secondary/40" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-primary truncate">{product.name}</p>
                  <p className="text-sm text-secondary">{formatPrice(product)}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0flex-wrap">
                  <Badge tone={product.availability === "available" ? "success" : "danger"}>
                    {product.availability === "available" ? "In stock" : "Out of stock"}
                  </Badge>
                  <Badge tone={product.isActive ? "neutral" : "danger"}>
                    {product.isActive ? "Active" : "Hidden"}
                  </Badge>
                  <Link to={`/owner/products/${product._id}/edit`}>
                    <Button size="sm" variant="ghost" icon={Pencil} aria-label="Edit" />
                  </Link>
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={product.isActive ? EyeOff : Eye}
                    aria-label={product.isActive ? "Hide" : "Show"}
                    loading={toggling === product._id}
                    onClick={() => handleToggleVisibility(product)}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={Trash2}
                    className="text-danger hover:bg-danger/5"
                    aria-label="Delete"
                    onClick={() => setToDelete(product)}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <Pagination page={page} totalPages={data.pagination?.totalPages} onPageChange={setPage} />
          </div>
        </>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        onCancel={() => setToDelete(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete product?"
        description={`"${toDelete?.name}" will be permanently removed. This action cannot be undone.`}
        confirmLabel="Delete"
      />
    </div>
  );
}

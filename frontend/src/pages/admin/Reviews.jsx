import { useState } from "react";
import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";

import { useAsync } from "../../hooks/useAsync";
import { useToast } from "../../context/ToastContext";
import { fetchAdminReviews, adminDeleteReview } from "../../services/adminService";
import { Avatar, Rating, Button, Pagination, LoadingSkeleton, ErrorState, ConfirmDialog } from "../../components/ui";

export default function AdminReviews() {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const { data, loading, error, retry } = useAsync(
    () => fetchAdminReviews({ page, limit: 15 }),
    [page]
  );

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await adminDeleteReview(toDelete._id);
      toast.success("Review deleted.");
      retry();
    } catch (err) {
      toast.error(err.message || "Could not delete review.");
    } finally {
      setDeleting(false);
      setToDelete(null);
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-primary mb-6">Reviews</h1>

      {loading && <LoadingSkeleton count={8} />}
      {error && <ErrorState onRetry={retry} />}

      {!loading && !error && (
        <>
          <div className="bg-white border border-border rounded-2xl overflow-hidden">
            {data?.reviews?.length === 0 && (
              <p className="text-sm text-secondary text-center py-10">No reviews found.</p>
            )}
            {data?.reviews?.map((review, i) => (
              <div key={review._id} className={`flex items-start gap-4 px-4 py-3 ${i !== 0 ? "border-t border-border" : ""}`}>
                <Avatar src={review.userId?.avatar} name={review.userId?.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-primary">{review.userId?.name || "Deleted user"}</p>
                    <span className="text-xs text-secondary">on</span>
                    <Link to={`/shop/${review.shopId?._id}`} className="text-sm text-accent hover:underline truncate">
                      {review.shopId?.shopName || "Unknown shop"}
                    </Link>
                    <span className="text-xs text-secondary ml-auto shrink-0">
                      {new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  <Rating value={review.rating} />
                  {review.comment && <p className="text-sm text-secondary mt-1 line-clamp-2">{review.comment}</p>}
                </div>
                <Button size="sm" variant="ghost" icon={Trash2} className="text-danger hover:bg-danger/5 shrink-0" onClick={() => setToDelete(review)} />
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
        title="Delete review?"
        description="This review will be permanently deleted and the shop's rating will be recalculated."
        confirmLabel="Delete"
      />
    </div>
  );
}

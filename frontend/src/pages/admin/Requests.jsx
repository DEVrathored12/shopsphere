import { useState } from "react";
import { ToggleLeft, ToggleRight, ImageOff } from "lucide-react";

import { useAsync } from "../../hooks/useAsync";
import { useToast } from "../../context/ToastContext";
import { fetchAdminRequests, adminToggleRequest } from "../../services/adminService";
import { Avatar, Badge, Button, Pagination, LoadingSkeleton, ErrorState } from "../../components/ui";

export default function AdminRequests() {
  const toast = useToast();
  const [page, setPage] = useState(1);

  const { data, loading, error, retry } = useAsync(
    () => fetchAdminRequests({ page, limit: 15 }),
    [page]
  );

  const handleToggle = async (request) => {
    try {
      await adminToggleRequest(request._id);
      toast.success(request.isActive ? "Request deactivated." : "Request activated.");
      retry();
    } catch (err) {
      toast.error(err.message || "Could not update request.");
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-primary mb-6">Item Requests</h1>

      {loading && <LoadingSkeleton count={8} />}
      {error && <ErrorState onRetry={retry} />}

      {!loading && !error && (
        <>
          <div className="bg-white border border-border rounded-2xl overflow-hidden">
            {data?.requests?.length === 0 && (
              <p className="text-sm text-secondary text-center py-10">No requests found.</p>
            )}
            {data?.requests?.map((req, i) => (
              <div key={req._id} className={`flex items-start gap-4 px-4 py-3 ${i !== 0 ? "border-t border-border" : ""}`}>
                {req.photo ? (
                  <img src={req.photo} alt="request" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-border/40 flex items-center justify-center shrink-0">
                    <ImageOff className="w-5 h-5 text-secondary/40" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Avatar src={req.customerId?.avatar} name={req.customerId?.name} size="xs" />
                    <p className="text-sm font-medium text-primary">{req.customerId?.name || "Unknown"}</p>
                    <span className="text-xs text-secondary">{req.customerId?.email}</span>
                    {req.shopId && (
                      <Badge tone="accent" className="text-xs">→ {req.shopId.shopName}</Badge>
                    )}
                    {!req.shopId && <Badge tone="neutral" className="text-xs">Broadcast</Badge>}
                    <span className="text-xs text-secondary ml-auto shrink-0">
                      {new Date(req.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  <p className="text-sm text-secondary mt-1 line-clamp-2">{req.description}</p>
                  <p className="text-xs text-secondary mt-0.5">
                    {req.responses?.length || 0} response{req.responses?.length !== 1 ? "s" : ""} · {req.messages?.length || 0} message{req.messages?.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge tone={req.isActive ? "success" : "danger"}>{req.isActive ? "Active" : "Closed"}</Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={req.isActive ? ToggleRight : ToggleLeft}
                    className={req.isActive ? "text-success hover:bg-success/5" : "text-secondary"}
                    onClick={() => handleToggle(req)}
                    title={req.isActive ? "Deactivate" : "Activate"}
                  />
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

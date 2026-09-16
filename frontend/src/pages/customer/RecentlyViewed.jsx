import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";

import RecentItemCard from "../../components/cards/RecentItemCard";
import { Button, LoadingSkeleton, EmptyState, ConfirmDialog } from "../../components/ui";
import { getRecentlyViewed, removeRecentlyViewed, clearRecentlyViewed } from "../../services/recentlyViewedService";
import { useAsync } from "../../hooks/useAsync";

export default function RecentlyViewed() {
  const navigate = useNavigate();
  const { data, loading, retry } = useAsync(() => getRecentlyViewed(), []);
  const [confirmClear, setConfirmClear] = useState(false);

  const items = data || [];

  const handleRemove = useCallback(
    async (target) => {
      await removeRecentlyViewed(target);
      retry();
    },
    [retry]
  );

  const handleClear = async () => {
    await clearRecentlyViewed();
    setConfirmClear(false);
    retry();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-primary">Recently Viewed</h1>
        {items.length > 0 && (
          <Button variant="ghost" size="sm" icon={Trash2} className="text-danger hover:bg-danger/5" onClick={() => setConfirmClear(true)}>
            Clear All
          </Button>
        )}
      </div>

      {loading && <LoadingSkeleton count={8} className="grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" />}

      {!loading && items.length === 0 && (
        <EmptyState
          title="Nothing viewed yet."
          description="Shops and products you look at will show up here — stored on this device."
          action={{ label: "Explore Shops", onClick: () => navigate("/explore") }}
        />
      )}

      {!loading && items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <RecentItemCard key={`${item.type}-${item.id}`} item={item} onRemove={handleRemove} />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={confirmClear}
        onCancel={() => setConfirmClear(false)}
        onConfirm={handleClear}
        title="Clear recently viewed?"
        description="This removes your browsing history on this device. This action cannot be undone."
        confirmLabel="Clear All"
      />
    </div>
  );
}

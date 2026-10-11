import { useState, useEffect, useCallback } from "react";
import { getMyRequests } from "../services/requestService";

const SEEN_KEY = "shopsphere_seen_responses";

function getSeenIds() {
  try { return new Set(JSON.parse(localStorage.getItem(SEEN_KEY)) || []); } catch { return new Set(); }
}

function saveSeenIds(set) {
  try { localStorage.setItem(SEEN_KEY, JSON.stringify([...set])); } catch {}
}

export function useNotifications(enabled) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    try {
      const { requests } = await getMyRequests();
      const seen = getSeenIds();
      const items = [];
      (requests || []).forEach((req) => {
        (req.responses || []).forEach((resp) => {
          if (resp.status === "yes") {
            const id = `${req._id}_${resp.shopId?._id || resp._id}`;
            items.push({
              id,
              requestDescription: req.description,
              shopName: resp.shopId?.shopName || "A shop",
              shopId: resp.shopId?._id,
              requestId: req._id,
              seen: seen.has(id),
            });
          }
        });
      });
      setNotifications(items);
      setUnreadCount(items.filter((n) => !n.seen).length);
    } catch {}
  }, [enabled]);

  // Poll on mount and every 60s
  useEffect(() => {
    if (!enabled) return;
    refresh();
    const interval = setInterval(refresh, 60000);
    return () => clearInterval(interval);
  }, [enabled, refresh]);

  const markAllRead = useCallback(() => {
    const seen = getSeenIds();
    notifications.forEach((n) => seen.add(n.id));
    saveSeenIds(seen);
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, seen: true })));
  }, [notifications]);

  return { notifications, unreadCount, refresh, markAllRead };
}

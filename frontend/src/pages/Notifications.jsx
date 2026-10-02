import { useEffect, useRef, useState, useCallback } from "react";
import NotificationItem from "../components/NotificationItem";
import { API_URL } from "../config";

async function fetchNotifications(page) {
  const res = await fetch(`${API_URL}/notifications?page=${page}&limit=20`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to load notifications");
  return res.json();
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const sentinelRef = useRef(null);
  const isFetchingRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (isFetchingRef.current || isLoading || !hasMore) return;
    isFetchingRef.current = true;
    setIsLoading(true);

    try {
      const { notifications: newOnes, hasMore: more } =
        await fetchNotifications(page);
      setNotifications((prev) => {
        const existingIds = new Set(prev.map((n) => n.id));
        return [...prev, ...newOnes.filter((n) => !existingIds.has(n.id))];
      });
      setHasMore(more);
      setPage((p) => p + 1);
    } catch (err) {
      console.error(err);
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
    }
  }, [page, isLoading, hasMore]);

  useEffect(() => {
    loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => entries[0].isIntersecting && loadMore(),
      { rootMargin: "200px" },
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [loadMore]);

  const handleRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const markAllRead = async () => {
    try {
      await fetch(`${API_URL}/notifications/read-all`, {
        method: "PATCH",
        credentials: "include",
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center justify-between p-5 border-b border-base-300">
        <h1 className="text-xl font-bold">Notifications</h1>
        <button onClick={markAllRead} className="btn btn-ghost btn-sm">
          Mark all read
        </button>
      </div>

      {notifications.length === 0 && !isLoading ? (
        <p className="text-center text-secondary py-10">
          No notifications yet.
        </p>
      ) : (
        notifications.map((n) => (
          <NotificationItem key={n.id} notification={n} onRead={handleRead} />
        ))
      )}

      {isLoading && (
        <div className="flex justify-center py-8">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      )}

      <div ref={sentinelRef} className="h-1" />
    </div>
  );
}

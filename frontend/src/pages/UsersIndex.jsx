import { useEffect, useRef, useState, useCallback } from "react";
import { Search } from "lucide-react";
import UserCard from "../components/UserCard";
import { API_URL } from "../config";

async function fetchUsers(page, search) {
  const params = new URLSearchParams({ page, limit: 12 });
  if (search) params.set("search", search);

  const res = await fetch(`${API_URL}/users?${params}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to load users");
  return res.json();
}

export default function UsersIndex() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const sentinelRef = useRef(null);
  const isFetchingRef = useRef(false);
  const searchRef = useRef(search);

  // Debounce search input -> search state
  useEffect(() => {
    const timeout = setTimeout(() => setSearch(searchInput.trim()), 350);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  // Reset list whenever the debounced search term changes
  useEffect(() => {
    searchRef.current = search;
    setUsers([]);
    setPage(1);
    setHasMore(true);
    isFetchingRef.current = false;
  }, [search]);

  const loadMore = useCallback(async () => {
    if (isFetchingRef.current || isLoading || !hasMore) return;

    isFetchingRef.current = true;
    setIsLoading(true);
    const requestedSearch = search;

    try {
      const { users: newUsers, hasMore: more } = await fetchUsers(page, search);

      if (searchRef.current !== requestedSearch) return; // stale response, discard

      setUsers((prev) => {
        const existingIds = new Set(prev.map((u) => u.id));
        return [...prev, ...newUsers.filter((u) => !existingIds.has(u.id))];
      });
      setHasMore(more);
      setPage((p) => p + 1);
    } catch (err) {
      console.error(err);
    } finally {
      isFetchingRef.current = false;
      if (searchRef.current === requestedSearch) setIsLoading(false);
    }
  }, [page, search, isLoading, hasMore]);

  useEffect(() => {
    if (users.length === 0 && hasMore) loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, users.length, hasMore, loadMore]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => entries[0].isIntersecting && loadMore(),
      { rootMargin: "200px" },
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-md mx-auto mb-6">
        <label className="input input-bordered flex items-center gap-2 bg-base-200 w-full">
          <Search size={18} className="text-secondary" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search users..."
            className="grow"
          />
        </label>
      </div>

      {users.length === 0 && !isLoading ? (
        <p className="text-center text-secondary py-10">No users found.</p>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
          {users.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center py-8">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      )}

      {!hasMore && users.length > 0 && (
        <p className="text-center text-secondary text-sm py-6">
          That's everyone.
        </p>
      )}

      <div ref={sentinelRef} className="h-1" />
    </div>
  );
}

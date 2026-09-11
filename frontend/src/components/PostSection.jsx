import { useEffect, useRef, useState, useCallback } from "react";
import Post from "./Post";
import { API_URL } from "../config";

async function fetchPosts(page, feedType, authorId) {
  const params = new URLSearchParams({ page, limit: 5 });
  if (authorId) {
    params.set("authorId", authorId);
  } else {
    params.set("feed", feedType);
  }

  const res = await fetch(`${API_URL}/posts?${params}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to load posts");
  return res.json();
}

export default function PostSection({ feedType = "recent", authorId = null }) {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const sentinelRef = useRef(null);
  const isFetchingRef = useRef(false);
  const keyRef = useRef(authorId || feedType); // tracks which "mode" a request belongs to

  const currentKey = authorId || feedType;

  useEffect(() => {
    keyRef.current = currentKey;
    setPosts([]);
    setPage(1);
    setHasMore(true);
    isFetchingRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentKey]);

  const loadMore = useCallback(async () => {
    if (isFetchingRef.current || isLoading || !hasMore) return;

    isFetchingRef.current = true;
    setIsLoading(true);
    const requestedKey = currentKey;

    try {
      const { posts: newPosts, hasMore: more } = await fetchPosts(
        page,
        feedType,
        authorId,
      );

      if (keyRef.current !== requestedKey) return;

      setPosts((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const filteredNew = newPosts.filter((p) => !existingIds.has(p.id));
        return [...prev, ...filteredNew];
      });

      setHasMore(more);
      setPage((p) => p + 1);
    } catch (err) {
      console.error(err);
    } finally {
      isFetchingRef.current = false;
      if (keyRef.current === requestedKey) {
        setIsLoading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, feedType, authorId, isLoading, hasMore]);

  useEffect(() => {
    if (posts.length === 0 && hasMore) {
      loadMore();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentKey, posts.length, hasMore, loadMore]);

  useEffect(() => {
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [loadMore]);

  const handleVote = async (postId, nextVote) => {
    try {
      const res = await fetch(`${API_URL}/posts/${postId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ type: nextVote }),
      });
      if (!res.ok) throw new Error("Vote failed");
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return (
    <div>
      {posts.map((post) => (
        <Post key={post.id} post={post} onVote={handleVote} />
      ))}

      {isLoading && (
        <div className="flex justify-center py-8">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      )}

      {!hasMore && posts.length > 0 && (
        <p className="text-center text-secondary text-sm py-6">
          You've reached the end.
        </p>
      )}

      {!hasMore && posts.length === 0 && !isLoading && (
        <p className="text-center text-secondary py-10">
          {authorId ? "No posts yet." : "No posts to show here yet."}
        </p>
      )}

      <div ref={sentinelRef} className="h-1" />
    </div>
  );
}

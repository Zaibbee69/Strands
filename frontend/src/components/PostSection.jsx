import { useEffect, useRef, useState, useCallback } from "react";
import Post from "./Post";
import { API_URL } from "../config";

async function fetchPosts(page, feedType) {
  const res = await fetch(
    `${API_URL}/posts?page=${page}&limit=5&feed=${feedType}`,
    { credentials: "include" },
  );
  if (!res.ok) throw new Error("Failed to load posts");
  return res.json(); // { posts, hasMore, page }
}

export default function PostSection({ feedType = "recent" }) {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const sentinelRef = useRef(null);

  useEffect(() => {
    setPosts([]);
    setPage(1);
    setHasMore(true);
  }, [feedType]);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    try {
      const { posts: newPosts, hasMore: more } = await fetchPosts(
        page,
        feedType,
      );
      setPosts((prev) => [...prev, ...newPosts]);
      setHasMore(more);
      setPage((p) => p + 1);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [page, feedType, isLoading, hasMore]);

  useEffect(() => {
    if (posts.length === 0 && hasMore) {
      loadMore();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedType]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => entries[0].isIntersecting && loadMore(),
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
      // Post.jsx already updated its own score/vote optimistically —
      // no need to touch `posts` state here unless you want to resync on error
    } catch (err) {
      console.error(err);
      // Optional: trigger a resync/rollback in Post if this fails
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
          No posts to show here yet.
        </p>
      )}

      <div ref={sentinelRef} className="h-1" />
    </div>
  );
}

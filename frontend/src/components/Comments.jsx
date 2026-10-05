import { useEffect, useRef, useState, useCallback } from "react";
import CommentItem from "./CommentItem";
import CommentForm from "./CommentForm";
import { API_URL } from "../config";

async function fetchComments(postId, page) {
  const res = await fetch(
    `${API_URL}/posts/${postId}/comments?page=${page}&limit=20`,
    { credentials: "include" },
  );
  if (!res.ok) throw new Error("Failed to load comments");
  return res.json();
}

export default function Comments({ postId, onCommentCountChange }) {
  const [comments, setComments] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const sentinelRef = useRef(null);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    setComments([]);
    setPage(1);
    setHasMore(true);
    isFetchingRef.current = false;
  }, [postId]);

  const loadMore = useCallback(async () => {
    if (isFetchingRef.current || isLoading || !hasMore) return;
    isFetchingRef.current = true;
    setIsLoading(true);

    try {
      const { comments: newOnes, hasMore: more } = await fetchComments(
        postId,
        page,
      );
      setComments((prev) => {
        const existingIds = new Set(prev.map((c) => c.id));
        return [...prev, ...newOnes.filter((c) => !existingIds.has(c.id))];
      });
      setHasMore(more);
      setPage((p) => p + 1);
    } catch (err) {
      console.error(err);
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
    }
  }, [postId, page, isLoading, hasMore]);

  useEffect(() => {
    if (comments.length === 0 && hasMore) {
      loadMore();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId, comments.length, hasMore, loadMore]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => entries[0].isIntersecting && loadMore(),
      { rootMargin: "200px" },
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [loadMore]);

  const handleAdded = (comment) => {
    setComments((prev) => [...prev, comment]);
    onCommentCountChange?.(1);
  };

  const handleDelete = async (commentId) => {
    try {
      const res = await fetch(`${API_URL}/comments/${commentId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) return;
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      onCommentCountChange?.(-1);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <CommentForm postId={postId} onAdded={handleAdded} />

      {comments.length === 0 && !isLoading && (
        <p className="text-center text-secondary text-sm py-8">
          No comments yet. Be the first to reply.
        </p>
      )}

      {comments.map((c) => (
        <CommentItem key={c.id} comment={c} onDelete={handleDelete} />
      ))}

      {isLoading && (
        <div className="flex justify-center py-6">
          <span className="loading loading-spinner loading-md text-primary"></span>
        </div>
      )}

      <div ref={sentinelRef} className="h-1" />
    </div>
  );
}

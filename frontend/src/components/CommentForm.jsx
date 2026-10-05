import { useState } from "react";
import { API_URL } from "../config";

export default function CommentForm({ postId, onAdded }) {
  const [content, setContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || isPosting) return;

    setIsPosting(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: content.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to comment");

      onAdded(data.comment);
      setContent("");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="py-4 border-b border-base-300">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isPosting}
          placeholder="Write a comment..."
          maxLength={1000}
          className="input input-bordered input-sm bg-base-200 flex-1"
        />
        <button
          type="submit"
          disabled={isPosting || !content.trim()}
          className="btn btn-primary btn-sm disabled:opacity-40"
        >
          {isPosting ? (
            <span className="loading loading-spinner loading-xs"></span>
          ) : (
            "Reply"
          )}
        </button>
      </form>
      {error && <p className="text-error text-xs mt-1">{error}</p>}
    </div>
  );
}

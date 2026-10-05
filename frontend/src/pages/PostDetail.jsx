import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import Post from "../components/Post";
import Comments from "../components/Comments";
import { API_URL } from "../config";

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    fetch(`${API_URL}/posts/${id}`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Post not found");
        return res.json();
      })
      .then(setPost)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleVote = async (postId, nextVote) => {
    const res = await fetch(`${API_URL}/posts/${postId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ type: nextVote }),
    });
    if (!res.ok) throw new Error("Vote failed");
  };

  const handleCommentCountChange = (delta) => {
    setPost(
      (prev) => prev && { ...prev, commentCount: prev.commentCount + delta },
    );
  };

  if (isLoading) {
    return <span className="loading loading-spinner loading-lg m-6"></span>;
  }
  if (error || !post) {
    return <p className="p-6 text-secondary">Post not found.</p>;
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-4 px-5 py-4 border-b border-base-300">
        <button
          onClick={() => navigate(-1)}
          className="btn btn-ghost btn-circle btn-sm"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold">Post</h1>
      </div>

      <Post post={post} onVote={handleVote} />

      <div className="px-5">
        <Comments postId={id} onCommentCountChange={handleCommentCountChange} />
      </div>
    </div>
  );
}

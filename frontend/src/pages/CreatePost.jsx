import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import { Paperclip, X } from "lucide-react";
import { API_URL } from "../config";

const MAX_LENGTH = 2000;

export default function CreatePost() {
  const navigate = useNavigate();
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [showImageInput, setShowImageInput] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState(null);
  const textareaRef = useRef(null);

  const remaining = MAX_LENGTH - content.length;
  const isOverLimit = remaining < 0;
  const canPost = content.trim().length > 0 && !isOverLimit && !isPosting;

  const handleSubmit = async () => {
    if (!canPost) return;
    setIsPosting(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          content: content.trim(),
          imageUrl: imageUrl.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to post");

      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Share whats happening.."
        rows={5}
        className="textarea w-full bg-transparent border-none text-lg text-base-content placeholder:text-secondary/60 focus:outline-none resize-none px-0"
      />

      {showImageInput && (
        <div className="flex items-center gap-2 mb-4">
          <input
            autoFocus
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Paste an image URL..."
            className="input input-bordered input-sm bg-base-200 flex-1"
          />
          <button
            onClick={() => {
              setImageUrl("");
              setShowImageInput(false);
            }}
            className="btn btn-circle btn-ghost btn-sm"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {imageUrl && !showImageInput && (
        <img
          src={imageUrl}
          alt=""
          className="rounded-box w-full object-cover max-h-72 mb-4"
        />
      )}

      {error && (
        <div className="alert alert-error text-sm py-2 mb-4">
          <span>{error}</span>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-base-300 pt-4">
        <button
          onClick={() => setShowImageInput((v) => !v)}
          className={`btn btn-circle btn-ghost ${
            showImageInput || imageUrl ? "text-primary" : "text-base-content"
          }`}
          title="Add image URL"
        >
          <Paperclip size={20} />
        </button>

        <div className="flex items-center gap-4">
          <span
            className={`text-sm tabular-nums ${
              isOverLimit ? "text-error" : "text-secondary"
            }`}
          >
            {content.length}/{MAX_LENGTH}
          </span>

          <button
            onClick={handleSubmit}
            disabled={!canPost}
            className="btn btn-neutral rounded-full px-6 disabled:opacity-40"
          >
            {isPosting ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              "Post"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

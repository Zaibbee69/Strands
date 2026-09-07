import { useState } from "react";
import { ChevronUp, ChevronDown, MessageCircle } from "lucide-react";
import { formatRelativeTime } from "../lib/formatRelativeTime";

export default function Post({ post, onVote }) {
  const [vote, setVote] = useState(post.userVote);
  const [score, setScore] = useState(post.score);

  const handleVote = async (type) => {
    const prevVote = vote;
    const prevScore = score;

    let nextVote = vote === type ? null : type;
    let delta = 0;
    if (vote === "LIKE") delta -= 1;
    if (vote === "DISLIKE") delta += 1;
    if (nextVote === "LIKE") delta += 1;
    if (nextVote === "DISLIKE") delta -= 1;

    setVote(nextVote);
    setScore((s) => s + delta);

    try {
      await onVote?.(post.id, nextVote);
    } catch {
      // Roll back on failure
      setVote(prevVote);
      setScore(prevScore);
    }
  };

  return (
    <article className="flex gap-4 p-5 border-b border-base-300 hover:bg-base-200 transition-colors duration-150">
      {/* Vote column */}
      <div className="flex flex-col items-center gap-1 pt-1 shrink-0">
        <button
          onClick={() => handleVote("LIKE")}
          className={`btn btn-square btn-sm btn-ghost ${
            vote === "LIKE"
              ? "text-primary"
              : "text-secondary hover:text-primary"
          }`}
        >
          <ChevronUp size={22} strokeWidth={vote === "LIKE" ? 3 : 2} />
        </button>

        <span
          className={`font-bold text-sm tabular-nums ${
            vote === "LIKE"
              ? "text-primary"
              : vote === "DISLIKE"
                ? "text-error"
                : "text-base-content"
          }`}
        >
          {score}
        </span>

        <button
          onClick={() => handleVote("DISLIKE")}
          className={`btn btn-square btn-sm btn-ghost ${
            vote === "DISLIKE"
              ? "text-error"
              : "text-secondary hover:text-error"
          }`}
        >
          <ChevronDown size={22} strokeWidth={vote === "DISLIKE" ? 3 : 2} />
        </button>
      </div>

      {/* Right side: header + content + comments */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="avatar avatar-placeholder">
            <div className="bg-neutral text-neutral-content rounded-full w-9">
              {post.author.avatarUrl ? (
                <img src={post.author.avatarUrl} alt={post.author.username} />
              ) : (
                <span className="text-sm">
                  {post.author.username[0].toUpperCase()}
                </span>
              )}
            </div>
          </div>
          <span className="font-bold text-base-content">
            {post.author.username}
          </span>
          <span className="text-secondary">•</span>
          <span className="text-secondary text-sm">
            {formatRelativeTime(post.createdAt)}
          </span>
        </div>

        {/* Content */}
        <div className="mb-4">
          <p className="text-base-content whitespace-pre-wrap break-words">
            {post.content}
          </p>

          {post.imageUrl && (
            <img
              src={post.imageUrl}
              alt=""
              className="rounded-box w-full object-cover mt-3 max-h-[480px]"
            />
          )}
        </div>

        {/* Interactions */}
        <div className="flex items-center gap-5 text-secondary">
          <button className="flex items-center gap-1.5 hover:text-primary transition-colors">
            <MessageCircle size={20} />
            <span className="text-sm">{post.commentCount}</span>
          </button>
        </div>
      </div>
    </article>
  );
}

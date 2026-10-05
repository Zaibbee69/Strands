import { Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { formatRelativeTime } from "../lib/formatRelativeTime";

export default function CommentItem({ comment, onDelete }) {
  const { user } = useAuth();
  const isOwn = user?.id === comment.author.id;

  return (
    <div className="flex gap-3 py-4 border-b border-base-300">
      <div className="avatar avatar-placeholder shrink-0">
        <div className="bg-neutral text-neutral-content rounded-full w-9">
          {comment.author.avatarUrl ? (
            <img src={comment.author.avatarUrl} alt={comment.author.username} />
          ) : (
            <span className="text-sm">
              {comment.author.username[0].toUpperCase()}
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm">{comment.author.username}</span>
          <span className="text-secondary text-xs">
            {formatRelativeTime(comment.createdAt)}
          </span>
        </div>
        <p className="text-sm text-base-content mt-1 whitespace-pre-wrap break-words">
          {comment.content}
        </p>
      </div>

      {isOwn && (
        <button
          onClick={() => onDelete(comment.id)}
          className="text-secondary hover:text-error shrink-0 self-start"
          title="Delete comment"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
}

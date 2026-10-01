import { useState } from "react";
import { Link } from "react-router";
import { Check, X } from "lucide-react";
import { API_URL } from "../config";

export default function FollowRequestCard({ request, onResolved }) {
  const [isLoading, setIsLoading] = useState(false);
  const { follower } = request;

  const respond = async (action) => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/follow-requests/${follower.id}/${action}`,
        {
          method: action === "accept" ? "PATCH" : "DELETE",
          credentials: "include",
        },
      );
      if (res.ok) onResolved(request.id);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3 p-4 border-b border-base-300">
      <Link
        to={`/profile/${follower.id}`}
        className="flex items-center gap-3 flex-1 min-w-0"
      >
        <div className="avatar avatar-placeholder">
          <div className="bg-neutral text-neutral-content rounded-full w-11">
            {follower.avatarUrl ? (
              <img src={follower.avatarUrl} alt={follower.username} />
            ) : (
              <span>{follower.username[0].toUpperCase()}</span>
            )}
          </div>
        </div>
        <div className="min-w-0">
          <p className="font-bold truncate">{follower.username}</p>
          <p className="text-sm text-secondary truncate">
            {follower.bio || "No bio yet"}
          </p>
        </div>
      </Link>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => respond("accept")}
          disabled={isLoading}
          className="btn btn-circle btn-sm btn-success"
        >
          <Check size={16} />
        </button>
        <button
          onClick={() => respond("reject")}
          disabled={isLoading}
          className="btn btn-circle btn-sm btn-ghost"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

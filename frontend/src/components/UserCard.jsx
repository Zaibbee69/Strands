import { useState } from "react";
import { Link } from "react-router";
import { API_URL } from "../config";

export default function UserCard({ user }) {
  const [followStatus, setFollowStatus] = useState(user.followStatus);
  const [isLoading, setIsLoading] = useState(false);

  const handleFollow = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/users/${user.id}/follow`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) setFollowStatus(data.status);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnfollow = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/users/${user.id}/follow`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) setFollowStatus(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="break-inside-avoid mb-4 bg-base-200 border border-base-300 rounded-box p-4">
      <Link
        to={`/profile/${user.id}`}
        className="flex flex-col items-center text-center gap-2"
      >
        <div className="avatar avatar-placeholder">
          <div className="bg-neutral text-neutral-content rounded-full w-16">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.username} />
            ) : (
              <span className="text-xl font-bold">
                {user.username[0].toUpperCase()}
              </span>
            )}
          </div>
        </div>

        <p className="font-bold text-base-content">
          {user.username}
          {user.isGuest && (
            <span className="badge badge-neutral badge-xs ml-1 align-middle">
              Guest
            </span>
          )}
        </p>

        <p className="text-sm text-secondary line-clamp-3">
          {user.bio || "No bio yet"}
        </p>
      </Link>

      <button
        onClick={followStatus === "ACCEPTED" ? handleUnfollow : handleFollow}
        disabled={isLoading || followStatus === "PENDING"}
        className={`btn btn-sm w-full mt-3 ${
          followStatus === "ACCEPTED"
            ? "btn-outline"
            : followStatus === "PENDING"
              ? "btn-ghost"
              : "btn-neutral"
        }`}
      >
        {isLoading ? (
          <span className="loading loading-spinner loading-xs"></span>
        ) : followStatus === "ACCEPTED" ? (
          "Unfollow"
        ) : followStatus === "PENDING" ? (
          "Requested"
        ) : (
          "Follow"
        )}
      </button>
    </div>
  );
}

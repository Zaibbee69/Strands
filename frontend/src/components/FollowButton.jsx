import { useEffect, useState } from "react";
import { API_URL } from "../config";

export default function FollowButton({
  userId,
  initialStatus,
  onChange,
  className = "",
}) {
  const [status, setStatus] = useState(initialStatus);
  const [isLoading, setIsLoading] = useState(false);

  // Stay in sync when the parent refetches and the server value changes
  useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/users/${userId}/follow`, {
        method: status === "ACCEPTED" ? "DELETE" : "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Follow action failed");
      const data = await res.json();
      setStatus(data.status);
      onChange?.(data.status);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading || status === "PENDING"}
      className={`btn btn-sm shrink-0 ${
        status === "ACCEPTED"
          ? "btn-outline"
          : status === "PENDING"
            ? "btn-ghost"
            : "btn-neutral"
      } ${className}`}
    >
      {isLoading ? (
        <span className="loading loading-spinner loading-xs"></span>
      ) : status === "ACCEPTED" ? (
        "Unfollow"
      ) : status === "PENDING" ? (
        "Requested"
      ) : (
        "Follow"
      )}
    </button>
  );
}

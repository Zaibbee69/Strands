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

  useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      // No relationship yet -> send a request.
      // PENDING or ACCEPTED -> delete the row (cancel request / unfollow).
      const res = await fetch(`${API_URL}/users/${userId}/follow`, {
        method: status ? "DELETE" : "POST",
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
      disabled={isLoading}
      title={status === "PENDING" ? "Cancel request" : undefined}
      className={`group btn btn-sm shrink-0 ${
        status === "ACCEPTED"
          ? "btn-outline"
          : status === "PENDING"
            ? "btn-ghost hover:text-error"
            : "btn-neutral"
      } ${className}`}
    >
      {isLoading ? (
        <span className="loading loading-spinner loading-xs"></span>
      ) : status === "ACCEPTED" ? (
        "Unfollow"
      ) : status === "PENDING" ? (
        <>
          <span className="group-hover:hidden">Requested</span>
          <span className="hidden group-hover:inline">Cancel</span>
        </>
      ) : (
        "Follow"
      )}
    </button>
  );
}

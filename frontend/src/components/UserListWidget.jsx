import { Link } from "react-router";
import FollowButton from "./FollowButton";

export default function UserListWidget({
  title,
  users = [],
  isLoading = false,
  onFollowChange,
}) {
  return (
    <div className="bg-base-200 rounded-box border border-base-300 p-4">
      <h3 className="font-bold text-lg mb-3">{title}</h3>

      {isLoading && users.length === 0 ? (
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="skeleton w-9 h-9 rounded-full shrink-0"></div>
              <div className="flex-1">
                <div className="skeleton h-3 w-20 rounded mb-1.5"></div>
                <div className="skeleton h-3 w-14 rounded"></div>
              </div>
              <div className="skeleton h-8 w-16 rounded"></div>
            </div>
          ))}
        </div>
      ) : users.length === 0 ? (
        <p className="text-sm text-secondary">Nobody here yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {users.map((u) => (
            <div key={u.id} className="flex items-center justify-between gap-2">
              <Link
                to={`/profile/${u.id}`}
                className="flex items-center gap-2 min-w-0"
              >
                <div className="avatar avatar-placeholder shrink-0">
                  <div className="bg-neutral text-neutral-content rounded-full w-9">
                    {u.avatarUrl ? (
                      <img src={u.avatarUrl} alt={u.username} />
                    ) : (
                      <span className="text-sm">
                        {u.username[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm truncate">{u.username}</p>
                  <p className="text-xs text-secondary truncate">
                    {u.followerCount} follower{u.followerCount === 1 ? "" : "s"}
                  </p>
                </div>
              </Link>

              <FollowButton
                userId={u.id}
                initialStatus={u.followStatus}
                onChange={onFollowChange}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

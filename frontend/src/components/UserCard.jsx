import { Link } from "react-router";
import FollowButton from "./FollowButton";

export default function UserCard({ user }) {
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

        <p className="text-sm text-secondary">{user.bio || "No bio yet"}</p>
      </Link>

      <FollowButton
        userId={user.id}
        initialStatus={user.followStatus}
        className="w-full mt-3"
      />
    </div>
  );
}

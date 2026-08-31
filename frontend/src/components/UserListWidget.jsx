export default function UserListWidget({ title, users }) {
  return (
    <div className="bg-base-200 rounded-box border border-base-300 p-4">
      <h3 className="font-bold text-lg mb-3">{title}</h3>
      <div className="flex flex-col gap-3">
        {users.map((u) => (
          <div key={u.id} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
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
                  {u.displayName}
                </p>
              </div>
            </div>
            <button
              className={`btn btn-sm shrink-0 ${
                u.isFollowing ? "btn-outline" : "btn-neutral"
              }`}
            >
              {u.isFollowing ? "Unfollow" : "Follow"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

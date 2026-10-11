import { Link } from "react-router";
import { formatRelativeTime } from "../lib/formatRelativeTime";

export default function ConversationList({
  conversations,
  activeUserId,
  isLoading,
}) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <span className="loading loading-spinner loading-md text-primary"></span>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <p className="text-center text-secondary text-sm p-6">
        No conversations yet. Open someone's profile and hit Message to start
        one.
      </p>
    );
  }

  return (
    <div>
      {conversations.map(({ user, lastMessage, unreadCount }) => (
        <Link
          key={user.id}
          to={`/messages/${user.id}`}
          className={`flex items-center gap-3 p-4 border-b border-base-300 transition-colors ${
            activeUserId === user.id ? "bg-base-200" : "hover:bg-base-200"
          }`}
        >
          <div className="avatar avatar-placeholder shrink-0">
            <div className="bg-neutral text-neutral-content rounded-full w-11">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.username} />
              ) : (
                <span>{user.username[0].toUpperCase()}</span>
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p
                className={`truncate ${unreadCount > 0 ? "font-black" : "font-bold"}`}
              >
                {user.username}
              </p>
              <span className="text-xs text-secondary shrink-0">
                {formatRelativeTime(lastMessage.createdAt)}
              </span>
            </div>
            <p
              className={`text-sm truncate ${
                unreadCount > 0 ? "text-base-content" : "text-secondary"
              }`}
            >
              {lastMessage.isMine && "You: "}
              {lastMessage.content}
            </p>
          </div>

          {unreadCount > 0 && (
            <span className="bg-primary text-primary-content text-[11px] font-bold rounded-full min-w-5 h-5 px-1.5 flex items-center justify-center shrink-0">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}

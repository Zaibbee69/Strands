import { Link, useNavigate } from "react-router";
import { Heart, UserPlus, UserCheck, MessageCircle } from "lucide-react";
import { API_URL } from "../config";
import { formatRelativeTime } from "../lib/formatRelativeTime";

const ICONS = {
  LIKE: Heart,
  DISLIKE: Heart,
  FOLLOW_REQUEST: UserPlus,
  FOLLOW_ACCEPTED: UserCheck,
  COMMENT: MessageCircle,
};

function getMessage(n) {
  switch (n.type) {
    case "LIKE":
      return "liked your post";
    case "FOLLOW_REQUEST":
      return "sent you a follow request";
    case "FOLLOW_ACCEPTED":
      return "accepted your follow request";
    case "COMMENT":
      return "commented on your post";
    default:
      return "interacted with your content";
  }
}

function getLink(n) {
  if (n.type === "FOLLOW_REQUEST") return "/follow-requests";
  if (n.type === "FOLLOW_ACCEPTED") return `/profile/${n.actor.id}`;
  if (n.post) return `/posts/${n.post.id}`;
  return `/profile/${n.actor.id}`;
}

export default function NotificationItem({ notification, onRead }) {
  const navigate = useNavigate();
  const Icon = ICONS[notification.type] || Heart;

  const handleClick = async () => {
    if (!notification.read) {
      try {
        await fetch(`${API_URL}/notifications/${notification.id}/read`, {
          method: "PATCH",
          credentials: "include",
        });
        onRead(notification.id);
      } catch (err) {
        console.error(err);
      }
    }
    navigate(getLink(notification));
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-3 w-full text-left p-4 border-b border-base-300 transition-colors
        ${notification.read ? "bg-base-100" : "bg-base-200"} hover:bg-base-300/40`}
    >
      <div className="avatar avatar-placeholder shrink-0">
        <div className="bg-neutral text-neutral-content rounded-full w-10">
          {notification.actor.avatarUrl ? (
            <img
              src={notification.actor.avatarUrl}
              alt={notification.actor.username}
            />
          ) : (
            <span>{notification.actor.username[0].toUpperCase()}</span>
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm">
          <span className="font-bold">{notification.actor.username}</span>{" "}
          <span className="text-base-content/90">
            {getMessage(notification)}
          </span>
        </p>
        <p className="text-xs text-secondary mt-0.5">
          {formatRelativeTime(notification.createdAt)}
        </p>
      </div>

      <Icon size={18} className="text-secondary shrink-0" />
      {!notification.read && (
        <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
      )}
    </button>
  );
}

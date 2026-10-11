import { formatRelativeTime } from "../lib/formatRelativeTime";

export default function MessageBubble({ message, isMine }) {
  return (
    <div className={`chat ${isMine ? "chat-end" : "chat-start"}`}>
      <div
        className={`chat-bubble max-w-[85%] sm:max-w-[70%] whitespace-pre-wrap break-words ${
          isMine ? "chat-bubble-primary" : "bg-base-300 text-base-content"
        }`}
      >
        {message.content}
      </div>
      <div className="chat-footer text-xs text-secondary mt-1">
        {formatRelativeTime(message.createdAt)}
      </div>
    </div>
  );
}

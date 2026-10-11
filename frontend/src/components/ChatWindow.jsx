import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { Link } from "react-router";
import useSWR from "swr";
import { ArrowLeft, SendHorizonal } from "lucide-react";
import MessageBubble from "./MessageBubble";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { API_URL } from "../config";

const fetcher = (url) =>
  fetch(url, { credentials: "include" }).then((res) => res.json());

export default function ChatWindow({ userId, onRead }) {
  const { user: me } = useAuth();
  const socket = useSocket();

  const { data: otherUser } = useSWR(`${API_URL}/users/${userId}`, fetcher);

  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);

  const scrollRef = useRef(null);
  const bottomRef = useRef(null);
  const prevHeightRef = useRef(null); // set only when prepending older messages

  const markRead = useCallback(async () => {
    try {
      await fetch(`${API_URL}/messages/${userId}/read`, {
        method: "PATCH",
        credentials: "include",
      });
      onRead?.(userId);
    } catch (err) {
      console.error(err);
    }
  }, [userId, onRead]);

  // Load the latest page whenever the open conversation changes
  useEffect(() => {
    let cancelled = false;
    setMessages([]);
    setPage(1);
    setHasMore(false);
    setIsLoading(true);
    setError(null);

    fetch(`${API_URL}/messages/${userId}?page=1&limit=30`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setMessages(data.messages || []);
        setHasMore(data.hasMore);
        setPage(2);
      })
      .catch(console.error)
      .finally(() => !cancelled && setIsLoading(false));

    markRead();
    return () => {
      cancelled = true;
    };
  }, [userId, markRead]);

  // Live incoming/outgoing messages for THIS conversation
  useEffect(() => {
    if (!socket) return;

    const handler = (msg) => {
      const otherId = msg.senderId === me.id ? msg.recipientId : msg.senderId;
      if (otherId !== userId) return; // belongs to a different conversation

      setMessages((prev) =>
        prev.some((m) => m.id === msg.id) ? prev : [...prev, msg],
      );
      if (msg.senderId === userId) markRead(); // they sent it and we're looking at it
    };

    socket.on("new_message", handler);
    return () => socket.off("new_message", handler);
  }, [socket, me.id, userId, markRead]);

  // Scroll: jump to bottom on new messages, but hold position when loading older ones
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (prevHeightRef.current !== null) {
      el.scrollTop = el.scrollHeight - prevHeightRef.current;
      prevHeightRef.current = null;
    } else {
      bottomRef.current?.scrollIntoView();
    }
  }, [messages]);

  const loadOlder = async () => {
    prevHeightRef.current = scrollRef.current?.scrollHeight ?? null;
    try {
      const res = await fetch(
        `${API_URL}/messages/${userId}?page=${page}&limit=30`,
        { credentials: "include" },
      );
      const data = await res.json();
      setMessages((prev) => {
        const ids = new Set(prev.map((m) => m.id));
        return [...data.messages.filter((m) => !ids.has(m.id)), ...prev];
      });
      setHasMore(data.hasMore);
      setPage((p) => p + 1);
    } catch (err) {
      prevHeightRef.current = null;
      console.error(err);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    const content = draft.trim();
    if (!content || isSending || !socket) return;

    setIsSending(true);
    setError(null);

    socket.emit("send_message", { recipientId: userId, content }, (res) => {
      setIsSending(false);
      if (res?.error) {
        setError(res.error);
        return;
      }
      setDraft(""); // the message itself arrives via the new_message event
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-base-300">
        <Link
          to="/messages"
          className="btn btn-ghost btn-circle btn-sm md:hidden"
        >
          <ArrowLeft size={20} />
        </Link>

        {otherUser && (
          <Link
            to={`/profile/${otherUser.id}`}
            className="flex items-center gap-3 min-w-0"
          >
            <div className="avatar avatar-placeholder shrink-0">
              <div className="bg-neutral text-neutral-content rounded-full w-9">
                {otherUser.avatarUrl ? (
                  <img src={otherUser.avatarUrl} alt={otherUser.username} />
                ) : (
                  <span className="text-sm">
                    {otherUser.username[0].toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            <span className="font-bold truncate">{otherUser.username}</span>
          </Link>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3">
        {hasMore && (
          <div className="flex justify-center mb-3">
            <button onClick={loadOlder} className="btn btn-ghost btn-xs">
              Load older messages
            </button>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center py-10">
            <span className="loading loading-spinner loading-md text-primary"></span>
          </div>
        )}

        {!isLoading && messages.length === 0 && (
          <p className="text-center text-secondary text-sm py-10">
            No messages yet. Say hi 👋
          </p>
        )}

        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} isMine={m.senderId === me.id} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="border-t border-base-300 p-3">
        {error && <p className="text-error text-xs mb-2">{error}</p>}
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Write a message..."
            maxLength={2000}
            className="input input-bordered bg-base-200 flex-1"
          />
          <button
            type="submit"
            disabled={!draft.trim() || isSending || !socket}
            className="btn btn-primary btn-circle disabled:opacity-40"
            title="Send"
          >
            {isSending ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              <SendHorizonal size={18} />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

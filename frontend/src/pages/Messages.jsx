import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router";
import { MessageSquare } from "lucide-react";
import ConversationList from "../components/ConversationList";
import ChatWindow from "../components/ChatWindow";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { API_URL } from "../config";

export default function Messages() {
  const { userId } = useParams();
  const { user: me } = useAuth();
  const socket = useSocket();

  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadConversations = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/messages/conversations`, {
        credentials: "include",
      });
      const data = await res.json();
      setConversations(data.conversations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Keep the list live as messages arrive
  useEffect(() => {
    if (!socket) return;

    const handler = (msg) => {
      const isMine = msg.senderId === me.id;
      const otherId = isMine ? msg.recipientId : msg.senderId;

      setConversations((prev) => {
        const existing = prev.find((c) => c.user.id === otherId);

        // Brand-new conversation: the socket payload only carries the sender's info,
        // so for first contact we just refetch the list rather than guess.
        if (!existing) {
          loadConversations();
          return prev;
        }

        const updated = {
          ...existing,
          lastMessage: {
            content: msg.content,
            createdAt: msg.createdAt,
            isMine,
          },
          // Don't bump unread for messages in the chat that's currently open
          unreadCount:
            !isMine && otherId !== userId
              ? existing.unreadCount + 1
              : existing.unreadCount,
        };

        return [updated, ...prev.filter((c) => c.user.id !== otherId)];
      });
    };

    socket.on("new_message", handler);
    return () => socket.off("new_message", handler);
  }, [socket, me.id, userId, loadConversations]);

  const handleRead = useCallback((otherId) => {
    setConversations((prev) =>
      prev.map((c) => (c.user.id === otherId ? { ...c, unreadCount: 0 } : c)),
    );
  }, []);

  return (
    <div className="flex h-screen">
      {/* List: always visible on md+, on mobile only when no chat is open */}
      <div
        className={`${
          userId ? "hidden md:flex" : "flex"
        } flex-col w-full md:w-80 md:shrink-0 md:border-r border-base-300`}
      >
        <h1 className="text-xl font-bold p-5 border-b border-base-300">
          Messages
        </h1>
        <div className="flex-1 overflow-y-auto">
          <ConversationList
            conversations={conversations}
            activeUserId={userId}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Chat: on mobile only when a chat is open */}
      <div
        className={`${userId ? "flex" : "hidden md:flex"} flex-col flex-1 min-w-0`}
      >
        {userId ? (
          <ChatWindow key={userId} userId={userId} onRead={handleRead} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-secondary gap-2">
            <MessageSquare size={40} />
            <p>Select a conversation</p>
          </div>
        )}
      </div>
    </div>
  );
}

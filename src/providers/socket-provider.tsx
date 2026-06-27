"use client";

import * as React from "react";
import { io, type Socket } from "socket.io-client";
import { useAuthStore } from "@/stores/auth-store";
import { useChatStore } from "@/stores/chat-store";
import { useNotificationStore } from "@/stores/notification-store";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = React.createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const socketRef = React.useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = React.useState(false);
  const { token, isAuthenticated, user } = useAuthStore();
  const {
    addMessage,
    setTyping,
    setUserOnline,
    addReaction,
    markAsDelivered,
    updateMessageReadStatus,
  } = useChatStore();
  const { addNotification } = useNotificationStore();

  React.useEffect(() => {
    if (!isAuthenticated || !token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      if (user?.id) {
        socket.emit("join", user.id);
      }
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    // New message received
    socket.on("new-message", (message) => {
      addMessage(message.conversationId, message);
      // Send delivery receipt
      socket.emit("message-delivered", {
        messageId: message.id,
        conversationId: message.conversationId,
        receiverId: user?.id,
      });
    });

    // Typing indicator
    socket.on(
      "typing",
      ({ userId, isTyping }: { userId: string; isTyping: boolean }) => {
        setTyping(userId, isTyping);
      }
    );

    // Online/offline status
    socket.on("user-online", ({ userId }: { userId: string }) => {
      setUserOnline(userId, true);
    });

    socket.on("user-offline", ({ userId }: { userId: string }) => {
      setUserOnline(userId, false);
    });

    // Notification
    socket.on("notification", (notification) => {
      addNotification(notification);
    });

    // Message delivery receipt
    socket.on(
      "message-delivered",
      ({
        messageId,
        conversationId,
      }: {
        messageId: string;
        conversationId: string;
      }) => {
        markAsDelivered(conversationId, messageId);
      }
    );

    // Message read receipt
    socket.on(
      "message-read",
      ({
        messageId,
        conversationId,
        readAt,
      }: {
        messageId: string;
        conversationId: string;
        readAt: string;
      }) => {
        updateMessageReadStatus(conversationId, messageId, readAt);
      }
    );

    // Reaction added
    socket.on(
      "reaction-added",
      ({
        conversationId,
        messageId,
        reaction,
      }: {
        conversationId: string;
        messageId: string;
        reaction: { userId: string; emoji: string };
      }) => {
        addReaction(conversationId, messageId, reaction);
      }
    );

    // Multiple messages read
    socket.on(
      "messages-read",
      ({
        conversationId,
        userId,
        readAt,
      }: {
        conversationId: string;
        userId: string;
        readAt: string;
      }) => {
        void userId;
        void conversationId;
        void readAt;
        // Mark all messages as read in the conversation
      }
    );

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [
    isAuthenticated,
    token,
    user?.id,
    addMessage,
    setTyping,
    setUserOnline,
    addNotification,
    addReaction,
    markAsDelivered,
    updateMessageReadStatus,
  ]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return React.useContext(SocketContext);
}
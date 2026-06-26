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
  const { addMessage, setTyping, setUserOnline } = useChatStore();
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

    socket.on("new-message", (message) => {
      addMessage(message.conversationId, message);
    });

    socket.on("typing", ({ userId, isTyping }: { userId: string; isTyping: boolean }) => {
      setTyping(userId, isTyping);
    });

    socket.on("user-online", ({ userId }: { userId: string }) => {
      setUserOnline(userId, true);
    });

    socket.on("user-offline", ({ userId }: { userId: string }) => {
      setUserOnline(userId, false);
    });

    socket.on("notification", (notification) => {
      addNotification(notification);
    });

    socket.on("message-delivered", ({ messageId, conversationId }: { messageId: string; conversationId: string }) => {
      void conversationId;
      void messageId;
    });

    socket.on("message-read", ({ messageId, conversationId }: { messageId: string; conversationId: string }) => {
      void conversationId;
      void messageId;
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [isAuthenticated, token, user?.id, addMessage, setTyping, setUserOnline, addNotification]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return React.useContext(SocketContext);
}
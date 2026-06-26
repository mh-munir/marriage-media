import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: "text" | "image" | "voice" | "file";
  fileUrl?: string;
  fileName?: string;
  isRead: boolean;
  isDelivered: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  lastMessage?: Message;
  unreadCount: number;
  isOnline: boolean;
  lastSeen?: string;
}

interface ChatState {
  conversations: Conversation[];
  activeConversation: string | null;
  messages: Record<string, Message[]>;
  typingUsers: Record<string, boolean>;
  onlineUsers: Set<string>;
  isConnected: boolean;

  setConversations: (conversations: Conversation[]) => void;
  setActiveConversation: (id: string | null) => void;
  addMessage: (conversationId: string, message: Message) => void;
  setMessages: (conversationId: string, messages: Message[]) => void;
  markAsRead: (conversationId: string) => void;
  setTyping: (userId: string, isTyping: boolean) => void;
  setOnlineUsers: (users: Set<string>) => void;
  setUserOnline: (userId: string, isOnline: boolean) => void;
  setConnected: (connected: boolean) => void;
  updateConversation: (conversationId: string, updates: Partial<Conversation>) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      activeConversation: null,
      messages: {},
      typingUsers: {},
      onlineUsers: new Set(),
      isConnected: false,

      setConversations: (conversations) => set({ conversations }),

      setActiveConversation: (id) => set({ activeConversation: id }),

      addMessage: (conversationId, message) =>
        set((state) => {
          const existing = state.messages[conversationId] || [];
          const updated = existing.some((m) => m.id === message.id)
            ? existing
            : [...existing, message];

          const conversations = state.conversations.map((c) =>
            c.id === conversationId
              ? { ...c, lastMessage: message, unreadCount: message.senderId !== state.activeConversation ? c.unreadCount + 1 : 0 }
              : c
          );

          return {
            messages: { ...state.messages, [conversationId]: updated },
            conversations,
          };
        }),

      setMessages: (conversationId, messages) =>
        set((state) => ({
          messages: { ...state.messages, [conversationId]: messages },
        })),

      markAsRead: (conversationId) =>
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId ? { ...c, unreadCount: 0 } : c
          ),
        })),

      setTyping: (userId, isTyping) =>
        set((state) => ({
          typingUsers: { ...state.typingUsers, [userId]: isTyping },
        })),

      setOnlineUsers: (users) => set({ onlineUsers: users }),

      setUserOnline: (userId, isOnline) =>
        set((state) => {
          const onlineUsers = new Set(state.onlineUsers);
          if (isOnline) onlineUsers.add(userId);
          else onlineUsers.delete(userId);
          return { onlineUsers };
        }),

      setConnected: (connected) => set({ isConnected: connected }),

      updateConversation: (conversationId, updates) =>
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId ? { ...c, ...updates } : c
          ),
        })),
    }),
    {
      name: "marriage-media-chat",
      partialize: (state) => ({
        conversations: state.conversations,
      }),
    }
  )
);
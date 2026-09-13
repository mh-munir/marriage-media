import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Reaction {
  userId: string;
  emoji: string;
}

export interface ReplyPreview {
  senderName: string;
  content: string;
  messageType: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: "text" | "image" | "voice" | "file" | "emoji" | "system";
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  thumbnailUrl?: string;
  voiceUrl?: string;
  voiceDuration?: number;
  isRead: boolean;
  isDelivered: boolean;
  readAt?: string;
  deliveredAt?: string;
  reactions: Reaction[];
  replyTo?: string;
  replyPreview?: ReplyPreview;
  isForwarded: boolean;
  isDeleted: boolean;
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
  isPinned: boolean;
  isArchived: boolean;
  isMuted: boolean;
}

interface ChatState {
  conversations: Conversation[];
  activeConversation: string | null;
  messages: Record<string, Message[]>;
  typingUsers: Record<string, boolean>;
  onlineUsers: Set<string>;
  isConnected: boolean;
  searchQuery: string;
  searchResults: Record<string, Message[]>;
  replyingTo: Message | null;

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
  addReaction: (conversationId: string, messageId: string, reaction: Reaction) => void;
  removeReaction: (conversationId: string, messageId: string, userId: string) => void;
  setReplyingTo: (message: Message | null) => void;
  deleteMessage: (conversationId: string, messageId: string) => void;
  setSearchQuery: (query: string) => void;
  setSearchResults: (conversationId: string, messages: Message[]) => void;
  markAsDelivered: (conversationId: string, messageId: string) => void;
  updateMessageReadStatus: (conversationId: string, messageId: string, readAt: string) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      conversations: [],
      activeConversation: null,
      messages: {},
      typingUsers: {},
      onlineUsers: new Set(),
      isConnected: false,
      searchQuery: "",
      searchResults: {},
      replyingTo: null,

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
              ? {
                  ...c,
                  lastMessage: message,
                  unreadCount:
                    message.senderId !== state.activeConversation
                      ? c.unreadCount + 1
                      : c.unreadCount,
                }
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

      addReaction: (conversationId, messageId, reaction) =>
        set((state) => {
          const conversationMessages = state.messages[conversationId] || [];
          const updated = conversationMessages.map((m) => {
            if (m.id !== messageId) return m;
            const existing = m.reactions.find(
              (r) => r.userId === reaction.userId && r.emoji === reaction.emoji
            );
            if (existing) return m;
            return { ...m, reactions: [...m.reactions, reaction] };
          });
          return {
            messages: { ...state.messages, [conversationId]: updated },
          };
        }),

      removeReaction: (conversationId, messageId, userId) =>
        set((state) => {
          const conversationMessages = state.messages[conversationId] || [];
          const updated = conversationMessages.map((m) => {
            if (m.id !== messageId) return m;
            return {
              ...m,
              reactions: m.reactions.filter((r) => r.userId !== userId),
            };
          });
          return {
            messages: { ...state.messages, [conversationId]: updated },
          };
        }),

      setReplyingTo: (message) => set({ replyingTo: message }),

      deleteMessage: (conversationId, messageId) =>
        set((state) => {
          const conversationMessages = state.messages[conversationId] || [];
          const updated = conversationMessages.map((m) =>
            m.id === messageId ? { ...m, isDeleted: true, content: "This message was deleted" } : m
          );
          return {
            messages: { ...state.messages, [conversationId]: updated },
          };
        }),

      setSearchQuery: (query) => set({ searchQuery: query }),

      setSearchResults: (conversationId, messages) =>
        set((state) => ({
          searchResults: { ...state.searchResults, [conversationId]: messages },
        })),

      markAsDelivered: (conversationId, messageId) =>
        set((state) => {
          const conversationMessages = state.messages[conversationId] || [];
          const updated = conversationMessages.map((m) =>
            m.id === messageId ? { ...m, isDelivered: true, deliveredAt: new Date().toISOString() } : m
          );
          return {
            messages: { ...state.messages, [conversationId]: updated },
          };
        }),

      updateMessageReadStatus: (conversationId, messageId, readAt) =>
        set((state) => {
          const conversationMessages = state.messages[conversationId] || [];
          const updated = conversationMessages.map((m) =>
            m.id === messageId ? { ...m, isRead: true, readAt } : m
          );
          return {
            messages: { ...state.messages, [conversationId]: updated },
          };
        }),
    }),
    {
      name: "marriage-media-chat",
      partialize: (state) => ({
        conversations: state.conversations,
      }),
    }
  )
);
"use client";

export const dynamic = "force-dynamic";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  CheckCheck,
  Loader2,
  MessageCircle,
  MoreVertical,
  Phone,
  Search,
  Send,
  Video,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, formatRelativeTime, getInitials } from "@/lib/utils";
import { useSocket } from "@/providers/socket-provider";
import { useSearchParams } from "next/navigation";

interface ConversationSummary {
  id: string;
  participantId: string;
  participantName: string;
  participantEmail: string;
  participantAvatar: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  isOnline: boolean;
}

interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  messageType: "text" | "image" | "voice" | "file" | "emoji" | "system";
  isRead: boolean;
  isDelivered: boolean;
  createdAt: string;
}

function readId(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (typeof record._id === "string") return record._id;
  }
  return "";
}

function readString(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  return "";
}

function mapMessage(raw: Record<string, unknown>): ChatMessage {
  const id = readId(raw._id) || readString(raw, "id");
  return {
    id,
    conversationId: readId(raw.conversationId),
    senderId: readId(raw.senderId),
    receiverId: readId(raw.receiverId),
    content: readString(raw, "content"),
    messageType: (readString(raw, "messageType") || "text") as ChatMessage["messageType"],
    isRead: Boolean(raw.isRead),
    isDelivered: Boolean(raw.isDelivered),
    createdAt: readString(raw, "createdAt") || new Date().toISOString(),
  };
}

export default function DashboardMessagesPage() {
  const searchParams = useSearchParams();
  const requestedConversationId = searchParams.get("conversationId") || "";
  const [conversations, setConversations] = React.useState<ConversationSummary[]>([]);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [selectedConversationId, setSelectedConversationId] = React.useState("");
  const [currentUserId, setCurrentUserId] = React.useState("");
  const [newMessage, setNewMessage] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [loadingConversations, setLoadingConversations] = React.useState(true);
  const [loadingMessages, setLoadingMessages] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const { socket, isConnected } = useSocket();

  const selectedConversation = conversations.find((conversation) => conversation.id === selectedConversationId);

  const filteredConversations = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return conversations;
    return conversations.filter((conversation) =>
      `${conversation.participantName} ${conversation.participantEmail}`
        .toLowerCase()
        .includes(query)
    );
  }, [conversations, searchQuery]);

  const loadMessages = React.useCallback(async (conversationId: string, showLoading = true) => {
    if (!conversationId) return;
    if (showLoading) setLoadingMessages(true);
    try {
      const response = await fetch(`/api/chat/messages?conversationId=${conversationId}&limit=50`);
      if (!response.ok) throw new Error("Failed to load messages");
      const data = await response.json() as { messages?: Record<string, unknown>[] };
      setMessages((data.messages || []).map(mapMessage));
    } catch {
      setMessages([]);
    } finally {
      if (showLoading) setLoadingMessages(false);
    }
  }, []);

  const loadConversations = React.useCallback(async (showLoading = true) => {
    if (showLoading) setLoadingConversations(true);
    try {
      const [meResponse, conversationsResponse] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/chat/conversations"),
      ]);

      if (meResponse.ok) {
        const me = await meResponse.json() as { user?: { id?: string } };
        setCurrentUserId(me.user?.id || "");
      }

      if (!conversationsResponse.ok) throw new Error("Failed to load conversations");
      const data = await conversationsResponse.json() as { conversations?: ConversationSummary[] };
      const nextConversations = data.conversations || [];
      setConversations(nextConversations);
      setSelectedConversationId((current) => current || requestedConversationId || nextConversations[0]?.id || "");
    } catch {
      setConversations([]);
    } finally {
      if (showLoading) setLoadingConversations(false);
    }
  }, [requestedConversationId]);

  React.useEffect(() => {
    queueMicrotask(() => void loadConversations());
  }, [loadConversations]);

  React.useEffect(() => {
    queueMicrotask(() => void loadMessages(selectedConversationId));
  }, [loadMessages, selectedConversationId]);

  React.useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: Record<string, unknown>) => {
      const mapped = mapMessage(message);
      if (mapped.conversationId === selectedConversationId) {
        setMessages((current) => current.some((item) => item.id === mapped.id) ? current : [...current, mapped]);
      }
      void loadConversations(false);
    };

    socket.on("new-message", handleNewMessage);
    return () => {
      socket.off("new-message", handleNewMessage);
    };
  }, [loadConversations, selectedConversationId, socket]);

  React.useEffect(() => {
    if (isConnected) return;

    const refreshMessages = () => {
      if (document.visibilityState !== "visible") return;
      void loadConversations(false);
      if (selectedConversationId) void loadMessages(selectedConversationId, false);
    };

    const interval = window.setInterval(refreshMessages, 8000);
    window.addEventListener("focus", refreshMessages);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", refreshMessages);
    };
  }, [isConnected, loadConversations, loadMessages, selectedConversationId]);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  async function handleSendMessage(event: React.FormEvent) {
    event.preventDefault();
    const content = newMessage.trim();
    if (!content || !selectedConversationId || sending) return;

    setSending(true);
    setNewMessage("");

    try {
      const response = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: selectedConversationId,
          content,
          messageType: "text",
        }),
      });

      if (!response.ok) throw new Error("Failed to send message");
      const data = await response.json() as { message?: Record<string, unknown> };
      if (data.message) {
        const mapped = mapMessage(data.message);
        setMessages((current) => [...current, mapped]);
        socket?.emit("send-message", mapped);
      }
      await loadConversations();
    } catch {
      setNewMessage(content);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-30 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
          >
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">Messages</h1>
              <p className="text-muted-foreground">Private conversations with instant delivery and live updates.</p>
            </div>
            <Badge variant={isConnected ? "default" : "secondary"} className="w-fit gap-1.5 rounded-full px-3 py-1.5">
              <span className={cn("h-1.5 w-1.5 rounded-full", isConnected ? "bg-emerald-300 animate-pulse" : "bg-muted-foreground/60")} />
              {isConnected ? "Live updates on" : "Auto-refresh on"}
            </Badge>
          </motion.div>

          <Card className="overflow-hidden border-border/70 bg-background/95 shadow-xl shadow-slate-950/5" style={{ height: "calc(100vh - 300px)", minHeight: "540px" }}>
            <div className="flex h-full">
              <aside className={cn("w-full border-r border-border/70 bg-muted/20 md:w-80 md:flex", selectedConversationId ? "hidden" : "flex", "flex-col")}>
                <div className="border-b border-border/70 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-semibold">Conversations</p>
                    <span className="text-xs text-muted-foreground">{conversations.length}</span>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search conversations..."
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      className="pl-9 h-10"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {loadingConversations ? (
                    <div className="flex h-full items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : filteredConversations.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                      <MessageCircle className="h-10 w-10 text-muted-foreground mb-3" />
                      <p className="font-medium">No conversations yet</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Start from a profile or interest to create a chat.
                      </p>
                    </div>
                  ) : (
                    filteredConversations.map((conversation) => (
                      <button
                        key={conversation.id}
                        type="button"
                        onClick={() => setSelectedConversationId(conversation.id)}
                        className={cn(
                          "m-1 flex w-[calc(100%-0.5rem)] items-center gap-3 rounded-2xl p-3 text-left transition-all hover:bg-background hover:shadow-sm",
                          selectedConversationId === conversation.id && "bg-background shadow-sm ring-1 ring-primary/15"
                        )}
                      >
                        <div className="relative shrink-0">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={conversation.participantAvatar} alt={conversation.participantName} />
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                              {getInitials(conversation.participantName)}
                            </AvatarFallback>
                          </Avatar>
                          {conversation.isOnline ? (
                            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-background" />
                          ) : null}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="truncate text-sm font-semibold">{conversation.participantName}</h3>
                            <span className="text-[10px] text-muted-foreground shrink-0">
                              {conversation.lastMessageAt ? formatRelativeTime(conversation.lastMessageAt) : ""}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs text-muted-foreground truncate">
                              {conversation.lastMessage || "No messages yet"}
                            </p>
                            {conversation.unreadCount > 0 ? (
                              <Badge className="h-5 min-w-5 rounded-full p-0 flex items-center justify-center text-[10px] shrink-0">
                                {conversation.unreadCount}
                              </Badge>
                            ) : null}
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </aside>

              <section className={cn("flex flex-1 flex-col", selectedConversationId ? "" : "hidden md:flex")}>
                {selectedConversation ? (
                  <>
                    <div className="flex items-center justify-between border-b border-border/70 bg-background/90 p-4 backdrop-blur-sm">
                      <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" className="-ml-2 h-9 w-9 md:hidden" onClick={() => setSelectedConversationId("")} aria-label="Back to conversations">
                          <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={selectedConversation.participantAvatar} alt={selectedConversation.participantName} />
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {getInitials(selectedConversation.participantName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-sm">{selectedConversation.participantName}</h3>
                          <p className={cn("text-xs", selectedConversation.isOnline ? "text-emerald-500" : "text-muted-foreground")}>
                            {selectedConversation.isOnline ? "Online" : "Offline"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-9 w-9" disabled aria-label="Voice calls are coming soon">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9" disabled aria-label="Video calls are coming soon">
                          <Video className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="More options">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex-1 space-y-3 overflow-y-auto bg-linear-to-b from-muted/25 via-background to-muted/10 p-4">
                      {loadingMessages ? (
                        <div className="flex h-full items-center justify-center">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      ) : messages.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center text-center">
                          <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
                          <p className="text-muted-foreground">No messages in this conversation yet.</p>
                        </div>
                      ) : (
                        messages.map((message) => {
                          const isOwn = message.senderId === currentUserId;
                          return (
                            <div
                              key={message.id}
                              className={cn("flex", isOwn ? "justify-end" : "justify-start")}
                            >
                              <div
                                className={cn(
                                  "max-w-[82%] rounded-2xl px-4 py-2.5 shadow-sm sm:max-w-[70%]",
                                  isOwn
                                    ? "rounded-br-md bg-linear-to-br from-primary to-primary/85 text-primary-foreground"
                                    : "rounded-bl-md border border-border/60 bg-background"
                                )}
                              >
                                <p className="wrap-break-word text-sm whitespace-pre-wrap">{message.content}</p>
                                <div
                                  className={cn(
                                    "flex items-center gap-1 mt-1",
                                    isOwn ? "justify-end text-primary-foreground/70" : "justify-start text-muted-foreground"
                                  )}
                                >
                                  <span className="text-[10px]">
                                    {formatRelativeTime(message.createdAt)}
                                  </span>
                                  {isOwn ? (
                                    message.isRead ? (
                                      <CheckCheck className="h-3 w-3 text-blue-300" />
                                    ) : message.isDelivered ? (
                                      <CheckCheck className="h-3 w-3 opacity-70" />
                                    ) : (
                                      <Check className="h-3 w-3 opacity-70" />
                                    )
                                  ) : null}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    <div className="border-t border-border/70 bg-background/95 p-4 backdrop-blur-sm">
                      <form onSubmit={handleSendMessage} className="flex items-center gap-2 rounded-2xl border border-border/70 bg-muted/30 p-1.5 focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/5">
                        <Input
                          placeholder="Type a message..."
                          value={newMessage}
                          onChange={(event) => setNewMessage(event.target.value)}
                          className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0"
                          disabled={sending}
                        />
                        <Button type="submit" variant="gradient" size="icon" className="h-10 w-10 shrink-0 rounded-xl" disabled={!newMessage.trim() || sending}>
                          {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                        </Button>
                      </form>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Select a conversation to start chatting.</p>
                    </div>
                  </div>
                )}
              </section>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}

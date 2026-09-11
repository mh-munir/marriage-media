"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Smile,
  Paperclip,
  Image as ImageIcon,
  Mic,
  MicOff,
  MoreVertical,
  Phone,
  Video,
  ArrowLeft,
  Check,
  CheckCheck,
  X,
  Reply,
  Search,
  Download,
  Play,
  FileText,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useChatStore, type Message, type Reaction } from "@/stores/chat-store";
import { useAuthStore } from "@/stores/auth-store";
import { useSocket } from "@/providers/socket-provider";
import { cn, formatRelativeTime, getInitials } from "@/lib/utils";

const QUICK_REACTIONS = ["❤️", "😊", "👍", "😂", "🔥", "💯"];

interface ChatWindowProps {
  conversationId: string;
  participantName: string;
  participantAvatar?: string;
  isOnline?: boolean;
  onBack?: () => void;
}

export function ChatWindow({
  conversationId,
  participantName,
  participantAvatar,
  isOnline = false,
  onBack,
}: ChatWindowProps) {
  const [message, setMessage] = React.useState("");
  const [isTyping, setIsTyping] = React.useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = React.useState(false);
  const [showSearch, setShowSearch] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<Message[]>([]);
  const [isRecording, setIsRecording] = React.useState(false);
  const [recordingTime, setRecordingTime] = React.useState(0);
  const [showReactionPicker, setShowReactionPicker] = React.useState<string | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const imageInputRef = React.useRef<HTMLInputElement>(null);
  const recordingInterval = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const {
    messages,
    typingUsers,
    addMessage,
    replyingTo,
    setReplyingTo,
    addReaction,
    deleteMessage,
  } = useChatStore();
  const { user } = useAuthStore();
  const { socket } = useSocket();

  const conversationMessages = React.useMemo(() => messages[conversationId] || [], [conversationId, messages]);
  const otherUserId = participantId(conversationId, user?.id || "");
  const isParticipantTyping = typingUsers[otherUserId];

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationMessages]);

  // Recording timer
  React.useEffect(() => {
    if (isRecording) {
      recordingInterval.current = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);
    } else {
      if (recordingInterval.current) clearInterval(recordingInterval.current);
      setRecordingTime(0);
    }
    return () => {
      if (recordingInterval.current) clearInterval(recordingInterval.current);
    };
  }, [isRecording]);

  const handleSend = async () => {
    if (!message.trim() || !user?.id) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId: user.id,
      receiverId: otherUserId,
      content: message.trim(),
      type: "text",
      reactions: [],
      isForwarded: false,
      isDeleted: false,
      isRead: false,
      isDelivered: false,
      replyTo: replyingTo?.id,
      replyPreview: replyingTo
        ? {
            senderName: replyingTo.senderId === user.id ? "You" : participantName,
            content: replyingTo.content.substring(0, 100),
            messageType: replyingTo.type,
          }
        : undefined,
      createdAt: new Date().toISOString(),
    };

    addMessage(conversationId, newMessage);
    setMessage("");
    setReplyingTo(null);

    if (socket) {
      socket.emit("send-message", newMessage);
    }
  };

  const handleSendFile = (file: File, type: "image" | "file") => {
    if (!user?.id) return;

    // In production, upload to Cloudinary/S3 first
    const fileUrl = URL.createObjectURL(file);

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId: user.id,
      receiverId: otherUserId,
      content: type === "image" ? "📷 Photo" : `📎 ${file.name}`,
      type,
      fileUrl,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      reactions: [],
      isForwarded: false,
      isDeleted: false,
      isRead: false,
      isDelivered: false,
      createdAt: new Date().toISOString(),
    };

    addMessage(conversationId, newMessage);

    if (socket) {
      socket.emit("send-message", newMessage);
    }
  };

  const handleSendVoice = () => {
    if (!user?.id) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId: user.id,
      receiverId: otherUserId,
      content: "🎤 Voice message",
      type: "voice",
      voiceUrl: "blob:voice-recording", // In production, upload actual recording
      voiceDuration: recordingTime,
      reactions: [],
      isForwarded: false,
      isDeleted: false,
      isRead: false,
      isDelivered: false,
      createdAt: new Date().toISOString(),
    };

    addMessage(conversationId, newMessage);
    setIsRecording(false);

    if (socket) {
      socket.emit("send-message", newMessage);
    }
  };

  const handleReaction = (messageId: string, emoji: string) => {
    if (!user?.id) return;
    const reaction: Reaction = { userId: user.id, emoji };
    addReaction(conversationId, messageId, reaction);
    setShowReactionPicker(null);

    if (socket) {
      socket.emit("add-reaction", { conversationId, messageId, reaction });
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    deleteMessage(conversationId, messageId);
    if (socket) {
      socket.emit("delete-message", { conversationId, messageId });
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const res = await fetch(
        `/api/chat/search?q=${encodeURIComponent(searchQuery)}&conversationId=${conversationId}`
      );
      const data = await res.json();
      setSearchResults(data.messages || []);
    } catch {
      console.error("Search failed");
    }
  };

  const handleTyping = React.useCallback(
    (typing: boolean) => {
      if (socket) {
        socket.emit("typing", {
          conversationId,
          isTyping: typing,
        });
      }
    },
    [socket, conversationId]
  );

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      if (isTyping) {
        handleTyping(false);
        setIsTyping(false);
      }
    }, 2000);

    return () => clearTimeout(timeout);
  }, [isTyping, handleTyping]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border/50 glass">
        {onBack && (
          <Button variant="ghost" size="icon-sm" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <div className="relative">
          <Avatar className="h-10 w-10">
            <AvatarImage src={participantAvatar} alt={participantName} />
            <AvatarFallback className="bg-linear-to-br from-primary/10 to-purple-500/10 text-primary text-sm font-semibold">
              {getInitials(participantName)}
            </AvatarFallback>
          </Avatar>
          {isOnline && (
            <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-background" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm">{participantName}</h3>
          <p className="text-xs text-muted-foreground">
            {isParticipantTyping
              ? "Typing..."
              : isOnline
                ? "Online"
                : "Last seen recently"}
          </p>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon-sm" onClick={() => setShowSearch(!showSearch)} aria-label="Search messages">
            <Search className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="Voice call">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="Video call">
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="More options">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-border/50 overflow-hidden"
          >
            <div className="p-3 flex gap-2">
              <Input
                placeholder="Search in conversation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="text-sm"
              />
              <Button size="sm" onClick={handleSearch}>
                Search
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowSearch(false);
                  setSearchQuery("");
                  setSearchResults([]);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {searchResults.length > 0 && (
              <div className="px-3 pb-3 max-h-40 overflow-y-auto">
                <p className="text-xs text-muted-foreground mb-2">
                  {searchResults.length} results found
                </p>
                {searchResults.slice(0, 5).map((result) => (
                  <div
                    key={result.id}
                    className="p-2 rounded-lg bg-accent/50 text-sm cursor-pointer hover:bg-accent mb-1"
                  >
                    <span className="font-medium text-xs">{result.senderId === user?.id ? "You" : participantName}</span>
                    <p className="text-muted-foreground truncate">{result.content}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reply Preview */}
      <AnimatePresence>
        {replyingTo && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-border/50 px-4 py-2 bg-accent/30"
          >
            <div className="flex items-center gap-2">
              <Reply className="h-4 w-4 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-primary">
                  Replying to {replyingTo.senderId === user?.id ? "yourself" : participantName}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {replyingTo.content}
                </p>
              </div>
              <button onClick={() => setReplyingTo(null)} className="p-1 hover:bg-muted rounded">
                <X className="h-3 w-3" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversationMessages.map((msg) => {
          const isOwn = msg.senderId === user?.id;
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn("flex group", isOwn ? "justify-end" : "justify-start")}
            >
              <div className="relative max-w-[75%]">
                {/* Reply preview in message */}
                {msg.replyPreview && (
                  <div className="rounded-t-2xl bg-black/10 dark:bg-white/10 px-4 py-1.5 text-xs border-l-2 border-primary/50 mb-0.5">
                    <span className="font-medium text-primary">{msg.replyPreview.senderName}</span>
                    <p className="truncate text-muted-foreground">{msg.replyPreview.content}</p>
                  </div>
                )}

                <div
                  className={cn(
                    "rounded-2xl px-4 py-2.5 text-sm",
                    msg.type === "image" ? "p-1" : "",
                    isOwn
                      ? msg.replyPreview
                        ? "rounded-tr-md"
                        : "bg-linear-to-r from-primary to-primary/90 text-primary-foreground rounded-br-md"
                      : msg.replyPreview
                        ? "rounded-tl-md"
                        : "glass-card rounded-bl-md"
                  )}
                >
                  {/* Image message */}
                  {msg.type === "image" && msg.fileUrl && (
                    <div className="rounded-xl overflow-hidden mb-1">
                      <img
                        src={msg.fileUrl}
                        alt="Shared image"
                        className="max-w-full max-h-60 object-cover"
                      />
                    </div>
                  )}

                  {/* Voice message */}
                  {msg.type === "voice" && (
                    <div className="flex items-center gap-3 py-1">
                      <Button size="icon-sm" variant="ghost" className="shrink-0">
                        <Play className="h-4 w-4" />
                      </Button>
                      <div className="flex-1 h-1 bg-muted rounded-full">
                        <div className="h-full w-0 bg-primary rounded-full" />
                      </div>
                      <span className="text-xs opacity-70">
                        {msg.voiceDuration ? formatRecordingTime(msg.voiceDuration) : "0:00"}
                      </span>
                    </div>
                  )}

                  {/* File message */}
                  {msg.type === "file" && (
                    <div className="flex items-center gap-3 py-1">
                      <FileText className="h-8 w-8 text-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{msg.fileName}</p>
                        <p className="text-xs opacity-70">
                          {msg.fileSize ? formatFileSize(msg.fileSize) : ""}
                        </p>
                      </div>
                      <Button size="icon-sm" variant="ghost">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {/* Text content */}
                  {msg.type !== "image" && msg.type !== "voice" && msg.type !== "file" && (
                    <p className="whitespace-pre-wrap wrap-break-word">{msg.isDeleted ? msg.content : msg.content}</p>
                  )}

                  {/* Timestamp and read receipts */}
                  <div
                    className={cn(
                      "flex items-center gap-1 mt-1",
                      isOwn ? "justify-end" : "justify-start"
                    )}
                  >
                    <span className="text-[10px] opacity-70">
                      {formatRelativeTime(msg.createdAt)}
                    </span>
                    {isOwn &&
                      (msg.isRead ? (
                        <CheckCheck className="h-3 w-3 text-blue-400" />
                      ) : msg.isDelivered ? (
                        <CheckCheck className="h-3 w-3 opacity-50" />
                      ) : (
                        <Check className="h-3 w-3 opacity-50" />
                      ))}
                  </div>
                </div>

                {/* Reactions */}
                {msg.reactions && msg.reactions.length > 0 && (
                  <div className={cn("flex flex-wrap gap-1 mt-1", isOwn ? "justify-end" : "justify-start")}>
                    {groupReactions(msg.reactions).map((group) => (
                      <button
                        key={group.emoji}
                        onClick={() => handleReaction(msg.id, group.emoji)}
                        className={cn(
                          "flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs border",
                          group.reacted
                            ? "bg-primary/10 border-primary/30"
                            : "bg-muted border-transparent hover:border-border"
                        )}
                      >
                        <span>{group.emoji}</span>
                        <span className="text-[10px]">{group.count}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Action buttons (on hover) */}
                {!msg.isDeleted && (
                  <div className="absolute top-0 right-0 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5">
                    <button
                      onClick={() => setShowReactionPicker(showReactionPicker === msg.id ? null : msg.id)}
                      className="p-1 rounded-full bg-background border shadow-sm hover:bg-accent"
                    >
                      <Smile className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => setReplyingTo(msg)}
                      className="p-1 rounded-full bg-background border shadow-sm hover:bg-accent"
                    >
                      <Reply className="h-3 w-3" />
                    </button>
                    {isOwn && (
                      <button
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="p-1 rounded-full bg-background border shadow-sm hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                )}

                {/* Quick reaction picker */}
                <AnimatePresence>
                  {showReactionPicker === msg.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className={cn(
                        "absolute -top-10 z-10 flex gap-1 bg-background border rounded-full px-2 py-1 shadow-lg",
                        isOwn ? "right-0" : "left-0"
                      )}
                    >
                      {QUICK_REACTIONS.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => handleReaction(msg.id, emoji)}
                          className="text-lg hover:scale-125 transition-transform"
                        >
                          {emoji}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}

        {/* Typing Indicator */}
        <AnimatePresence>
          {isParticipantTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex justify-start"
            >
              <div className="glass-card rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1">
                  <div
                    className="h-2 w-2 rounded-full bg-primary/50 animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <div
                    className="h-2 w-2 rounded-full bg-primary/50 animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <div
                    className="h-2 w-2 rounded-full bg-primary/50 animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border/50">
        {/* Recording indicator */}
        {isRecording && (
          <div className="flex items-center gap-3 mb-3 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
            <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
            <span className="text-sm font-medium text-red-600 dark:text-red-400">
              Recording... {formatRecordingTime(recordingTime)}
            </span>
            <div className="flex-1" />
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setIsRecording(false)}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleSendVoice}>
              Send
            </Button>
          </div>
        )}

        <div className="flex items-end gap-2">
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleSendFile(file, "image");
              e.target.value = "";
            }}
          />
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleSendFile(file, "file");
              e.target.value = "";
            }}
          />

          <Button
            variant="ghost"
            size="icon-sm"
            className="shrink-0"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <Smile className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="shrink-0"
            onClick={() => imageInputRef.current?.click()}
          >
            <ImageIcon className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="shrink-0"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          <div className="flex-1 relative">
            <textarea
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                if (!isTyping) {
                  setIsTyping(true);
                  handleTyping(true);
                }
              }}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              rows={1}
              className="flex w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 min-h-10 max-h-30"
            />
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            className="shrink-0"
            onClick={() => setIsRecording(!isRecording)}
          >
            {isRecording ? (
              <MicOff className="h-5 w-5 text-red-500" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </Button>
          <Button
            variant="gradient"
            size="icon"
            className="shrink-0"
            onClick={handleSend}
            disabled={!message.trim() && !isRecording}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Quick emoji picker */}
        <AnimatePresence>
          {showEmojiPicker && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex flex-wrap gap-2 mt-2 p-2 rounded-xl bg-background border"
            >
              {[
                "😊", "😂", "❤️", "👍", "🙏", "😍", "🎉", "🔥",
                "💯", "😘", "🥰", "💕", "😢", "🤔", "👋", "✨",
                "🌹", "💪", "🫶", "😊", "🤝", "🎂", "🕌", "☪️",
              ].map((emoji, index) => (
                <button
                        key={`${emoji}-${index}`}
                  onClick={() => {
                    setMessage((prev) => prev + emoji);
                    setShowEmojiPicker(false);
                  }}
                  className="text-xl hover:scale-125 transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function participantId(conversationId: string, userId: string): string {
  const parts = conversationId.split("-");
  return parts.find((p) => p !== userId) || "";
}

function groupReactions(reactions: Reaction[]) {
  const map = new Map<string, { count: number; reacted: boolean }>();
  for (const r of reactions) {
    const existing = map.get(r.emoji) || { count: 0, reacted: false };
    map.set(r.emoji, {
      count: existing.count + 1,
      reacted: existing.reacted || r.userId === "current-user", // Will be replaced with actual user ID
    });
  }
  return Array.from(map.entries()).map(([emoji, data]) => ({
    emoji,
    ...data,
  }));
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

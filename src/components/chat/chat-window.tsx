"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Smile,
  Paperclip,
  Image as ImageIcon,
  Mic,
  MoreVertical,
  Phone,
  Video,
  ArrowLeft,
  Check,
  CheckCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useChatStore, type Message } from "@/stores/chat-store";
import { useAuthStore } from "@/stores/auth-store";
import { useSocket } from "@/providers/socket-provider";
import { cn, formatRelativeTime, getInitials } from "@/lib/utils";

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
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const { messages, typingUsers, addMessage } = useChatStore();
  const { user } = useAuthStore();
  const { socket } = useSocket();

  const conversationMessages = messages[conversationId] || [];
  const isParticipantTyping = typingUsers[participantId(conversationId, user?.id || "")];

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationMessages]);

  const handleSend = async () => {
    if (!message.trim() || !user?.id) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId: user.id,
      receiverId: participantId(conversationId, user.id),
      content: message.trim(),
      type: "text",
      isRead: false,
      isDelivered: false,
      createdAt: new Date().toISOString(),
    };

    addMessage(conversationId, newMessage);
    setMessage("");

    if (socket) {
      socket.emit("send-message", newMessage);
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
            {isOnline ? "Online" : "Last seen recently"}
          </p>
        </div>
        <div className="flex gap-1">
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

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversationMessages.map((msg) => {
          const isOwn = msg.senderId === user?.id;
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn("flex", isOwn ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm",
                  isOwn
? "bg-linear-to-r from-primary to-primary/90 text-primary-foreground rounded-br-md"
                    : "glass-card rounded-bl-md"
                )}
              >
<p className="whitespace-pre-wrap wrap-break-word">{msg.content}</p>
                <div
                  className={cn(
                    "flex items-center gap-1 mt-1",
                    isOwn ? "justify-end" : "justify-start"
                  )}
                >
                  <span className="text-[10px] opacity-70">
                    {formatRelativeTime(msg.createdAt)}
                  </span>
                  {isOwn && (
                    msg.isRead ? (
                      <CheckCheck className="h-3 w-3 opacity-70" />
                    ) : msg.isDelivered ? (
                      <CheckCheck className="h-3 w-3 opacity-50" />
                    ) : (
                      <Check className="h-3 w-3 opacity-50" />
                    )
                  )}
                </div>
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
                  <div className="h-2 w-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="h-2 w-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="h-2 w-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border/50">
        <div className="flex items-end gap-2">
          <Button variant="ghost" size="icon-sm" className="shrink-0">
            <Smile className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon-sm" className="shrink-0">
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
          <Button variant="ghost" size="icon-sm" className="shrink-0">
            <Mic className="h-5 w-5" />
          </Button>
          <Button
            variant="gradient"
            size="icon"
            className="shrink-0"
            onClick={handleSend}
            disabled={!message.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function participantId(conversationId: string, userId: string): string {
  const parts = conversationId.split("-");
  return parts.find((p) => p !== userId) || "";
}
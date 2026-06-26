"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Send,
  Search,
  MessageCircle,
  MoreVertical,
  Phone,
  Video,
  Smile,
  Image,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const conversations = [
  {
    id: "1",
    name: "Ayesha R.",
    lastMessage: "That sounds great! Let's meet this weekend.",
    time: "2m ago",
    unread: 2,
    isOnline: true,
  },
  {
    id: "2",
    name: "Fatima K.",
    lastMessage: "Thank you for the kind words!",
    time: "1h ago",
    unread: 0,
    isOnline: true,
  },
  {
    id: "3",
    name: "Nadia S.",
    lastMessage: "I'd love to know more about your family.",
    time: "3h ago",
    unread: 1,
    isOnline: false,
  },
  {
    id: "4",
    name: "Maliha B.",
    lastMessage: "See you at the coffee shop! ☕",
    time: "1d ago",
    unread: 0,
    isOnline: false,
  },
];

const messages = [
  {
    id: "1",
    senderId: "them",
    content: "Assalamu Alaikum! How are you?",
    time: "10:30 AM",
  },
  {
    id: "2",
    senderId: "me",
    content: "Walaikum Assalam! I'm doing great, thank you. How about you?",
    time: "10:32 AM",
  },
  {
    id: "3",
    senderId: "them",
    content: "I'm good too! I really enjoyed reading your profile. We seem to have a lot in common.",
    time: "10:35 AM",
  },
  {
    id: "4",
    senderId: "me",
    content: "Thank you! I noticed that too. Especially our love for travel and cooking.",
    time: "10:38 AM",
  },
  {
    id: "5",
    senderId: "them",
    content: "Exactly! I also noticed we both value family traditions. That's really important to me.",
    time: "10:40 AM",
  },
  {
    id: "6",
    senderId: "me",
    content: "Same here. Family is everything. Would you like to meet sometime?",
    time: "10:42 AM",
  },
  {
    id: "7",
    senderId: "them",
    content: "That sounds great! Let's meet this weekend.",
    time: "10:45 AM",
  },
];

export default function DashboardMessagesPage() {
  const [selectedConversation, setSelectedConversation] = React.useState("1");
  const [newMessage, setNewMessage] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState("");

  const selectedConv = conversations.find((c) => c.id === selectedConversation);

  const filteredConversations = conversations.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      setNewMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-12">
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
            className="mb-6"
          >
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Messages</h1>
            <p className="text-muted-foreground">
              Chat with your matches in real-time.
            </p>
          </motion.div>

          <Card className="overflow-hidden" style={{ height: "calc(100vh - 280px)", minHeight: "500px" }}>
            <div className="flex h-full">
              {/* Conversation List */}
              <div className="w-full md:w-80 border-r border-border flex flex-col">
                <div className="p-3 border-b border-border">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search conversations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-10"
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {filteredConversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv.id)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 text-left hover:bg-accent/50 transition-colors border-b border-border/50",
                        selectedConversation === conv.id && "bg-accent/50"
                      )}
                    >
                      <div className="relative shrink-0">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {conv.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {conv.isOnline && (
                          <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-background" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-sm truncate">{conv.name}</h3>
                          <span className="text-[10px] text-muted-foreground shrink-0">{conv.time}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
                          {conv.unread > 0 && (
                            <Badge variant="default" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] shrink-0 ml-2">
                              {conv.unread}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Area */}
              <div className="hidden md:flex flex-col flex-1">
                {selectedConv ? (
                  <>
                    {/* Chat Header */}
                    <div className="flex items-center justify-between p-4 border-b border-border">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {selectedConv.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-sm">{selectedConv.name}</h3>
                          <p className="text-xs text-emerald-500">Online</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-9 w-9">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9">
                          <Video className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={cn(
                            "flex",
                            msg.senderId === "me" ? "justify-end" : "justify-start"
                          )}
                        >
                          <div
                            className={cn(
                              "max-w-[70%] rounded-2xl px-4 py-2.5",
                              msg.senderId === "me"
                                ? "bg-primary text-primary-foreground rounded-br-md"
                                : "bg-muted rounded-bl-md"
                            )}
                          >
                            <p className="text-sm">{msg.content}</p>
                            <p
                              className={cn(
                                "text-[10px] mt-1",
                                msg.senderId === "me"
                                  ? "text-primary-foreground/70"
                                  : "text-muted-foreground"
                              )}
                            >
                              {msg.time}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Message Input */}
                    <div className="p-4 border-t border-border">
                      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                        <Button type="button" variant="ghost" size="icon" className="h-10 w-10 shrink-0">
                          <Image className="h-5 w-5" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" className="h-10 w-10 shrink-0">
                          <Smile className="h-5 w-5" />
                        </Button>
                        <Input
                          placeholder="Type a message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          className="flex-1"
                        />
                        <Button type="submit" variant="gradient" size="icon" className="h-10 w-10 shrink-0">
                          <Send className="h-5 w-5" />
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
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
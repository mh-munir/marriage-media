"use client";

export const dynamic = "force-dynamic";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Heart,
  ArrowLeft,
  Send,
  Inbox,
  CheckCircle,
  XCircle,
  Clock,
  User,
  MapPin,
  Briefcase,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type Tab = "received" | "sent" | "accepted";

const receivedInterests = [
  {
    id: "1",
    name: "Farhana K.",
    age: 24,
    location: "Dhaka",
    profession: "Engineer",
    message: "Hi! I came across your profile and we seem to have a lot in common. Would love to connect!",
    time: "2 hours ago",
    status: "pending" as const,
  },
  {
    id: "2",
    name: "Nusrat A.",
    age: 26,
    location: "Chittagong",
    profession: "Doctor",
    message: "Assalamu Alaikum! Your profile caught my attention. Let's get to know each other.",
    time: "1 day ago",
    status: "pending" as const,
  },
  {
    id: "3",
    name: "Sabrina R.",
    age: 23,
    location: "Sylhet",
    profession: "Teacher",
    message: "Hello! I think we could be a great match. Looking forward to hearing from you.",
    time: "3 days ago",
    status: "pending" as const,
  },
];

const sentInterests = [
  {
    id: "4",
    name: "Tasnia M.",
    age: 25,
    location: "Dhaka",
    profession: "IT Professional",
    message: "Hi Tasnia! Your profile is amazing. Let's connect!",
    time: "5 hours ago",
    status: "pending" as const,
  },
  {
    id: "5",
    name: "Maliha B.",
    age: 22,
    location: "Khulna",
    profession: "Student",
    message: "Hello Maliha! I think we have similar values. Would love to chat.",
    time: "2 days ago",
    status: "accepted" as const,
  },
];

const acceptedInterests = [
  {
    id: "6",
    name: "Ayesha R.",
    age: 26,
    location: "Chittagong",
    profession: "Doctor",
    acceptedAt: "1 day ago",
  },
  {
    id: "7",
    name: "Maliha B.",
    age: 22,
    location: "Khulna",
    profession: "Student",
    acceptedAt: "2 days ago",
  },
];

export default function DashboardInterestsPage() {
  const [activeTab, setActiveTab] = React.useState<Tab>("received");

  const tabs: { id: Tab; label: string; count: number; icon: React.ElementType }[] = [
    { id: "received", label: "Received", count: receivedInterests.length, icon: Inbox },
    { id: "sent", label: "Sent", count: sentInterests.length, icon: Send },
    { id: "accepted", label: "Accepted", count: acceptedInterests.length, icon: CheckCircle },
  ];

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
            className="mb-8"
          >
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Interests</h1>
            <p className="text-muted-foreground">
              Manage your received, sent, and accepted interests.
            </p>
          </motion.div>

          {/* Tabs */}
          <div className="flex items-center gap-1 mb-6 bg-muted p-1 rounded-xl w-fit">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
                <Badge variant="secondary" className="text-xs ml-1">
                  {tab.count}
                </Badge>
              </button>
            ))}
          </div>

          {/* Received Interests */}
          {activeTab === "received" && (
            <div className="space-y-4">
              {receivedInterests.map((interest, index) => (
                <motion.div
                  key={interest.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-14 w-14 shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {interest.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{interest.name}</h3>
                              <span className="text-sm text-muted-foreground">{interest.age} yrs</span>
                            </div>
                            <span className="text-xs text-muted-foreground">{interest.time}</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {interest.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Briefcase className="h-3 w-3" />
                              {interest.profession}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground italic mb-3">
                            &ldquo;{interest.message}&rdquo;
                          </p>
                          <div className="flex items-center gap-2">
                            <Button variant="gradient" size="sm">
                              <CheckCircle className="h-3.5 w-3.5 mr-1" />
                              Accept
                            </Button>
                            <Button variant="outline" size="sm">
                              <XCircle className="h-3.5 w-3.5 mr-1" />
                              Reject
                            </Button>
                            <Button variant="ghost" size="sm">
                              View Profile
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Sent Interests */}
          {activeTab === "sent" && (
            <div className="space-y-4">
              {sentInterests.map((interest, index) => (
                <motion.div
                  key={interest.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-14 w-14 shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {interest.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{interest.name}</h3>
                              <span className="text-sm text-muted-foreground">{interest.age} yrs</span>
                            </div>
                            <span className="text-xs text-muted-foreground">{interest.time}</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {interest.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Briefcase className="h-3 w-3" />
                              {interest.profession}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground italic mb-3">
                            &ldquo;{interest.message}&rdquo;
                          </p>
                          <div className="flex items-center gap-2">
                            {interest.status === "pending" ? (
                              <Badge variant="outline" className="text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                Pending
                              </Badge>
                            ) : (
                              <Badge variant="success" className="text-xs">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Accepted
                              </Badge>
                            )}
                            <Button variant="ghost" size="sm">
                              Withdraw
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Accepted Interests */}
          {activeTab === "accepted" && (
            <div className="space-y-4">
              {acceptedInterests.map((interest, index) => (
                <motion.div
                  key={interest.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-14 w-14 shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {interest.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{interest.name}</h3>
                              <span className="text-sm text-muted-foreground">{interest.age} yrs</span>
                            </div>
                            <Badge variant="success" className="text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Accepted
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {interest.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Briefcase className="h-3 w-3" />
                              {interest.profession}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mb-3">
                            Matched {interest.acceptedAt}
                          </p>
                          <div className="flex items-center gap-2">
                            <Button variant="gradient" size="sm">
                              <Heart className="h-3.5 w-3.5 mr-1" />
                              Start Chat
                            </Button>
                            <Button variant="outline" size="sm">
                              View Profile
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
              {acceptedInterests.length === 0 && (
                <div className="text-center py-12">
                  <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No accepted interests yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
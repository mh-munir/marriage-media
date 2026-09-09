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

type InterestItem = {
  _id: string;
  status: "pending" | "accepted" | "rejected" | "cancelled";
  message?: string;
  createdAt?: string;
  senderProfile?: {
    firstName?: string;
    lastName?: string;
    age?: number | null;
    profession?: string;
    district?: string;
    division?: string;
  };
  receiverProfile?: {
    firstName?: string;
    lastName?: string;
    age?: number | null;
    profession?: string;
    district?: string;
    division?: string;
  };
  listOrigin?: "received" | "sent";
};

export default function DashboardInterestsPage() {
  const [activeTab, setActiveTab] = React.useState<Tab>("received");
  const [receivedInterests, setReceivedInterests] = React.useState<InterestItem[]>([]);
  const [sentInterests, setSentInterests] = React.useState<InterestItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);

  const acceptedInterests = React.useMemo(() => {
    const receivedAccepted = receivedInterests.filter((interest) => interest.status === "accepted").map((interest) => ({ ...interest, listOrigin: "received" as const }));
    const sentAccepted = sentInterests.filter((interest) => interest.status === "accepted").map((interest) => ({ ...interest, listOrigin: "sent" as const }));
    return [...receivedAccepted, ...sentAccepted];
  }, [receivedInterests, sentInterests]);

  const tabs: { id: Tab; label: string; count: number; icon: React.ElementType }[] = [
    { id: "received", label: "Received", count: receivedInterests.length, icon: Inbox },
    { id: "sent", label: "Sent", count: sentInterests.length, icon: Send },
    { id: "accepted", label: "Accepted", count: acceptedInterests.length, icon: CheckCircle },
  ];

  React.useEffect(() => {
    let isMounted = true;

    async function loadInterests() {
      setLoading(true);
      try {
        const [receivedResponse, sentResponse] = await Promise.all([
          fetch("/api/interests?type=received"),
          fetch("/api/interests?type=sent"),
        ]);

        const receivedData = (await receivedResponse.json()) as { interests?: InterestItem[] };
        const sentData = (await sentResponse.json()) as { interests?: InterestItem[] };

        if (isMounted) {
          setReceivedInterests(Array.isArray(receivedData.interests) ? receivedData.interests : []);
          setSentInterests(Array.isArray(sentData.interests) ? sentData.interests : []);
        }
      } catch {
        if (isMounted) {
          setReceivedInterests([]);
          setSentInterests([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void loadInterests();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleInterestAction(interestId: string, action: "accept" | "reject" | "cancel") {
    setUpdatingId(interestId);
    try {
      const response = await fetch("/api/interests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interestId, action }),
      });
      if (!response.ok) {
        const errorData = (await response.json()) as { error?: string };
        throw new Error(errorData.error || "Unable to update interest");
      }
      await Promise.all([
        fetch("/api/interests?type=received"),
        fetch("/api/interests?type=sent"),
      ]).then(async ([receivedResponse, sentResponse]) => {
        const receivedData = (await receivedResponse.json()) as { interests?: InterestItem[] };
        const sentData = (await sentResponse.json()) as { interests?: InterestItem[] };
        setReceivedInterests(Array.isArray(receivedData.interests) ? receivedData.interests : []);
        setSentInterests(Array.isArray(sentData.interests) ? sentData.interests : []);
      });
    } catch (error) {
      console.error(error);
    } finally {
      setUpdatingId(null);
    }
  }

  const getDisplayName = (interest: InterestItem, source: "received" | "sent") => {
    const profile = source === "received" ? interest.senderProfile : interest.receiverProfile;
    return [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") || "Profile";
  };

  const getDisplayLocation = (interest: InterestItem, source: "received" | "sent") => {
    const profile = source === "received" ? interest.senderProfile : interest.receiverProfile;
    return profile?.district || profile?.division || "Bangladesh";
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-30 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Interests</h1>
            <p className="text-muted-foreground">Manage your received, sent, and accepted interests.</p>
          </motion.div>

          <div className="flex items-center gap-1 mb-6 bg-muted p-1 rounded-xl w-fit">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                <tab.icon className="h-4 w-4" />
                {tab.label}
                <Badge variant="secondary" className="text-xs ml-1">{tab.count}</Badge>
              </button>
            ))}
          </div>

          {loading ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Loading your interests…</div>
          ) : activeTab === "received" ? (
            <div className="space-y-4">
              {receivedInterests.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No incoming interests right now.</div>
              ) : receivedInterests.map((interest, index) => (
                <motion.div key={interest._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-14 w-14 shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">{getDisplayName(interest, "received").charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{getDisplayName(interest, "received")}</h3>
                              <span className="text-sm text-muted-foreground">{interest.senderProfile?.age ? `${interest.senderProfile.age} yrs` : "Age hidden"}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">{interest.createdAt ? new Date(interest.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Recently sent"}</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{getDisplayLocation(interest, "received")}</span>
                            <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{interest.senderProfile?.profession || "Profession hidden"}</span>
                          </div>
                          <p className="text-sm text-muted-foreground italic mb-3">&ldquo;{interest.message || "Interested in getting to know you better."}&rdquo;</p>
                          <div className="flex items-center gap-2">
                            <Button variant="gradient" size="sm" onClick={() => void handleInterestAction(interest._id, "accept")} disabled={updatingId === interest._id}>
                              <CheckCircle className="h-3.5 w-3.5 mr-1" />
                              {updatingId === interest._id ? "Working…" : "Accept"}
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => void handleInterestAction(interest._id, "reject")} disabled={updatingId === interest._id}>
                              <XCircle className="h-3.5 w-3.5 mr-1" />
                              Reject
                            </Button>
                            <Button variant="ghost" size="sm">View Profile</Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : activeTab === "sent" ? (
            <div className="space-y-4">
              {sentInterests.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">You haven&apos;t sent any interests yet.</div>
              ) : sentInterests.map((interest, index) => (
                <motion.div key={interest._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-14 w-14 shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">{getDisplayName(interest, "sent").charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{getDisplayName(interest, "sent")}</h3>
                              <span className="text-sm text-muted-foreground">{interest.receiverProfile?.age ? `${interest.receiverProfile.age} yrs` : "Age hidden"}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">{interest.createdAt ? new Date(interest.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Recently sent"}</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{getDisplayLocation(interest, "sent")}</span>
                            <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{interest.receiverProfile?.profession || "Profession hidden"}</span>
                          </div>
                          <p className="text-sm text-muted-foreground italic mb-3">&ldquo;{interest.message || "Hello! I would like to connect."}&rdquo;</p>
                          <div className="flex items-center gap-2">
                            {interest.status === "pending" ? (
                              <Badge variant="outline" className="text-xs"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
                            ) : (
                              <Badge variant="success" className="text-xs"><CheckCircle className="h-3 w-3 mr-1" />Accepted</Badge>
                            )}
                            {interest.status === "pending" && (
                              <Button variant="ghost" size="sm" onClick={() => void handleInterestAction(interest._id, "cancel")} disabled={updatingId === interest._id}>Withdraw</Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {acceptedInterests.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No accepted interests yet.</div>
              ) : acceptedInterests.map((interest, index) => (
                <motion.div key={`${interest._id}-${interest.listOrigin}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-14 w-14 shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">{(interest.listOrigin === "received" ? getDisplayName(interest, "received") : getDisplayName(interest, "sent")).charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{interest.listOrigin === "received" ? getDisplayName(interest, "received") : getDisplayName(interest, "sent")}</h3>
                              <span className="text-sm text-muted-foreground">{(interest.listOrigin === "received" ? interest.senderProfile?.age : interest.receiverProfile?.age) ? `${interest.listOrigin === "received" ? interest.senderProfile?.age : interest.receiverProfile?.age} yrs` : "Age hidden"}</span>
                            </div>
                            <Badge variant="success" className="text-xs"><CheckCircle className="h-3 w-3 mr-1" />Accepted</Badge>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{interest.listOrigin === "received" ? getDisplayLocation(interest, "received") : getDisplayLocation(interest, "sent")}</span>
                            <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{interest.listOrigin === "received" ? interest.senderProfile?.profession : interest.receiverProfile?.profession}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mb-3">Matched {interest.createdAt ? new Date(interest.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "recently"}</p>
                          <div className="flex items-center gap-2">
                            <Button variant="gradient" size="sm"><Heart className="h-3.5 w-3.5 mr-1" />Start Chat</Button>
                            <Button variant="outline" size="sm">View Profile</Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
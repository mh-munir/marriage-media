"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Settings, Bell, Shield, Smartphone, Link as LinkIcon, Copy, Check } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SettingsPage() {
  const [preferences, setPreferences] = React.useState<Record<string, unknown>>({});
  const [referral, setReferral] = React.useState<{ referralCode: string; totalReferrals: number; shareUrl: string } | null>(null);
  const [sessions, setSessions] = React.useState<Record<string, unknown>[]>([]);
  const [copied, setCopied] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [prefRes, refRes, sessRes] = await Promise.all([
        fetch("/api/notifications/preferences"),
        fetch("/api/referral"),
        fetch("/api/device/sessions"),
      ]);

      const prefData = await prefRes.json();
      const refData = await refRes.json();
      const sessData = await sessRes.json();

      setPreferences(prefData.preferences || {});
      setReferral(refData);
      setSessions(sessData.sessions || []);
    } catch {
      console.error("Failed to fetch settings");
    } finally {
      setLoading(false);
    }
  }

  async function updatePreferences(updates: Record<string, unknown>) {
    try {
      const res = await fetch("/api/notifications/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      setPreferences(data.preferences);
    } catch {
      console.error("Failed to update preferences");
    }
  }

  function copyReferralCode() {
    if (referral?.shareUrl) {
      navigator.clipboard.writeText(referral.shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function terminateSession(sessionId: string) {
    try {
      await fetch("/api/device/sessions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      setSessions(sessions.filter((s) => (s as Record<string, unknown>)._id !== sessionId));
    } catch {
      console.error("Failed to terminate session");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 pb-12">
          <div className="mx-auto max-w-4xl px-4">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-muted rounded-xl" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  const emailPrefs = (preferences as Record<string, Record<string, boolean>>).email || {};
  const pushPrefs = (preferences as Record<string, Record<string, boolean>>).push || {};

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-2xl font-bold mb-2">Settings</h1>
            <p className="text-muted-foreground mb-8">Manage your account settings and preferences</p>
          </motion.div>

          <Tabs defaultValue="notifications">
            <TabsList className="mb-6">
              <TabsTrigger value="notifications"><Bell className="h-4 w-4 mr-2" />Notifications</TabsTrigger>
              <TabsTrigger value="security"><Shield className="h-4 w-4 mr-2" />Security</TabsTrigger>
              <TabsTrigger value="devices"><Smartphone className="h-4 w-4 mr-2" />Devices</TabsTrigger>
              <TabsTrigger value="referral"><LinkIcon className="h-4 w-4 mr-2" />Referral</TabsTrigger>
            </TabsList>

            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Email Notifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(emailPrefs).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                      <Switch
                        checked={!!value}
                        onCheckedChange={(checked: boolean) =>
                          updatePreferences({ email: { ...emailPrefs, [key]: checked } })
                        }
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Push Notifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(pushPrefs).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                      <Switch
                        checked={!!value}
                        onCheckedChange={(checked: boolean) =>
                          updatePreferences({ push: { ...pushPrefs, [key]: checked } })
                        }
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">Manage your password and security preferences.</p>
                  <Button variant="outline">Change Password</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="devices">
              <Card>
                <CardHeader>
                  <CardTitle>Active Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  {sessions.length === 0 ? (
                    <p className="text-muted-foreground">No active sessions.</p>
                  ) : (
                    <div className="space-y-3">
                      {sessions.map((session) => (
                        <div key={session._id as string} className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                          <div>
                            <p className="font-medium">{(session.deviceBrand as string) || "Unknown"} · {(session.browser as string) || "Unknown"}</p>
                            <p className="text-sm text-muted-foreground">{(session.os as string) || "Unknown"} · {(session.ipAddress as string) || ""}</p>
                          </div>
                          <Button size="sm" variant="ghost" onClick={() => terminateSession(session._id as string)}>
                            Terminate
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="referral">
              <Card>
                <CardHeader>
                  <CardTitle>Referral Program</CardTitle>
                </CardHeader>
                <CardContent>
                  {referral && (
                    <div className="space-y-4">
                      <p className="text-muted-foreground">Share your referral code and earn 30 days of premium for each friend who joins!</p>
                      <div className="flex items-center gap-2">
                        <code className="px-4 py-2 bg-muted rounded-lg text-lg font-mono">{referral.referralCode}</code>
                        <Button size="sm" variant="outline" onClick={copyReferralCode}>
                          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">Total referrals: <Badge variant="secondary">{referral.totalReferrals}</Badge></p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
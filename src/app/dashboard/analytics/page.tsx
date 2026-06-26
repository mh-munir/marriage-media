"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Eye, Users, TrendingUp, Calendar } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/utils";

interface DailyView {
  _id: string;
  views: number;
  uniqueVisitors: number;
}

interface Viewer {
  viewerId: { _id: string; email: string } | string;
  viewCount: number;
  lastViewedAt: string;
}

interface AnalyticsData {
  summary: { totalViews: number; uniqueViewers: number; period: number };
  dailyViews: DailyView[];
  topViewers: Viewer[];
  recentViews: Viewer[];
}

export default function AnalyticsPage() {
  const [data, setData] = React.useState<AnalyticsData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [period, setPeriod] = React.useState("30");

  React.useEffect(() => {
    fetchAnalytics();
  }, [period]);

  async function fetchAnalytics() {
    try {
      const res = await fetch(`/api/analytics/visitors?period=${period}`);
      const result = await res.json();
      setData(result);
    } catch {
      console.error("Failed to fetch analytics");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 pb-12">
          <div className="mx-auto max-w-6xl px-4">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => <div key={i} className="h-32 bg-muted rounded-xl" />)}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-2xl font-bold mb-2">Visitor Analytics</h1>
            <p className="text-muted-foreground">Track who views your profile</p>
          </motion.div>

          {/* Period Selector */}
          <div className="flex gap-2 mb-6">
            {["7", "30", "90"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${period === p ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}
              >
                {p} days
              </button>
            ))}
          </div>

          {/* Summary Cards */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-500/10"><Eye className="h-5 w-5 text-blue-500" /></div>
                  <div>
                    <div className="text-2xl font-bold">{data?.summary?.totalViews || 0}</div>
                    <div className="text-xs text-muted-foreground">Total Views</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10"><Users className="h-5 w-5 text-emerald-500" /></div>
                  <div>
                    <div className="text-2xl font-bold">{data?.summary?.uniqueViewers || 0}</div>
                    <div className="text-xs text-muted-foreground">Unique Visitors</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-500/10"><TrendingUp className="h-5 w-5 text-purple-500" /></div>
                  <div>
                    <div className="text-2xl font-bold">{data?.dailyViews?.length || 0}</div>
                    <div className="text-xs text-muted-foreground">Active Days</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/10"><Calendar className="h-5 w-5 text-amber-500" /></div>
                  <div>
                    <div className="text-2xl font-bold">{data?.summary?.period || 30}</div>
                    <div className="text-xs text-muted-foreground">Day Period</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Top Viewers */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardHeader>
                <CardTitle>Top Viewers</CardTitle>
              </CardHeader>
              <CardContent>
                {(!data?.topViewers || data.topViewers.length === 0) ? (
                  <p className="text-muted-foreground text-center py-8">No viewer data yet. Complete your profile to attract more visitors!</p>
                ) : (
                  <div className="space-y-3">
                    {data.topViewers.map((viewer, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-accent/50">
                        <div>
                          <p className="font-medium">
                            {typeof viewer.viewerId === "object" ? viewer.viewerId.email : "Anonymous"}
                          </p>
                          <p className="text-sm text-muted-foreground">Last viewed: {formatRelativeTime(viewer.lastViewedAt)}</p>
                        </div>
                        <Badge variant="secondary">{viewer.viewCount} views</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
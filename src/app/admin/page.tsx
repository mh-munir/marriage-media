"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  Bot,
  CreditCard,
  DollarSign,
  FileBarChart,
  MessageCircle,
  Shield,
  TrendingUp,
  UserCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface MetricPoint {
  _id: string;
  registrations?: number;
  revenue?: number;
  payments?: number;
  subscriptions?: number;
  completed?: number;
}

interface BreakdownItem {
  _id: string;
  count: number;
  total?: number;
}

interface HeatmapItem {
  _id: {
    dayOfWeek: number;
    hour: number;
  };
  activeUsers: number;
}

interface AdminAnalytics {
  overview: {
    totalUsers: number;
    newUsers: number;
    registrationGrowthRate: number;
    totalProfiles: number;
    premiumUsers: number;
    verifiedUsers: number;
    activeUsers: number;
    totalPayments: number;
    totalRevenue: number;
    revenueGrowthRate: number;
    pendingReports: number;
    pendingVerifications: number;
    fraudAlerts: number;
    premiumConversionRate: number;
    paymentSuccessRate: number;
    activeConversations: number;
    sentMessages: number;
  };
  trends: {
    dailyRegistrations: MetricPoint[];
    dailyRevenue: MetricPoint[];
    subscriptionGrowth: MetricPoint[];
  };
  breakdowns: {
    paymentMethods: BreakdownItem[];
    paymentStatuses: BreakdownItem[];
    planBreakdown: BreakdownItem[];
    genderDistribution: BreakdownItem[];
    ageDistribution: BreakdownItem[];
  };
  aiAnalytics: {
    requests: number;
    fakeDetectionFlags: number;
    flaggedRate: number;
  };
  userActivityHeatmap: HeatmapItem[];
  reports: {
    daily: MetricPoint[];
    monthly: MetricPoint[];
  };
  period: number;
}

const periods = ["7", "30", "90", "365"];
const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = React.useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [period, setPeriod] = React.useState("30");

  const fetchAnalytics = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics?period=${period}`);
      const data = (await res.json()) as AdminAnalytics;
      setAnalytics(data);
    } catch (error) {
      console.error("Failed to fetch analytics", error);
    } finally {
      setLoading(false);
    }
  }, [period]);

  React.useEffect(() => {
    void fetchAnalytics();
  }, [fetchAnalytics]);

  const maxHeat = React.useMemo(
    () => Math.max(...(analytics?.userActivityHeatmap.map((item) => item.activeUsers) || [1])),
    [analytics?.userActivityHeatmap]
  );

  const heatmap = React.useMemo(() => {
    const index = new Map(
      analytics?.userActivityHeatmap.map((item) => [
        `${item._id.dayOfWeek}-${item._id.hour}`,
        item.activeUsers,
      ]) || []
    );

    return weekdayLabels.map((label, dayIndex) => ({
      label,
      values: Array.from({ length: 24 }, (_, hour) => ({
        hour,
        value: index.get(`${dayIndex + 1}-${hour}`) || 0,
      })),
    }));
  }, [analytics?.userActivityHeatmap]);

  const overview = analytics?.overview;
  const stats = [
    {
      label: "Revenue",
      value: formatCurrency(overview?.totalRevenue || 0),
      detail: `${overview?.revenueGrowthRate || 0}% vs previous period`,
      icon: DollarSign,
      tone: "text-emerald-600 bg-emerald-500/10",
    },
    {
      label: "Active Users",
      value: overview?.activeUsers || 0,
      detail: `${overview?.totalUsers || 0} total accounts`,
      icon: Users,
      tone: "text-blue-600 bg-blue-500/10",
    },
    {
      label: "Registrations",
      value: overview?.newUsers || 0,
      detail: `${overview?.registrationGrowthRate || 0}% growth`,
      icon: UserCheck,
      tone: "text-violet-600 bg-violet-500/10",
    },
    {
      label: "Conversion Rate",
      value: `${overview?.premiumConversionRate || 0}%`,
      detail: `${overview?.premiumUsers || 0} premium users`,
      icon: TrendingUp,
      tone: "text-amber-600 bg-amber-500/10",
    },
    {
      label: "Payments",
      value: overview?.totalPayments || 0,
      detail: `${overview?.paymentSuccessRate || 0}% success rate`,
      icon: CreditCard,
      tone: "text-cyan-600 bg-cyan-500/10",
    },
    {
      label: "AI Analytics",
      value: analytics?.aiAnalytics.requests || 0,
      detail: `${analytics?.aiAnalytics.flaggedRate || 0}% flagged`,
      icon: Bot,
      tone: "text-fuchsia-600 bg-fuchsia-500/10",
    },
    {
      label: "Chat Activity",
      value: overview?.sentMessages || 0,
      detail: `${overview?.activeConversations || 0} active conversations`,
      icon: MessageCircle,
      tone: "text-indigo-600 bg-indigo-500/10",
    },
    {
      label: "Risk Queue",
      value: (overview?.pendingReports || 0) + (overview?.fraudAlerts || 0),
      detail: `${overview?.pendingVerifications || 0} verifications pending`,
      icon: AlertTriangle,
      tone: "text-red-600 bg-red-500/10",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main-content" className="pt-20 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <Badge variant="secondary" className="mb-3">
                Enterprise Analytics
              </Badge>
              <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-muted-foreground">
                Revenue, users, subscriptions, AI, payments, and operational health.
              </p>
            </div>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Analytics date range">
              {periods.map((option) => (
                <Button
                  key={option}
                  type="button"
                  variant={period === option ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPeriod(option)}
                  aria-pressed={period === option}
                >
                  {option} days
                </Button>
              ))}
            </div>
          </motion.div>

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-live="polite">
              {Array.from({ length: 8 }, (_, index) => (
                <div key={index} className="h-32 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Key metrics">
                {stats.map((stat) => (
                  <Card key={stat.label}>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3">
                        <div className={`rounded-xl p-2.5 ${stat.tone}`}>
                          <stat.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold">{stat.value}</div>
                          <div className="text-xs text-muted-foreground">{stat.label}</div>
                        </div>
                      </div>
                      <p className="mt-3 text-xs text-muted-foreground">{stat.detail}</p>
                    </CardContent>
                  </Card>
                ))}
              </section>

              <section className="grid gap-6 lg:grid-cols-2" aria-label="Trend charts">
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue and Registrations</CardTitle>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analytics?.reports.daily || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Area dataKey="revenue" stroke="#e11d48" fill="#fecdd3" name="Revenue" />
                        <Area dataKey="registrations" stroke="#2563eb" fill="#bfdbfe" name="Registrations" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Subscription Growth</CardTitle>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics?.trends.subscriptionGrowth || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="_id" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="subscriptions" fill="#7c3aed" name="Subscriptions" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </section>

              <section className="grid gap-6 lg:grid-cols-3" aria-label="Breakdowns">
                <BreakdownCard title="Payment Analytics" items={analytics?.breakdowns.paymentMethods || []} />
                <BreakdownCard title="Payment Status" items={analytics?.breakdowns.paymentStatuses || []} />
                <BreakdownCard title="Plan Breakdown" items={analytics?.breakdowns.planBreakdown || []} />
              </section>

              <section className="grid gap-6 lg:grid-cols-[2fr_1fr]" aria-label="Activity and AI">
                <Card>
                  <CardHeader>
                    <CardTitle>User Activity Heatmap</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 overflow-x-auto">
                    {heatmap.map((day) => (
                      <div key={day.label} className="flex `min-w-[720px]` items-center gap-2">
                        <span className="w-10 text-xs text-muted-foreground">{day.label}</span>
                        {day.values.map((cell) => (
                          <span
                            key={`${day.label}-${cell.hour}`}
                            title={`${day.label} ${cell.hour}:00 - ${cell.value} active users`}
                            className="h-5 w-6 rounded-sm bg-primary"
                            style={{ opacity: cell.value ? Math.max(cell.value / maxHeat, 0.18) : 0.06 }}
                          />
                        ))}
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>AI Analytics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <MetricRow icon={Bot} label="AI Requests" value={analytics?.aiAnalytics.requests || 0} />
                    <MetricRow
                      icon={Shield}
                      label="Fake Detection Flags"
                      value={analytics?.aiAnalytics.fakeDetectionFlags || 0}
                    />
                    <MetricRow icon={Activity} label="Flagged Rate" value={`${analytics?.aiAnalytics.flaggedRate || 0}%`} />
                  </CardContent>
                </Card>
              </section>

              <section className="grid gap-6 lg:grid-cols-2" aria-label="Reports">
                <ReportCard title="Daily Reports" rows={analytics?.reports.daily || []} />
                <ReportCard title="Monthly Reports" rows={analytics?.reports.monthly || []} />
              </section>

              <Card>
                <CardHeader>
                  <CardTitle>Operations</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  {[
                    { label: "Security", href: "/admin/security" },
                    { label: "Users", href: "/admin/users" },
                    { label: "Verifications", href: "/admin/verifications" },
                    { label: "Fraud", href: "/admin/fraud" },
                    { label: "Health", href: "/api/health" },
                  ].map((link) => (
                    <Button key={link.href} asChild variant="outline">
                      <Link href={link.href}>
                        <FileBarChart className="h-4 w-4" />
                        {link.label}
                      </Link>
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function BreakdownCard({ title, items }: { title: string; items: BreakdownItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No data for this period.</p>
        ) : (
          items.map((item) => (
            <div key={item._id || "unknown"} className="flex items-center justify-between rounded-lg bg-accent/50 p-3">
              <div>
                <p className="text-sm font-medium capitalize">{item._id || "Unknown"}</p>
                <p className="text-xs text-muted-foreground">{item.count} records</p>
              </div>
              <Badge variant="secondary">{item.total ? formatCurrency(item.total) : item.count}</Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function MetricRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-accent/50 p-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <span className="text-sm">{label}</span>
      </div>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

function ReportCard({ title, rows }: { title: string; rows: MetricPoint[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-muted-foreground">
            <tr>
              <th className="pb-2 font-medium">Period</th>
              <th className="pb-2 font-medium">Registrations</th>
              <th className="pb-2 font-medium">Payments</th>
              <th className="pb-2 font-medium">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(-8).map((row) => (
              <tr key={row._id} className="border-t border-border">
                <td className="py-3">{row._id}</td>
                <td className="py-3">{row.registrations || 0}</td>
                <td className="py-3">{row.payments || row.completed || 0}</td>
                <td className="py-3">{formatCurrency(row.revenue || 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

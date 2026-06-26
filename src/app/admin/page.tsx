"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Users,
  CreditCard,
  Shield,
  AlertTriangle,
  TrendingUp,
  UserCheck,
  Eye,
  DollarSign,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";

interface AdminOverview {
  totalUsers: number;
  newUsers: number;
  totalProfiles: number;
  premiumUsers: number;
  verifiedUsers: number;
  activeUsers: number;
  totalRevenue: number;
  pendingReports: number;
  pendingVerifications: number;
  fraudAlerts: number;
  premiumConversionRate: number;
}

export default function AdminDashboardPage() {
  const [overview, setOverview] = React.useState<AdminOverview | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [period, setPeriod] = React.useState("30");

  React.useEffect(() => {
    fetchAnalytics();
  }, [period]);

  async function fetchAnalytics() {
    try {
      const res = await fetch(`/api/admin/analytics?period=${period}`);
      const data = await res.json();
      setOverview(data.overview);
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
          <div className="mx-auto max-w-7xl px-4">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4].map((i) => <div key={i} className="h-32 bg-muted rounded-xl" />)}
            </div>
          </div>
        </main>
      </div>
    );
  }

  const stats = [
    { label: "Total Users", value: overview?.totalUsers || 0, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "New Users", value: overview?.newUsers || 0, icon: UserCheck, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Premium Users", value: overview?.premiumUsers || 0, icon: CreditCard, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Revenue", value: formatCurrency(overview?.totalRevenue || 0), icon: DollarSign, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Active Users", value: overview?.activeUsers || 0, icon: Eye, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Verified", value: overview?.verifiedUsers || 0, icon: Shield, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Conversion Rate", value: `${overview?.premiumConversionRate || 0}%`, icon: TrendingUp, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Fraud Alerts", value: overview?.fraudAlerts || 0, icon: AlertTriangle, color: "text-red-500", bg: "bg-red-500/10" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-muted-foreground">Platform overview and analytics</p>
            </div>
            <div className="flex gap-2 mt-4 sm:mt-0">
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
          </motion.div>

          {/* Alert Cards */}
          {(overview?.pendingReports || 0) + (overview?.pendingVerifications || 0) + (overview?.fraudAlerts || 0) > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid sm:grid-cols-3 gap-4 mb-8">
              {overview?.pendingVerifications ? (
                <Card className="border-yellow-200 dark:border-yellow-800">
                  <CardContent className="p-4 flex items-center gap-3">
                    <Shield className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="font-medium">{overview.pendingVerifications} Pending</p>
                      <p className="text-xs text-muted-foreground">Verification requests</p>
                    </div>
                  </CardContent>
                </Card>
              ) : null}
              {overview?.pendingReports ? (
                <Card className="border-orange-200 dark:border-orange-800">
                  <CardContent className="p-4 flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="font-medium">{overview.pendingReports} Pending</p>
                      <p className="text-xs text-muted-foreground">User reports</p>
                    </div>
                  </CardContent>
                </Card>
              ) : null}
              {overview?.fraudAlerts ? (
                <Card className="border-red-200 dark:border-red-800">
                  <CardContent className="p-4 flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="font-medium">{overview.fraudAlerts} Detected</p>
                      <p className="text-xs text-muted-foreground">Fraud alerts</p>
                    </div>
                  </CardContent>
                </Card>
              ) : null}
            </motion.div>
          )}

          {/* Stats Grid */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => (
              <Card key={stat.label} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <div className="text-xs text-muted-foreground">{stat.label}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* Quick Links */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardHeader>
                <CardTitle>Admin Quick Links</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { label: "Manage Users", href: "/admin/users" },
                    { label: "Verifications", href: "/admin/verifications" },
                    { label: "Fraud Detection", href: "/admin/fraud" },
                    { label: "CMS", href: "/admin/cms" },
                    { label: "Coupons", href: "/admin/coupons" },
                    { label: "Email Templates", href: "/admin/email-templates" },
                    { label: "Reports", href: "/admin/reports" },
                    { label: "Settings", href: "/admin/settings" },
                  ].map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      className="block p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors text-center font-medium text-sm"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
"use client";

export const dynamic = "force-dynamic";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Shield,
  AlertTriangle,
  Lock,
  Unlock,
  Eye,
  Globe,
  Ban,
  CheckCircle,
  Clock,
  Laptop,
  RefreshCw,
  Activity,
  UserX,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SecurityOverview {
  totalLogins30d: number;
  failedLogins24h: number;
  suspiciousLogins24h: number;
  activeSessions: number;
  lockedAccounts: number;
  fraudAlerts7d: number;
  blockedIPs: number;
  recentAuditActions24h: number;
  topAttackingIPs: Array<{ _id: string; count: number }>;
}

interface IPEntry {
  _id: string;
  ip: string;
  type: string;
  reason: string;
  addedBy?: string;
  createdAt: string;
  expiresAt?: string;
}

interface LoginLog {
  _id: string;
  userId?: { email: string } | string;
  ipAddress: string;
  userAgent: string;
  deviceType: string;
  os: string;
  browser: string;
  status: string;
  failureReason?: string;
  isSuspicious: boolean;
  createdAt: string;
}

interface AuditLogEntry {
  _id: string;
  userId?: { email: string } | string;
  action: string;
  resource: string;
  ipAddress: string;
  userAgent: string;
  details?: Record<string, unknown>;
  createdAt: string;
}

interface ActiveSession {
  _id: string;
  userId?: { email: string } | string;
  deviceType: string;
  deviceBrand: string;
  os: string;
  browser: string;
  ipAddress: string;
  lastActivityAt: string;
  loginAt: string;
}

export default function SecurityDashboardPage() {
  const [overview, setOverview] = React.useState<SecurityOverview | null>(null);
  const [blacklistedIPs, setBlacklistedIPs] = React.useState<IPEntry[]>([]);
  const [whitelistedIPs, setWhitelistedIPs] = React.useState<IPEntry[]>([]);
  const [loginLogs, setLoginLogs] = React.useState<LoginLog[]>([]);
  const [auditLogs, setAuditLogs] = React.useState<AuditLogEntry[]>([]);
  const [sessions, setSessions] = React.useState<ActiveSession[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [ipInput, setIpInput] = React.useState("");
  const [ipReason, setIpReason] = React.useState("");
  const [page, setPage] = React.useState(0);
  const [total, setTotal] = React.useState(0);
  const [activeTab, setActiveTab] = React.useState("overview");
  const limit = 20;

  React.useEffect(() => {
    fetchOverview();
  }, []);

  React.useEffect(() => {
    if (activeTab === "login-history") fetchLoginHistory();
    if (activeTab === "audit-logs") fetchAuditLogs();
    if (activeTab === "active-sessions") fetchActiveSessions();
  }, [activeTab, page]);

  async function fetchOverview() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/security?section=overview");
      const data = await res.json();
      setOverview(data.overview);
      setBlacklistedIPs(data.blacklistedIPs || []);
      setWhitelistedIPs(data.whitelistedIPs || []);
    } catch {
      console.error("Failed to fetch security overview");
    } finally {
      setLoading(false);
    }
  }

  async function fetchLoginHistory() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/security?section=login-history&limit=${limit}&skip=${page * limit}`);
      const data = await res.json();
      setLoginLogs(data.logs);
      setTotal(data.total);
    } catch {
      console.error("Failed to fetch login history");
    } finally {
      setLoading(false);
    }
  }

  async function fetchAuditLogs() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/security?section=audit-logs&limit=${limit}&skip=${page * limit}`);
      const data = await res.json();
      setAuditLogs(data.logs);
      setTotal(data.total);
    } catch {
      console.error("Failed to fetch audit logs");
    } finally {
      setLoading(false);
    }
  }

  async function fetchActiveSessions() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/security?section=active-sessions");
      const data = await res.json();
      setSessions(data.sessions);
    } catch {
      console.error("Failed to fetch active sessions");
    } finally {
      setLoading(false);
    }
  }

  async function handleIPAction(action: string) {
    if (!ipInput) return;
    try {
      await fetch("/api/admin/security", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ip: ipInput, reason: ipReason }),
      });
      setIpInput("");
      setIpReason("");
      fetchOverview();
    } catch {
      console.error("Failed to perform IP action");
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "success":
        return <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">Success</Badge>;
      case "failed":
        return <Badge className="bg-red-500/10 text-red-600 dark:text-red-400">Failed</Badge>;
      case "blocked":
        return <Badge className="bg-orange-500/10 text-orange-600 dark:text-orange-400">Blocked</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleString();
  }

  function getUserEmail(user: unknown): string {
    if (!user) return "Unknown";
    if (typeof user === "object" && user !== null && "email" in user) return (user as { email: string }).email;
    return String(user);
  }

  const stats = overview
    ? [
        { label: "Failed Logins (24h)", value: overview.failedLogins24h, icon: AlertTriangle, color: "text-red-500", bg: "bg-red-500/10" },
        { label: "Suspicious Logins (24h)", value: overview.suspiciousLogins24h, icon: Eye, color: "text-amber-500", bg: "bg-amber-500/10" },
        { label: "Locked Accounts", value: overview.lockedAccounts, icon: Lock, color: "text-orange-500", bg: "bg-orange-500/10" },
        { label: "Active Sessions", value: overview.activeSessions, icon: Laptop, color: "text-blue-500", bg: "bg-blue-500/10" },
        { label: "Fraud Alerts (7d)", value: overview.fraudAlerts7d, icon: Shield, color: "text-purple-500", bg: "bg-purple-500/10" },
        { label: "Blocked IPs", value: overview.blockedIPs, icon: Ban, color: "text-red-500", bg: "bg-red-500/10" },
        { label: "Total Logins (30d)", value: overview.totalLogins30d, icon: Activity, color: "text-blue-500", bg: "bg-blue-500/10" },
        { label: "Audit Actions (24h)", value: overview.recentAuditActions24h, icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-500/10" },
      ]
    : [];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <Shield className="h-6 w-6" /> Security Dashboard
            </h1>
            <p className="text-muted-foreground">Monitor security events, manage IP access, and review audit logs</p>
          </motion.div>

          <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setPage(0); }}>
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="login-history">Login History</TabsTrigger>
              <TabsTrigger value="audit-logs">Audit Logs</TabsTrigger>
              <TabsTrigger value="active-sessions">Active Sessions</TabsTrigger>
              <TabsTrigger value="ip-management">IP Management</TabsTrigger>
            </TabsList>

            {/* ===== OVERVIEW ===== */}
            <TabsContent value="overview">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />)}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
                  </div>

                  {/* Top Attacking IPs */}
                  {overview?.topAttackingIPs && overview.topAttackingIPs.length > 0 && (
                    <Card className="mb-8">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-red-500" /> Top Attacking IPs (24h)
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {overview.topAttackingIPs.map((entry) => (
                            <div key={entry._id} className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                              <div className="flex items-center gap-3">
                                <Globe className="h-4 w-4 text-muted-foreground" />
                                <span className="font-mono text-sm">{entry._id}</span>
                              </div>
                              <Badge variant="destructive">{entry.count} attempts</Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Quick IP Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Quick IP Block</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Input placeholder="IP Address" value={ipInput} onChange={(e) => setIpInput(e.target.value)} className="max-w-xs" />
                        <Input placeholder="Reason (optional)" value={ipReason} onChange={(e) => setIpReason(e.target.value)} className="max-w-xs" />
                        <Button variant="destructive" onClick={() => handleIPAction("blacklist")} disabled={!ipInput}>
                          <Ban className="h-4 w-4 mr-2" /> Block IP
                        </Button>
                        <Button variant="outline" onClick={() => handleIPAction("whitelist")} disabled={!ipInput}>
                          <CheckCircle className="h-4 w-4 mr-2" /> Whitelist IP
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            {/* ===== LOGIN HISTORY ===== */}
            <TabsContent value="login-history">
              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />)}
                </div>
              ) : (
                <>
                  <div className="space-y-2 mb-4">
                    {loginLogs.map((log) => (
                      <Card key={log._id} className={log.isSuspicious ? "border-amber-300 dark:border-amber-700" : ""}>
                        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${log.status === "success" ? "bg-emerald-500/10" : log.status === "failed" ? "bg-red-500/10" : "bg-orange-500/10"}`}>
                              {log.status === "success" ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : log.status === "failed" ? <UserX className="h-4 w-4 text-red-500" /> : <Lock className="h-4 w-4 text-orange-500" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{getUserEmail(log.userId)}</span>
                                {getStatusBadge(log.status)}
                                {log.isSuspicious && <Badge className="bg-amber-500/10 text-amber-600">Suspicious</Badge>}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                IP: {log.ipAddress} | {log.os} / {log.browser} | {log.deviceType}
                              </div>
                              {log.failureReason && <div className="text-xs text-red-500">Reason: {log.failureReason}</div>}
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {formatDate(log.createdAt)}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {loginLogs.length === 0 && <p className="text-muted-foreground text-center py-8">No login history found</p>}
                  </div>
                  <Pagination page={page} total={total} limit={limit} onPageChange={setPage} />
                </>
              )}
            </TabsContent>

            {/* ===== AUDIT LOGS ===== */}
            <TabsContent value="audit-logs">
              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />)}
                </div>
              ) : (
                <>
                  <div className="space-y-2 mb-4">
                    {auditLogs.map((log) => (
                      <Card key={log._id}>
                        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/10">
                              <Activity className="h-4 w-4 text-blue-500" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{log.action}</Badge>
                                <span className="text-sm text-muted-foreground">{log.resource}</span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                User: {getUserEmail(log.userId)} | IP: {log.ipAddress}
                              </div>
                              {log.details && (
                                <div className="text-xs text-muted-foreground mt-1 font-mono">
                                  {JSON.stringify(log.details).slice(0, 120)}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {formatDate(log.createdAt)}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {auditLogs.length === 0 && <p className="text-muted-foreground text-center py-8">No audit logs found</p>}
                  </div>
                  <Pagination page={page} total={total} limit={limit} onPageChange={setPage} />
                </>
              )}
            </TabsContent>

            {/* ===== ACTIVE SESSIONS ===== */}
            <TabsContent value="active-sessions">
              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />)}
                </div>
              ) : (
                <div className="space-y-2">
                  {sessions.map((session) => (
                    <Card key={session._id}>
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-blue-500/10">
                            <Laptop className="h-4 w-4 text-blue-500" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{getUserEmail(session.userId)}</span>
                              <Badge className="bg-emerald-500/10 text-emerald-600">Active</Badge>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {session.os} / {session.browser} | {session.deviceBrand} ({session.deviceType}) | IP: {session.ipAddress}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Last active: {formatDate(session.lastActivityAt)}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {sessions.length === 0 && <p className="text-muted-foreground text-center py-8">No active sessions</p>}
                </div>
              )}
            </TabsContent>

            {/* ===== IP MANAGEMENT ===== */}
            <TabsContent value="ip-management">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Blacklisted IPs */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600">
                      <Ban className="h-5 w-5" /> Blacklisted IPs
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <div className="flex gap-2">
                        <Input placeholder="IP Address" value={ipInput} onChange={(e) => setIpInput(e.target.value)} className="flex-1" />
                        <Button variant="destructive" size="sm" onClick={() => handleIPAction("blacklist")} disabled={!ipInput}>
                          Block
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {blacklistedIPs.map((entry) => (
                        <div key={entry._id} className="flex items-center justify-between p-3 rounded-lg bg-red-500/5 border border-red-200 dark:border-red-800">
                          <div>
                            <span className="font-mono text-sm">{entry.ip}</span>
                            <p className="text-xs text-muted-foreground">{entry.reason}</p>
                          </div>
                          <Button variant="ghost" size="sm" onClick={async () => {
                            await fetch("/api/admin/security", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ action: "unblacklist", ip: entry.ip }),
                            });
                            fetchOverview();
                          }}>
                            <Unlock className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      {blacklistedIPs.length === 0 && <p className="text-muted-foreground text-center py-4 text-sm">No blacklisted IPs</p>}
                    </div>
                  </CardContent>
                </Card>

                {/* Whitelisted IPs */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-emerald-600">
                      <CheckCircle className="h-5 w-5" /> Whitelisted IPs
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <div className="flex gap-2">
                        <Input placeholder="IP Address" value={ipInput} onChange={(e) => setIpInput(e.target.value)} className="flex-1" />
                        <Button variant="outline" size="sm" onClick={() => handleIPAction("whitelist")} disabled={!ipInput}>
                          Whitelist
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {whitelistedIPs.map((entry) => (
                        <div key={entry._id} className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/5 border border-emerald-200 dark:border-emerald-800">
                          <div>
                            <span className="font-mono text-sm">{entry.ip}</span>
                            <p className="text-xs text-muted-foreground">{entry.reason}</p>
                          </div>
                          <Button variant="ghost" size="sm" onClick={async () => {
                            await fetch("/api/admin/security", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ action: "remove-whitelist", ip: entry.ip }),
                            });
                            fetchOverview();
                          }}>
                            <Ban className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      {whitelistedIPs.length === 0 && <p className="text-muted-foreground text-center py-4 text-sm">No whitelisted IPs</p>}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Pagination({ page, total, limit, onPageChange }: { page: number; total: number; limit: number; onPageChange: (p: number) => void }) {
  const totalPages = Math.ceil(total / limit);
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-4">
      <p className="text-sm text-muted-foreground">
        Showing {page * limit + 1}–{Math.min((page + 1) * limit, total)} of {total}
      </p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={page === 0} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => onPageChange(page + 1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
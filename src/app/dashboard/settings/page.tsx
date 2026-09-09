"use client";

export const dynamic = "force-dynamic";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Bot,
  Sparkles,
  Brain,
  Heart,
  MessageCircle,
  Shield,
  Eye,
  AlertTriangle,
  Lightbulb,
  CheckCircle,
  XCircle,
  Zap,
  RefreshCw,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

interface AIStatus {
  available: boolean;
  model: string;
  features: string[];
}

interface AIResult {
  [key: string]: unknown;
}

export default function AISettingsPage() {
  const [status, setStatus] = React.useState<AIStatus | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState("overview");
  const [results, setResults] = React.useState<Record<string, AIResult>>({});
  const [featureLoading, setFeatureLoading] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetchStatus();
  }, []);

  async function fetchStatus() {
    setLoading(true);
    try {
      const res = await fetch("/api/ai?feature=status");
      const data = await res.json();
      setStatus(data);
    } catch {
      console.error("Failed to fetch AI status");
    } finally {
      setLoading(false);
    }
  }

  async function runFeature(feature: string, params: Record<string, unknown> = {}) {
    setFeatureLoading(feature);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feature, ...params }),
      });
      const data = await res.json();
      setResults((prev) => ({ ...prev, [feature]: data }));
    } catch {
      setResults((prev) => ({ ...prev, [feature]: { error: "Failed to run feature" } }));
    } finally {
      setFeatureLoading(null);
    }
  }

  const features = [
    {
      id: "match-recommendations",
      name: "AI Match Recommendation",
      icon: Heart,
      description: "AI-powered matchmaking based on profile compatibility",
      color: "text-rose-500",
      bg: "bg-rose-500/10",
    },
    {
      id: "compatibility",
      name: "AI Compatibility Score",
      icon: Sparkles,
      description: "Detailed compatibility analysis between two profiles",
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      id: "bio-generator",
      name: "AI Bio Generator",
      icon: Brain,
      description: "Generate professional, engaging bio text for your profile",
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      id: "interest-prediction",
      name: "AI Interest Prediction",
      icon: Lightbulb,
      description: "Predict interests and hobbies you might enjoy",
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      id: "profile-improvements",
      name: "AI Profile Improvements",
      icon: Zap,
      description: "Get personalized suggestions to improve your profile",
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      id: "conversation-starters",
      name: "AI Conversation Starters",
      icon: MessageCircle,
      description: "Personalized conversation openers for matches",
      color: "text-cyan-500",
      bg: "bg-cyan-500/10",
    },
    {
      id: "spam-detection",
      name: "AI Spam Detection",
      icon: Shield,
      description: "Detect spam and scam content automatically",
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
    {
      id: "fake-detection",
      name: "AI Fake Profile Detection",
      icon: Eye,
      description: "Identify potentially fake or fraudulent profiles",
      color: "text-red-500",
      bg: "bg-red-500/10",
    },
    {
      id: "content-moderation",
      name: "AI Content Moderation",
      icon: AlertTriangle,
      description: "Automated content moderation for safety",
      color: "text-pink-500",
      bg: "bg-pink-500/10",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-30 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <Bot className="h-6 w-6" /> AI Settings
            </h1>
            <p className="text-muted-foreground">Configure and test AI-powered features for your platform</p>
          </motion.div>

          {/* Status Banner */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {status?.available ? (
                    <div className="p-3 rounded-xl bg-emerald-500/10">
                      <CheckCircle className="h-6 w-6 text-emerald-500" />
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-red-500/10">
                      <XCircle className="h-6 w-6 text-red-500" />
                    </div>
                  )}
                  <div>
                    <h2 className="font-semibold text-lg">
                      {status?.available ? "AI Service Active" : "AI Service Not Configured"}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {status?.available
                        ? `Using model: ${status.model} | ${status.features.length} features available`
                        : "Set OPENAI_API_KEY in .env.local to enable AI features"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant={status?.available ? "default" : "destructive"}>
                    {status?.available ? "Connected" : "Disconnected"}
                  </Badge>
                  <Button variant="outline" size="sm" onClick={fetchStatus}>
                    <RefreshCw className="h-4 w-4 mr-1" /> Refresh
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Features Overview</TabsTrigger>
              <TabsTrigger value="test">Test Features</TabsTrigger>
              <TabsTrigger value="config">Configuration</TabsTrigger>
            </TabsList>

            {/* ===== OVERVIEW ===== */}
            <TabsContent value="overview">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {features.map((feature) => (
                  <Card key={feature.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3">
                        <div className={`p-2.5 rounded-xl ${feature.bg}`}>
                          <feature.icon className={`h-5 w-5 ${feature.color}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm">{feature.name}</h3>
                          <p className="text-xs text-muted-foreground mt-1">{feature.description}</p>
                        </div>
                        {status?.available && status.features.includes(feature.id) ? (
                          <Badge className="bg-emerald-500/10 text-emerald-600">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Rule-based</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* ===== TEST FEATURES ===== */}
            <TabsContent value="test">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Bio Generator */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-blue-500" /> Bio Generator
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => runFeature("bio-generator")}
                      disabled={featureLoading === "bio-generator"}
                      className="w-full"
                    >
                      {featureLoading === "bio-generator" ? "Generating..." : "Generate AI Bio"}
                    </Button>
                    {results["bio-generator"] && (
                      <div className="mt-4 p-4 rounded-lg bg-accent/50 text-sm">
                        {typeof results["bio-generator"].bio === "string" ? (
                          <p>{results["bio-generator"].bio as string}</p>
                        ) : (
                          <p className="text-muted-foreground">No bio generated</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Interest Prediction */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-amber-500" /> Interest Prediction
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => runFeature("interest-prediction")}
                      disabled={featureLoading === "interest-prediction"}
                      className="w-full"
                    >
                      {featureLoading === "interest-prediction" ? "Predicting..." : "Predict Interests"}
                    </Button>
                    {results["interest-prediction"] && (
                      <div className="mt-4 p-4 rounded-lg bg-accent/50">
                        {Array.isArray(results["interest-prediction"].predictedInterests) && (
                          <div className="flex flex-wrap gap-2">
                            {(results["interest-prediction"].predictedInterests as string[]).map((interest: string) => (
                              <Badge key={interest} variant="outline">{interest}</Badge>
                            ))}
                          </div>
                        )}
                        {typeof results["interest-prediction"].reasoning === "string" && (
                          <p className="text-xs text-muted-foreground mt-2">{results["interest-prediction"].reasoning as string}</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Profile Improvements */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-emerald-500" /> Profile Improvements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => runFeature("profile-improvements")}
                      disabled={featureLoading === "profile-improvements"}
                      className="w-full"
                    >
                      {featureLoading === "profile-improvements" ? "Analyzing..." : "Get Improvement Tips"}
                    </Button>
                    {results["profile-improvements"] && (
                      <div className="mt-4 space-y-2">
                        {Array.isArray(results["profile-improvements"].improvements) &&
                          (results["profile-improvements"].improvements as Array<{ field: string; suggestion: string; priority: string }>).map((imp, i) => (
                            <div key={i} className="p-3 rounded-lg bg-accent/50">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant={imp.priority === "high" ? "destructive" : "secondary"} className="text-xs">
                                  {imp.priority}
                                </Badge>
                                <span className="text-xs font-medium">{imp.field}</span>
                              </div>
                              <p className="text-xs text-muted-foreground">{imp.suggestion}</p>
                            </div>
                          ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Spam Detection Test */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-orange-500" /> Spam Detection
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SpamTest onResult={(result) => setResults((prev) => ({ ...prev, "spam-detection": result }))} loading={featureLoading === "spam-detection"} />
                  </CardContent>
                </Card>

                {/* Content Moderation Test */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-pink-500" /> Content Moderation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ModerationTest onResult={(result) => setResults((prev) => ({ ...prev, "content-moderation": result }))} loading={featureLoading === "content-moderation"} />
                  </CardContent>
                </Card>

                {/* Fake Profile Detection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5 text-red-500" /> Fake Profile Detection
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => runFeature("fake-detection")}
                      disabled={featureLoading === "fake-detection"}
                      className="w-full"
                    >
                      {featureLoading === "fake-detection" ? "Analyzing..." : "Run Fake Detection"}
                    </Button>
                    {results["fake-detection"] && (
                      <div className="mt-4 p-4 rounded-lg bg-accent/50">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={(results["fake-detection"].isFake as boolean) ? "destructive" : "default"}>
                            {(results["fake-detection"].isFake as boolean) ? "Potentially Fake" : "Looks Legitimate"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Confidence: {typeof results["fake-detection"].confidence === "number" ? ((results["fake-detection"].confidence as number) * 100).toFixed(0) : "N/A"}%
                          </span>
                        </div>
                        {Array.isArray(results["fake-detection"].flags) && (results["fake-detection"].flags as string[]).length > 0 && (
                          <ul className="text-xs text-muted-foreground list-disc list-inside">
                            {(results["fake-detection"].flags as string[]).map((flag: string, i: number) => (
                              <li key={i}>{flag}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ===== CONFIGURATION ===== */}
            <TabsContent value="config">
              <Card>
                <CardHeader>
                  <CardTitle>AI Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 rounded-lg bg-accent/50">
                    <h3 className="font-semibold mb-2">Environment Variables</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <code className="text-xs bg-muted px-2 py-1 rounded">OPENAI_API_KEY</code>
                        <Badge variant={status?.available ? "default" : "destructive"}>
                          {status?.available ? "Set" : "Not Set"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <code className="text-xs bg-muted px-2 py-1 rounded">OPENAI_MODEL</code>
                        <Badge variant="secondary">{status?.model || "gpt-4o-mini (default)"}</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-accent/50">
                    <h3 className="font-semibold mb-2">Setup Instructions</h3>
                    <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                      <li>Get an API key from <a href="https://platform.openai.com" target="_blank" className="text-primary underline">platform.openai.com</a></li>
                      <li>Add <code className="text-xs bg-muted px-1 rounded">OPENAI_API_KEY=sk-your-key</code> to your <code className="text-xs bg-muted px-1 rounded">.env.local</code> file</li>
                      <li>Optionally set <code className="text-xs bg-muted px-1 rounded">OPENAI_MODEL</code> (default: gpt-4o-mini)</li>
                      <li>Restart the development server</li>
                    </ol>
                    <p className="text-xs text-muted-foreground mt-3">
                      Without an API key, all AI features will use rule-based fallback logic.
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-accent/50">
                    <h3 className="font-semibold mb-2">Supported Models</h3>
                    <div className="grid sm:grid-cols-2 gap-2 text-sm">
                      {["gpt-4o-mini", "gpt-4o", "gpt-4-turbo", "gpt-3.5-turbo"].map((model) => (
                        <div key={model} className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-emerald-500" />
                          <code className="text-xs">{model}</code>
                        </div>
                      ))}
                    </div>
                  </div>
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

function SpamTest({ onResult, loading }: { onResult: (r: AIResult) => void; loading: boolean }) {
  const [text, setText] = React.useState("Hello, add me on WhatsApp +8801712345678 for more photos!");

  return (
    <div className="space-y-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full p-3 rounded-lg border bg-background text-sm resize-none"
        rows={3}
        placeholder="Enter text to check for spam..."
      />
      <Button
        onClick={async () => {
          const res = await fetch("/api/ai", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ feature: "spam-detection", content: text }),
          });
          onResult(await res.json());
        }}
        disabled={loading || !text}
        className="w-full"
      >
        {loading ? "Checking..." : "Check for Spam"}
      </Button>
    </div>
  );
}

function ModerationTest({ onResult, loading }: { onResult: (r: AIResult) => void; loading: boolean }) {
  const [text, setText] = React.useState("I love cooking and spending time with family. Looking for a caring partner.");

  return (
    <div className="space-y-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full p-3 rounded-lg border bg-background text-sm resize-none"
        rows={3}
        placeholder="Enter content to moderate..."
      />
      <Button
        onClick={async () => {
          const res = await fetch("/api/ai", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ feature: "content-moderation", content: text }),
          });
          onResult(await res.json());
        }}
        disabled={loading || !text}
        className="w-full"
      >
        {loading ? "Moderating..." : "Moderate Content"}
      </Button>
    </div>
  );
}
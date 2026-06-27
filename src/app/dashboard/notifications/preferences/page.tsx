"use client";

import * as React from "react";
import {
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  MessageCircle,
  Moon,
  Save,
  Loader2,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { PushNotificationManager } from "@/components/notifications/push-notification-manager";
import { useNotificationStore } from "@/stores/notification-store";

export default function NotificationPreferencesPage() {
  const { preferences, setPreferences, fetchPreferences } = useNotificationStore();
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const handleToggle = async (
    section: "email" | "push" | "sms" | "whatsapp",
    key: string,
    value: boolean
  ) => {
    const sectionPrefs = { ...preferences[section], [key]: value };
    await setPreferences({ [section]: sectionPrefs } as Parameters<typeof setPreferences>[0]);
  };

  const handleQuietHoursToggle = async (enabled: boolean) => {
    await setPreferences({ quietHoursEnabled: enabled } as Parameters<typeof setPreferences>[0]);
  };

  const handleQuietHoursChange = async (field: "quietHoursStart" | "quietHoursEnd", value: string) => {
    await setPreferences({ [field]: value } as Parameters<typeof setPreferences>[0]);
  };

  const handleSave = async () => {
    setSaving(true);
    // Preferences are already saved on toggle, this is just for UX feedback
    await new Promise((r) => setTimeout(r, 500));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Notification Preferences</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Control how and when you receive notifications
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : saved ? (
            <Check className="h-4 w-4 mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Browser Push Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Bell className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <CardTitle className="text-base">Push Notifications</CardTitle>
                <CardDescription>
                  Browser push notifications for real-time updates
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <PushNotificationManager />
            <Separator />
            <div className="space-y-3">
              <ToggleItem
                label="New interests"
                description="When someone sends you an interest"
                checked={preferences.push.interests}
                onChange={(v) => handleToggle("push", "interests", v)}
              />
              <ToggleItem
                label="New messages"
                description="When you receive a new message"
                checked={preferences.push.messages}
                onChange={(v) => handleToggle("push", "messages", v)}
              />
              <ToggleItem
                label="Profile views"
                description="When someone views your profile"
                checked={preferences.push.profileViews}
                onChange={(v) => handleToggle("push", "profileViews", v)}
              />
              <ToggleItem
                label="Payments"
                description="Payment confirmations and subscription updates"
                checked={preferences.push.payments}
                onChange={(v) => handleToggle("push", "payments", v)}
              />
              <ToggleItem
                label="Security alerts"
                description="Important account security notifications"
                checked={preferences.push.security}
                onChange={(v) => handleToggle("push", "security", v)}
              />
              <ToggleItem
                label="Promotions"
                description="Special offers and promotions"
                checked={preferences.push.promotions}
                onChange={(v) => handleToggle("push", "promotions", v)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Email Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Mail className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <CardTitle className="text-base">Email Notifications</CardTitle>
                <CardDescription>
                  Receive notifications via email
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <ToggleItem
              label="New interests"
              description="When someone sends you an interest"
              checked={preferences.email.interests}
              onChange={(v) => handleToggle("email", "interests", v)}
            />
            <ToggleItem
              label="New messages"
              description="When you receive a new message"
              checked={preferences.email.messages}
              onChange={(v) => handleToggle("email", "messages", v)}
            />
            <ToggleItem
              label="Profile views"
              description="When someone views your profile"
              checked={preferences.email.profileViews}
              onChange={(v) => handleToggle("email", "profileViews", v)}
            />
            <ToggleItem
              label="Payments"
              description="Payment confirmations and receipts"
              checked={preferences.email.payments}
              onChange={(v) => handleToggle("email", "payments", v)}
            />
            <ToggleItem
              label="Security alerts"
              description="Important account security notifications"
              checked={preferences.email.security}
              onChange={(v) => handleToggle("email", "security", v)}
            />
            <ToggleItem
              label="Newsletters"
              description="Weekly tips and platform updates"
              checked={preferences.email.newsletters}
              onChange={(v) => handleToggle("email", "newsletters", v)}
            />
            <ToggleItem
              label="Promotions"
              description="Special offers and promotions"
              checked={preferences.email.promotions}
              onChange={(v) => handleToggle("email", "promotions", v)}
            />
          </CardContent>
        </Card>

        {/* SMS Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Smartphone className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <CardTitle className="text-base">SMS Notifications</CardTitle>
                <CardDescription>
                  Receive text messages for important updates
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <ToggleItem
              label="Security alerts"
              description="Login attempts and password changes"
              checked={preferences.sms.security}
              onChange={(v) => handleToggle("sms", "security", v)}
            />
            <ToggleItem
              label="Payment confirmations"
              description="Subscription and payment updates"
              checked={preferences.sms.payments}
              onChange={(v) => handleToggle("sms", "payments", v)}
            />
            <ToggleItem
              label="New interests"
              description="When someone sends you an interest"
              checked={preferences.sms.interests}
              onChange={(v) => handleToggle("sms", "interests", v)}
            />
            <ToggleItem
              label="Verification updates"
              description="Profile verification status changes"
              checked={preferences.sms.verification}
              onChange={(v) => handleToggle("sms", "verification", v)}
            />
          </CardContent>
        </Card>

        {/* WhatsApp Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <CardTitle className="text-base">WhatsApp Notifications</CardTitle>
                <CardDescription>
                  Receive WhatsApp messages (requires opt-in)
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <ToggleItem
              label="New interests"
              description="When someone sends you an interest"
              checked={preferences.whatsapp.interests}
              onChange={(v) => handleToggle("whatsapp", "interests", v)}
            />
            <ToggleItem
              label="New messages"
              description="When you receive a new message"
              checked={preferences.whatsapp.messages}
              onChange={(v) => handleToggle("whatsapp", "messages", v)}
            />
            <ToggleItem
              label="Payment confirmations"
              description="Subscription and payment updates"
              checked={preferences.whatsapp.payments}
              onChange={(v) => handleToggle("whatsapp", "payments", v)}
            />
            <ToggleItem
              label="Security alerts"
              description="Important account security notifications"
              checked={preferences.whatsapp.security}
              onChange={(v) => handleToggle("whatsapp", "security", v)}
            />
            <ToggleItem
              label="Promotions"
              description="Special offers and promotions"
              checked={preferences.whatsapp.promotions}
              onChange={(v) => handleToggle("whatsapp", "promotions", v)}
            />
          </CardContent>
        </Card>
      </div>

      {/* Quiet Hours */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <Moon className="h-5 w-5 text-indigo-500" />
            </div>
            <div>
              <CardTitle className="text-base">Quiet Hours</CardTitle>
              <CardDescription>
                Pause non-urgent notifications during specific hours. You'll still receive security alerts.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Enable Quiet Hours</p>
              <p className="text-sm text-muted-foreground">
                Suppress non-urgent notifications during set hours
              </p>
            </div>
            <Switch
              checked={preferences.quietHoursEnabled}
              onCheckedChange={handleQuietHoursToggle}
            />
          </div>
          {preferences.quietHoursEnabled && (
            <div className="flex items-center gap-4 pt-2">
              <div className="space-y-1">
                <label className="text-sm font-medium">Start</label>
                <input
                  type="time"
                  value={preferences.quietHoursStart}
                  onChange={(e) => handleQuietHoursChange("quietHoursStart", e.target.value)}
                  className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
              </div>
              <div className="pt-6 text-muted-foreground">to</div>
              <div className="space-y-1">
                <label className="text-sm font-medium">End</label>
                <input
                  type="time"
                  value={preferences.quietHoursEnd}
                  onChange={(e) => handleQuietHoursChange("quietHoursEnd", e.target.value)}
                  className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ToggleItem({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <div className="space-y-0.5">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
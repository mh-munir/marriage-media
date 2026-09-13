"use client";

import * as React from "react";
import { Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Manages push notification subscription on the client side.
 * Handles requesting permission, registering the service worker,
 * and subscribing to push notifications via FCM.
 */
export function PushNotificationManager() {
  const [isSupported, setIsSupported] = React.useState(false);
  const [isSubscribed, setIsSubscribed] = React.useState(false);
  const [permission, setPermission] = React.useState<NotificationPermission>("default");
  const [loading, setLoading] = React.useState(false);

  async function checkSubscription() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch {
      // Service worker not available
    }
  }

  React.useEffect(() => {
    if ("Notification" in window && "serviceWorker" in navigator) {
      // Use setTimeout to avoid synchronous state update in effect
      setTimeout(() => {
        setIsSupported(true);
        setPermission(Notification.permission);
        checkSubscription();
      }, 0);
    }
  }, []);

  async function subscribe() {
    setLoading(true);
    try {
      // Request permission
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result !== "granted") {
        setLoading(false);
        return;
      }

      // Register service worker
      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      // Subscribe to push
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        console.warn("VAPID public key not configured");
        setLoading(false);
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey,
      });

      // Send subscription to server
      await fetch("/api/notifications/push-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription.toJSON()),
      });

      setIsSubscribed(true);
    } catch (error) {
      console.error("Failed to subscribe to push notifications:", error);
    } finally {
      setLoading(false);
    }
  }

  async function unsubscribe() {
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        const endpoint = subscription.endpoint;
        await subscription.unsubscribe();

        // Remove from server
        await fetch("/api/notifications/push-subscription", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint }),
        });
      }

      setIsSubscribed(false);
    } catch (error) {
      console.error("Failed to unsubscribe:", error);
    } finally {
      setLoading(false);
    }
  }

  if (!isSupported) {
    return null;
  }

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium">Push Notifications</p>
        <p className="text-sm text-muted-foreground">
          {isSubscribed
            ? "You will receive push notifications for new messages, interests, and updates."
            : "Enable push notifications to stay updated."}
        </p>
      </div>
      <Button
        variant={isSubscribed ? "outline" : "default"}
        size="sm"
        onClick={isSubscribed ? unsubscribe : subscribe}
        disabled={loading || permission === "denied"}
      >
        {loading ? (
          <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
        ) : isSubscribed ? (
          <BellOff className="h-4 w-4 mr-2" />
        ) : (
          <Bell className="h-4 w-4 mr-2" />
        )}
        {isSubscribed ? "Disable" : "Enable"}
      </Button>
    </div>
  );
}
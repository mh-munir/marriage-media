import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAuthStore } from "@/stores/auth-store";
import { useAdminAuthStore } from "@/stores/admin-auth-store";
import { adminFetch } from "@/lib/admin-fetch";

function getAuthToken() {
  const isAdminRoute = typeof window !== "undefined" && window.location.pathname.startsWith("/admin");
  const cookieName = isAdminRoute ? "adminToken" : "token";
  const storedToken = isAdminRoute
    ? useAdminAuthStore.getState().token
    : useAuthStore.getState().token;
  if (storedToken) return storedToken;
  return document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${cookieName}=`))
    ?.split("=")[1];
}

export interface AppNotification {
  id: string;
  type: "interest" | "message" | "profile_view" | "payment" | "verification" | "system" | "promotion";
  title: string;
  body: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
  delivery?: Array<{
    channel: string;
    status: string;
    sentAt?: string;
  }>;
}

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  page: number;
  hasMore: boolean;
  preferences: {
    email: {
      interests: boolean;
      messages: boolean;
      profileViews: boolean;
      payments: boolean;
      promotions: boolean;
      newsletters: boolean;
      security: boolean;
    };
    push: {
      interests: boolean;
      messages: boolean;
      profileViews: boolean;
      payments: boolean;
      promotions: boolean;
      security: boolean;
    };
    sms: {
      security: boolean;
      payments: boolean;
      interests: boolean;
      verification: boolean;
    };
    whatsapp: {
      interests: boolean;
      messages: boolean;
      payments: boolean;
      security: boolean;
      promotions: boolean;
    };
    quietHoursEnabled: boolean;
    quietHoursStart: string;
    quietHoursEnd: string;
  };

  // Actions
  fetchNotifications: (reset?: boolean) => Promise<void>;
  fetchPreferences: () => Promise<void>;
  setNotifications: (notifications: AppNotification[]) => void;
  addNotification: (notification: AppNotification) => void;
  reset: () => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  setPreferences: (prefs: Partial<NotificationState["preferences"]>) => Promise<void>;
}

const defaultPreferences = {
  email: {
    interests: true,
    messages: true,
    profileViews: false,
    payments: true,
    promotions: false,
    newsletters: false,
    security: true,
  },
  push: {
    interests: true,
    messages: true,
    profileViews: true,
    payments: true,
    promotions: false,
    security: true,
  },
  sms: {
    security: true,
    payments: true,
    interests: false,
    verification: true,
  },
  whatsapp: {
    interests: false,
    messages: false,
    payments: false,
    security: false,
    promotions: false,
  },
  quietHoursEnabled: false,
  quietHoursStart: "22:00",
  quietHoursEnd: "08:00",
};

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      page: 1,
      hasMore: true,
      preferences: defaultPreferences,

      fetchNotifications: async (reset = false) => {
        const state = get();
        if (state.isLoading) return;

        const page = reset ? 1 : state.page;
        set({ isLoading: true });

        try {
          const token = getAuthToken();

          const res = await adminFetch(`/api/notifications?page=${page}&limit=20`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });

          if (res.ok) {
            const data = await res.json();
            const notifications: AppNotification[] = data.notifications.map(
              (n: Record<string, unknown>) => ({
                id: (n._id as string) || (n.id as string),
                type: n.type,
                title: n.title,
                body: n.message,
                link: n.link,
                isRead: n.isRead,
                createdAt: n.createdAt,
                delivery: n.delivery as AppNotification["delivery"],
              })
            );

            set((s) => ({
              notifications: reset
                ? notifications
                : [...s.notifications, ...notifications],
              unreadCount: data.unreadCount,
              page: page + 1,
              hasMore: data.pagination.page < data.pagination.pages,
              isLoading: false,
            }));
          }
        } catch (error) {
          console.error("Failed to fetch notifications:", error);
          set({ isLoading: false });
        }
      },

      fetchPreferences: async () => {
        try {
          const token = getAuthToken();

          const res = await fetch("/api/notifications/preferences", {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });

          if (res.ok) {
            const data = await res.json();
            set({ preferences: { ...defaultPreferences, ...data.preferences } });
          }
        } catch (error) {
          console.error("Failed to fetch preferences:", error);
        }
      },

      setNotifications: (notifications) =>
        set({
          notifications,
          unreadCount: notifications.filter((n) => !n.isRead).length,
        }),

      addNotification: (notification) =>
        set((state) => ({
          notifications: [notification, ...state.notifications].slice(0, 100),
          unreadCount: state.unreadCount + (notification.isRead ? 0 : 1),
        })),

      reset: () =>
        set({
          notifications: [],
          unreadCount: 0,
          isLoading: false,
          page: 1,
          hasMore: true,
          preferences: defaultPreferences,
        }),

      markAsRead: async (id) => {
        // Optimistic update
        set((state) => {
          const notifications = state.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          );
          return {
            notifications,
            unreadCount: notifications.filter((n) => !n.isRead).length,
          };
        });

        try {
          const token = getAuthToken();

          await fetch("/api/notifications/read", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ notificationIds: [id] }),
          });
        } catch (error) {
          console.error("Failed to mark notification as read:", error);
        }
      },

      markAllAsRead: async () => {
        // Optimistic update
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
          unreadCount: 0,
        }));

        try {
          const token = getAuthToken();

          await fetch("/api/notifications/read", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ markAll: true }),
          });
        } catch (error) {
          console.error("Failed to mark all notifications as read:", error);
        }
      },

      deleteNotification: async (id) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
          unreadCount: state.notifications.filter(
            (n) => !n.isRead && n.id !== id
          ).length,
        }));

        try {
          const token = getAuthToken();

          await fetch("/api/notifications", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ notificationIds: [id] }),
          });
        } catch (error) {
          console.error("Failed to delete notification:", error);
        }
      },

      clearAll: async () => {
        set({ notifications: [], unreadCount: 0 });

        try {
          const token = getAuthToken();

          await fetch("/api/notifications", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          });
        } catch (error) {
          console.error("Failed to clear notifications:", error);
        }
      },

      setPreferences: async (prefs) => {
        const newPrefs = { ...get().preferences, ...prefs };
        set({ preferences: newPrefs });

        try {
          const token = getAuthToken();

          await fetch("/api/notifications/preferences", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(newPrefs),
          });
        } catch (error) {
          console.error("Failed to save preferences:", error);
        }
      },
    }),
    {
      name: "marriage-media-notifications",
      partialize: (state) => ({
        notifications: state.notifications.slice(0, 50),
        unreadCount: state.unreadCount,
        preferences: state.preferences,
      }),
    }
  )
);
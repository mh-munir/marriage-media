"use client";

import * as React from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { SocketProvider } from "@/providers/socket-provider";
import { LanguageProvider } from "@/providers/language-provider";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <LanguageProvider>
        <AuthProvider>
          <SocketProvider>
            {children}
            <Toaster
              position="top-center"
              richColors
              closeButton
              toastOptions={{
                className: "font-sans",
                duration: 4000,
              }}
            />
          </SocketProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

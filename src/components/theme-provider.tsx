"use client";

import * as React from "react";

type Theme = "light" | "dark" | "system";

interface ThemeProviderProps {
  children: React.ReactNode;
  attribute?: string;
  defaultTheme?: Theme;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
}

const ThemeContext = React.createContext<{
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
}>({
  theme: "system",
  setTheme: () => {},
  resolvedTheme: "light",
});

export function useTheme() {
  return React.useContext(ThemeContext);
}

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function resolveTheme(theme: Theme): "light" | "dark" {
  if (theme === "system") return getSystemTheme();
  return theme;
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = React.useState<"light" | "dark">(
    () => resolveTheme(defaultTheme)
  );
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    // Read saved theme from localStorage
    const saved = localStorage.getItem("theme") as Theme | null;
    const initial = saved || defaultTheme;
    // Use setTimeout to avoid synchronous state update in effect
    setTimeout(() => {
      setThemeState(initial);
      setResolvedTheme(resolveTheme(initial));
      applyTheme(resolveTheme(initial));
      setMounted(true);
    }, 0);
  }, [defaultTheme]);

  React.useEffect(() => {
    if (!mounted) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        const resolved = getSystemTheme();
        setResolvedTheme(resolved);
        applyTheme(resolved);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, mounted]);

  const setTheme = React.useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme);
      localStorage.setItem("theme", newTheme);
      const resolved = resolveTheme(newTheme);
      setResolvedTheme(resolved);
      applyTheme(resolved);
    },
    []
  );

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

function applyTheme(resolved: "light" | "dark") {
  const root = document.documentElement;
  // The control room uses a fixed light interface. Public pages still follow
  // the visitor's saved/system theme normally.
  const effectiveTheme = window.location.pathname.startsWith("/admin")
    ? "light"
    : resolved;
  root.classList.remove("light", "dark");
  root.classList.add(effectiveTheme);
}

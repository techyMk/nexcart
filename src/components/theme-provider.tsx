"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

type Theme = "dark" | "light";

const STORAGE_KEY = "nexcart-theme";

const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({
  theme: "dark",
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  // The inline script in layout.tsx has already set the html class before
  // paint, so the class list is the source of truth on the client. On the
  // server we default to 'dark' (matching the SSR'd html class).
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "dark";
    return document.documentElement.classList.contains("dark")
      ? "dark"
      : "light";
  });

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      // Idempotent side effects — safe under StrictMode double-invoke.
      document.documentElement.classList.toggle("dark", next === "dark");
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // Storage unavailable (private mode, etc.) — theme still flips for
        // this session.
      }
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

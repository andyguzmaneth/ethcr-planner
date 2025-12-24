"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createTranslationFunction, setLocale, getLocale, type SupportedLocale } from "./index";

interface TranslationContextType {
  t: (key: string, params?: Record<string, string | number>) => string;
  locale: SupportedLocale;
  setCurrentLocale: (locale: SupportedLocale) => void;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

interface TranslationProviderProps {
  children: ReactNode;
  initialLocale?: SupportedLocale;
}

export function TranslationProvider({ children, initialLocale }: TranslationProviderProps) {
  // Use initialLocale from server (which reads from cookies) to ensure hydration matches
  // The server and client should now match since we're using cookies
  const [locale, setLocaleState] = useState<SupportedLocale>(initialLocale || "es");

  useEffect(() => {
    // On mount, sync localStorage with cookie (in case they're out of sync)
    // The server already read from cookie, but we should ensure localStorage matches
    const storedInLocalStorage = localStorage.getItem("app_locale") as SupportedLocale | null;
    if (storedInLocalStorage && storedInLocalStorage !== locale && (storedInLocalStorage === "en" || storedInLocalStorage === "es")) {
      // If localStorage has different value, sync cookie to match localStorage (user preference)
      document.cookie = `app_locale=${storedInLocalStorage}; path=/; max-age=31536000; SameSite=Lax`;
      setLocaleState(storedInLocalStorage);
      document.documentElement.lang = storedInLocalStorage;
      // Note: State update will trigger a re-render, but we still set up the listener below
    } else {
      // Ensure html lang attribute matches current locale
      document.documentElement.lang = locale;
    }

    // Sync with localStorage changes from other tabs/windows
    const handleStorageChange = () => {
      const newLocale = getLocale();
      setLocaleState(newLocale);
      document.documentElement.lang = newLocale;
      // Sync cookie
      document.cookie = `app_locale=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [locale]); // Re-run if locale changes (when syncing from localStorage)

  // Update html lang when locale changes
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setCurrentLocale = (newLocale: SupportedLocale) => {
    setLocale(newLocale);
    setLocaleState(newLocale);
    // Update html lang attribute immediately
    document.documentElement.lang = newLocale;
    // Trigger a page refresh to update all server components
    // The localStorage is already set, so on reload it will be read correctly
    window.location.reload();
  };

  const t = createTranslationFunction(locale);

  return (
    <TranslationContext.Provider value={{ t, locale, setCurrentLocale }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error("useTranslation must be used within a TranslationProvider");
  }
  return context;
}


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
  const [locale, setLocaleState] = useState<SupportedLocale>(initialLocale || getLocale());

  useEffect(() => {
    // Sync with localStorage changes
    const handleStorageChange = () => {
      setLocaleState(getLocale());
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const setCurrentLocale = (newLocale: SupportedLocale) => {
    setLocale(newLocale);
    setLocaleState(newLocale);
    // Trigger a page refresh to update all server components
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


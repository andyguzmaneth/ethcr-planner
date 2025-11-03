"use client";

import { useTranslation } from "@/lib/i18n/useTranslation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import type { SupportedLocale } from "@/lib/i18n";

const languageNames: Record<SupportedLocale, string> = {
  en: "English",
  es: "Español",
  ko: "한국어",
};

export function LanguageSwitcher() {
  const { locale, setCurrentLocale } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Globe className="h-5 w-5" />
          <span className="sr-only">Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {(Object.keys(languageNames) as SupportedLocale[]).map((lang) => (
          <DropdownMenuItem
            key={lang}
            onClick={() => setCurrentLocale(lang)}
            className={locale === lang ? "bg-accent" : ""}
          >
            {languageNames[lang]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


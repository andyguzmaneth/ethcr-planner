"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Bell } from "lucide-react";
import { MobileSidebar } from "./mobile-sidebar";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { LanguageSwitcher } from "@/components/ui/language-switcher";

interface HeaderProps {
  events: Array<{ id: string; name: string; slug: string }>;
}

export function Header({ events }: HeaderProps) {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4">
        {/* Mobile menu button */}
        <MobileSidebar events={events} />

        {/* Logo */}
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <span className="font-bold text-xl">ETHCR Planner</span>
        </Link>

        {/* Right side actions */}
        <div className="ml-auto flex items-center space-x-2">
          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Search */}
          <Button variant="ghost" size="icon" className="hidden sm:flex" disabled>
            <Search className="h-5 w-5 text-muted-foreground/50" />
            <span className="sr-only">{t("header.search")}</span>
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" disabled>
            <Bell className="h-5 w-5 text-muted-foreground/50" />
            <span className="sr-only">{t("header.notifications")}</span>
          </Button>

          {/* User profile */}
          <Button variant="ghost" size="icon" className="rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src="" alt={t("header.userMenu")} />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <span className="sr-only">{t("header.userMenu")}</span>
          </Button>
        </div>
      </div>
    </header>
  );
}


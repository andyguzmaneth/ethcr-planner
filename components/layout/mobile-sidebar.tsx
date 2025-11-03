"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calendar,
  GitBranch,
  CheckSquare,
  Users,
  Settings,
  Menu,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface MobileSidebarProps {
  events: Array<{ id: string; name: string; slug: string }>;
}

export function MobileSidebar({ events }: MobileSidebarProps) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const mainNavigation = [
    {
      name: t("nav.dashboard"),
      href: "/",
      icon: LayoutDashboard,
    },
    {
      name: t("nav.events"),
      href: "/events",
      icon: Calendar,
    },
  ];
  
  // Initialize open events based on current pathname
  const initializeOpenEvents = (): Record<string, boolean> => {
    const initial: Record<string, boolean> = {};
    events.forEach((event) => {
      // Check if current path is under this event (but not just the event root)
      const eventPath = `/events/${event.slug}`;
      if (pathname.startsWith(eventPath) && pathname !== eventPath) {
        initial[event.id] = true;
      }
    });
    return initial;
  };

  const [openEvents, setOpenEvents] = useState<Record<string, boolean>>(initializeOpenEvents);

  // Update open events when pathname changes
  useEffect(() => {
    setOpenEvents((prev) => {
      const updated = { ...prev };
      events.forEach((event) => {
        const eventPath = `/events/${event.slug}`;
        const shouldBeOpen = pathname.startsWith(eventPath) && pathname !== eventPath;
        if (shouldBeOpen && !updated[event.id]) {
          updated[event.id] = true;
        }
      });
      return updated;
    });
  }, [pathname, events]);

  const toggleEvent = (eventId: string) => {
    setOpenEvents((prev) => ({
      ...prev,
      [eventId]: !prev[eventId],
    }));
  };

  const isEventActive = (eventSlug: string) => {
    return pathname.startsWith(`/events/${eventSlug}`);
  };

  const isEventPathActive = (eventSlug: string, path: string) => {
    return pathname === `/events/${eventSlug}${path}`;
  };

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="mr-2 md:hidden" disabled>
        <Menu className="h-5 w-5" />
        <span className="sr-only">{t("header.toggleMenu")}</span>
      </Button>
    );
  }

  return (
    <Sheet>
      <SheetTrigger asChild className="md:hidden">
          <Button variant="ghost" size="icon" className="mr-2">
          <Menu className="h-5 w-5" />
          <span className="sr-only">{t("header.toggleMenu")}</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[240px] p-0">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <Link href="/" className="flex items-center">
              <div className="relative h-8 w-auto aspect-[16/5] max-w-[160px]">
                <Image
                  src="/hero-banner.png"
                  alt="Ethereum Costa Rica Event Planner"
                  fill
                  className="object-contain object-left"
                  priority
                  sizes="160px"
                />
              </div>
            </Link>
          </div>
          <nav className="flex-1 flex flex-col pt-6 pb-4 overflow-y-auto px-4 space-y-1">
            {/* Main Navigation Section */}
            {mainNavigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-foreground/60 hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                </Link>
              );
            })}

            {/* Divider */}
            <div className="h-px bg-border my-2" />

            {/* Events Section */}
            <div className="space-y-1">
              {events.map((event) => {
                const isExpanded = openEvents[event.id] ?? false;
                const eventIsActive = isEventActive(event.slug);

                return (
                  <Collapsible
                    key={event.id}
                    open={isExpanded}
                    onOpenChange={() => toggleEvent(event.id)}
                  >
                    <div className="flex items-center">
                      <Link
                        href={`/events/${event.slug}`}
                        className={cn(
                          "flex-1 flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                          eventIsActive
                            ? "bg-accent text-accent-foreground"
                            : "text-foreground/60 hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        <span className="flex-1 text-left truncate">{event.name}</span>
                      </Link>
                      <CollapsibleTrigger
                        className="p-2 rounded-md hover:bg-accent transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </CollapsibleTrigger>
                    </div>

                    <CollapsibleContent className="pl-6 pt-1 space-y-1">
                      <Link
                      href={`/events/${event.slug}/tracks`}
                      className={cn(
                        "flex items-center px-3 py-1.5 text-sm rounded-md transition-colors",
                        isEventPathActive(event.slug, "/tracks")
                          ? "bg-accent text-accent-foreground"
                          : "text-foreground/60 hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <GitBranch className="mr-2 h-4 w-4" />
                      {t("nav.tracks")}
                    </Link>
                    <Link
                      href={`/events/${event.slug}/tasks`}
                      className={cn(
                        "flex items-center px-3 py-1.5 text-sm rounded-md transition-colors",
                        isEventPathActive(event.slug, "/tasks")
                          ? "bg-accent text-accent-foreground"
                          : "text-foreground/60 hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <CheckSquare className="mr-2 h-4 w-4" />
                      {t("nav.tasks")}
                    </Link>
                    <Link
                      href={`/events/${event.slug}/meetings`}
                      className={cn(
                        "flex items-center px-3 py-1.5 text-sm rounded-md transition-colors",
                        isEventPathActive(event.slug, "/meetings")
                          ? "bg-accent text-accent-foreground"
                          : "text-foreground/60 hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <Users className="mr-2 h-4 w-4" />
                      {t("nav.meetings")}
                    </Link>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </div>
          </nav>
          <div className="px-4 pt-4 border-t pb-4">
            <div
              className={cn(
                "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-not-allowed opacity-50",
                "text-foreground/30"
              )}
            >
              <Settings className="mr-3 h-5 w-5 flex-shrink-0 text-foreground/30" />
              {t("nav.settings")}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}


"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calendar,
  GitBranch,
  CheckSquare,
  Users,
  Settings,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface SidebarProps {
  events: Array<{ 
    id: string; 
    name: string; 
    slug: string;
    areas?: Array<{ id: string; name: string }>;
  }>;
}

export function Sidebar({ events }: SidebarProps) {
  const pathname = usePathname();
  const { t } = useTranslation();

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

  // Helper function to check if an area path is active
  const isAreaPathActive = (eventSlug: string, areaId: string) => {
    return pathname === `/events/${eventSlug}/areas/${areaId}`;
  };
  
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

  // Initialize open areas based on current pathname
  const initializeOpenAreas = (): Record<string, boolean> => {
    const initial: Record<string, boolean> = {};
    events.forEach((event) => {
      if (event.areas) {
        // Check if current path is an area detail page for this event
        const hasActiveArea = event.areas.some((area) => 
          isAreaPathActive(event.slug, area.id)
        );
        if (hasActiveArea) {
          initial[event.id] = true;
        }
      }
    });
    return initial;
  };

  const [openEvents, setOpenEvents] = useState<Record<string, boolean>>(initializeOpenEvents);
  const [openAreas, setOpenAreas] = useState<Record<string, boolean>>(initializeOpenAreas);

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

    setOpenAreas((prev) => {
      const updated = { ...prev };
      events.forEach((event) => {
        if (event.areas) {
          const hasActiveArea = event.areas.some((area) => 
            isAreaPathActive(event.slug, area.id)
          );
          if (hasActiveArea && !updated[event.id]) {
            updated[event.id] = true;
          }
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

  const toggleAreas = (eventId: string) => {
    setOpenAreas((prev) => ({
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

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 md:top-16 border-r bg-sidebar">
      <div className="flex-1 flex flex-col pt-6 pb-4 overflow-y-auto">
        <nav className="flex-1 px-4 space-y-1">
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
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "mr-3 h-5 w-5 flex-shrink-0",
                    isActive
                      ? "text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/60 group-hover:text-sidebar-accent-foreground"
                  )}
                />
                {item.name}
              </Link>
            );
          })}

          {/* Divider */}
          <div className="h-px bg-sidebar-border my-2" />

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
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <span className="flex-1 text-left truncate">{event.name}</span>
                    </Link>
                    <CollapsibleTrigger
                      className="p-2 rounded-md hover:bg-sidebar-accent transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </CollapsibleTrigger>
                  </div>

                  <CollapsibleContent className="pl-6 pt-1 space-y-1">
                    {event.areas && event.areas.length > 0 ? (
                      <Collapsible
                        open={openAreas[event.id] ?? false}
                        onOpenChange={(open) => {
                          setOpenAreas((prev) => ({
                            ...prev,
                            [event.id]: open,
                          }));
                        }}
                      >
                        <div className="flex items-center">
                          <Link
                            href={`/events/${event.slug}/areas`}
                            className={cn(
                              "flex-1 flex items-center px-3 py-1.5 text-sm rounded-md transition-colors",
                              isEventPathActive(event.slug, "/areas") && !event.areas.some((area) => isAreaPathActive(event.slug, area.id))
                                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                            )}
                          >
                            <GitBranch className="mr-2 h-4 w-4" />
                            {t("nav.areas")}
                          </Link>
                          <CollapsibleTrigger
                            className="p-1 rounded-md hover:bg-sidebar-accent transition-colors"
                          >
                            {openAreas[event.id] ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </CollapsibleTrigger>
                        </div>
                        <CollapsibleContent className="pl-6 pt-1 space-y-1">
                          {event.areas.map((area) => (
                            <Link
                              key={area.id}
                              href={`/events/${event.slug}/areas/${area.id}`}
                              className={cn(
                                "flex items-center px-3 py-1.5 text-sm rounded-md transition-colors",
                                isAreaPathActive(event.slug, area.id)
                                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                  : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                              )}
                            >
                              <span className="mr-2 h-2 w-2 rounded-full bg-current opacity-60" />
                              <span className="truncate">{area.name}</span>
                            </Link>
                          ))}
                        </CollapsibleContent>
                      </Collapsible>
                    ) : (
                      <Link
                        href={`/events/${event.slug}/areas`}
                        className={cn(
                          "flex items-center px-3 py-1.5 text-sm rounded-md transition-colors",
                          isEventPathActive(event.slug, "/areas")
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        )}
                      >
                        <GitBranch className="mr-2 h-4 w-4" />
                        {t("nav.areas")}
                      </Link>
                    )}
                    <Link
                      href={`/events/${event.slug}/tasks`}
                      className={cn(
                        "flex items-center px-3 py-1.5 text-sm rounded-md transition-colors",
                        isEventPathActive(event.slug, "/tasks")
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
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
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
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

        {/* Settings at bottom */}
        <div className="px-4 pt-4 border-t">
          <Link
            href="/settings"
            className={cn(
              "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
              pathname === "/settings"
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <Settings className="mr-3 h-5 w-5 flex-shrink-0" />
            {t("nav.settings")}
          </Link>
        </div>
      </div>
    </aside>
  );
}


"use client";

import { useState } from "react";
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
// Events are passed as props

const mainNavigation = [
  {
    name: "Panel",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Eventos",
    href: "/events",
    icon: Calendar,
  },
];

interface SidebarProps {
  events: Array<{ id: string; name: string; slug: string }>;
}

export function Sidebar({ events }: SidebarProps) {
  const pathname = usePathname();
  const [openEvents, setOpenEvents] = useState<Record<string, boolean>>({});

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
                    <Link
                      href={`/events/${event.slug}/tracks`}
                      className={cn(
                        "flex items-center px-3 py-1.5 text-sm rounded-md transition-colors",
                        isEventPathActive(event.slug, "/tracks")
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <GitBranch className="mr-2 h-4 w-4" />
                      Tracks
                    </Link>
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
                      Tareas
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
                      Reuniones
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
            Configuración
          </Link>
        </div>
      </div>
    </aside>
  );
}


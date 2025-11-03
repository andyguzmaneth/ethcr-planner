"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
// Mobile sidebar will receive events as prop or fetch them

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

interface MobileSidebarProps {
  events: Array<{ id: string; name: string; slug: string }>;
}

export function MobileSidebar({ events }: MobileSidebarProps) {
  const pathname = usePathname();
  
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

  return (
    <Sheet>
      <SheetTrigger asChild className="md:hidden">
        <Button variant="ghost" size="icon" className="mr-2">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Alternar menú</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[240px] p-0">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <span className="font-bold text-lg">ETHCR Planner</span>
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
                        Tracks
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
                        Tareas
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
                        Reuniones
                      </Link>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </div>
          </nav>
          <div className="px-4 pt-4 border-t pb-4">
            <Link
              href="/settings"
              className={cn(
                "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                pathname === "/settings"
                  ? "bg-accent text-accent-foreground"
                  : "text-foreground/60 hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Settings className="mr-3 h-5 w-5 flex-shrink-0" />
              Configuración
            </Link>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}


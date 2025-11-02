"use client";

import { useState } from "react";
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
  events: Array<{ id: string; name: string }>;
}

export function MobileSidebar({ events }: MobileSidebarProps) {
  const pathname = usePathname();
  const [openEvents, setOpenEvents] = useState<Record<string, boolean>>({});

  const toggleEvent = (eventId: string) => {
    setOpenEvents((prev) => ({
      ...prev,
      [eventId]: !prev[eventId],
    }));
  };

  const isEventActive = (eventId: string) => {
    return pathname.startsWith(`/events/${eventId}`);
  };

  const isEventPathActive = (eventId: string, path: string) => {
    return pathname === `/events/${eventId}${path}`;
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
                const eventIsActive = isEventActive(event.id);

                return (
                  <Collapsible
                    key={event.id}
                    open={isExpanded}
                    onOpenChange={() => toggleEvent(event.id)}
                  >
                    <div className="flex items-center">
                      <Link
                        href={`/events/${event.id}`}
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
                        href={`/events/${event.id}/tracks`}
                        className={cn(
                          "flex items-center px-3 py-1.5 text-sm rounded-md transition-colors",
                          isEventPathActive(event.id, "/tracks")
                            ? "bg-accent text-accent-foreground"
                            : "text-foreground/60 hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        <GitBranch className="mr-2 h-4 w-4" />
                        Tracks
                      </Link>
                      <Link
                        href={`/events/${event.id}/tasks`}
                        className={cn(
                          "flex items-center px-3 py-1.5 text-sm rounded-md transition-colors",
                          isEventPathActive(event.id, "/tasks")
                            ? "bg-accent text-accent-foreground"
                            : "text-foreground/60 hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        <CheckSquare className="mr-2 h-4 w-4" />
                        Tareas
                      </Link>
                      <Link
                        href={`/events/${event.id}/meetings`}
                        className={cn(
                          "flex items-center px-3 py-1.5 text-sm rounded-md transition-colors",
                          isEventPathActive(event.id, "/meetings")
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


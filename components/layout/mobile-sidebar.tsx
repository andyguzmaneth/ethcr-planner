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
  projects: Array<{ id: string; name: string; slug: string }>;
}

export function MobileSidebar({ projects }: MobileSidebarProps) {
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
      name: t("nav.projects"),
      href: "/projects",
      icon: Calendar,
    },
  ];
  
  // Initialize open projects based on current pathname
  const initializeOpenProjects = (): Record<string, boolean> => {
    const initial: Record<string, boolean> = {};
    projects.forEach((project) => {
      // Check if current path is under this project (but not just the project root)
      const projectPath = `/projects/${project.slug}`;
      if (pathname.startsWith(projectPath) && pathname !== projectPath) {
        initial[project.id] = true;
      }
    });
    return initial;
  };

  const [openProjects, setOpenProjects] = useState<Record<string, boolean>>(initializeOpenProjects);

  // Update open projects when pathname changes
  useEffect(() => {
    setOpenProjects((prev) => {
      const updated = { ...prev };
      projects.forEach((project) => {
        const projectPath = `/projects/${project.slug}`;
        const shouldBeOpen = pathname.startsWith(projectPath) && pathname !== projectPath;
        if (shouldBeOpen && !updated[project.id]) {
          updated[project.id] = true;
        }
      });
      return updated;
    });
  }, [pathname, projects]);

  const toggleProject = (projectId: string) => {
    setOpenProjects((prev) => ({
      ...prev,
      [projectId]: !prev[projectId],
    }));
  };

  const isProjectActive = (projectSlug: string) => {
    return pathname.startsWith(`/projects/${projectSlug}`);
  };

  const isProjectPathActive = (projectSlug: string, path: string) => {
    return pathname === `/projects/${projectSlug}${path}`;
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

            {/* Projects Section */}
            <div className="space-y-1">
              {projects.map((project) => {
                const isExpanded = openProjects[project.id] ?? false;
                const projectIsActive = isProjectActive(project.slug);

                return (
                  <Collapsible
                    key={project.id}
                    open={isExpanded}
                    onOpenChange={() => toggleProject(project.id)}
                  >
                    <div className="flex items-center">
                      <Link
                        href={`/projects/${project.slug}`}
                        className={cn(
                          "flex-1 flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                          projectIsActive
                            ? "bg-accent text-accent-foreground"
                            : "text-foreground/60 hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        <span className="flex-1 text-left truncate">{project.name}</span>
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
                      href={`/projects/${project.slug}/areas`}
                      className={cn(
                        "flex items-center px-3 py-1.5 text-sm rounded-md transition-colors",
                        isProjectPathActive(project.slug, "/areas")
                          ? "bg-accent text-accent-foreground"
                          : "text-foreground/60 hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <GitBranch className="mr-2 h-4 w-4" />
                      {t("nav.areas")}
                    </Link>
                    <Link
                      href={`/projects/${project.slug}/tasks`}
                      className={cn(
                        "flex items-center px-3 py-1.5 text-sm rounded-md transition-colors",
                        isProjectPathActive(project.slug, "/tasks")
                          ? "bg-accent text-accent-foreground"
                          : "text-foreground/60 hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <CheckSquare className="mr-2 h-4 w-4" />
                      {t("nav.tasks")}
                    </Link>
                    <Link
                      href={`/projects/${project.slug}/meetings`}
                      className={cn(
                        "flex items-center px-3 py-1.5 text-sm rounded-md transition-colors",
                        isProjectPathActive(project.slug, "/meetings")
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


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
  projects: Array<{ 
    id: string; 
    name: string; 
    slug: string;
    areas?: Array<{ id: string; name: string }>;
  }>;
}

export function Sidebar({ projects }: SidebarProps) {
  const pathname = usePathname();
  const { t } = useTranslation();

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

  // Helper function to check if an area path is active
  const isAreaPathActive = (projectSlug: string, areaId: string) => {
    return pathname === `/projects/${projectSlug}/areas/${areaId}`;
  };
  
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

  // Initialize open areas based on current pathname
  const initializeOpenAreas = (): Record<string, boolean> => {
    const initial: Record<string, boolean> = {};
    projects.forEach((project) => {
      if (project.areas) {
        // Check if current path is an area detail page for this project
        const hasActiveArea = project.areas.some((area) => 
          isAreaPathActive(project.slug, area.id)
        );
        if (hasActiveArea) {
          initial[project.id] = true;
        }
      }
    });
    return initial;
  };

  const [openProjects, setOpenProjects] = useState<Record<string, boolean>>(initializeOpenProjects);
  const [openAreas, setOpenAreas] = useState<Record<string, boolean>>(initializeOpenAreas);

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

    setOpenAreas((prev) => {
      const updated = { ...prev };
      projects.forEach((project) => {
        if (project.areas) {
          const hasActiveArea = project.areas.some((area) => 
            isAreaPathActive(project.slug, area.id)
          );
          if (hasActiveArea && !updated[project.id]) {
            updated[project.id] = true;
          }
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

  const toggleAreas = (projectId: string) => {
    setOpenAreas((prev) => ({
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
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <span className="flex-1 text-left truncate">{project.name}</span>
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
                    {project.areas && project.areas.length > 0 ? (
                      <Collapsible
                        open={openAreas[project.id] ?? false}
                        onOpenChange={(open) => {
                          setOpenAreas((prev) => ({
                            ...prev,
                            [project.id]: open,
                          }));
                        }}
                      >
                        <div className="flex items-center">
                          <Link
                            href={`/projects/${project.slug}/areas`}
                            className={cn(
                              "flex-1 flex items-center px-3 py-1.5 text-sm rounded-md transition-colors",
                              isProjectPathActive(project.slug, "/areas") && !project.areas.some((area) => isAreaPathActive(project.slug, area.id))
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
                            {openAreas[project.id] ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </CollapsibleTrigger>
                        </div>
                        <CollapsibleContent className="pl-6 pt-1 space-y-1">
                          {project.areas.map((area) => (
                            <Link
                              key={area.id}
                              href={`/projects/${project.slug}/areas/${area.id}`}
                              className={cn(
                                "flex items-center px-3 py-1.5 text-sm rounded-md transition-colors",
                                isAreaPathActive(project.slug, area.id)
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
                        href={`/projects/${project.slug}/areas`}
                        className={cn(
                          "flex items-center px-3 py-1.5 text-sm rounded-md transition-colors",
                          isProjectPathActive(project.slug, "/areas")
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        )}
                      >
                        <GitBranch className="mr-2 h-4 w-4" />
                        {t("nav.areas")}
                      </Link>
                    )}
                    <Link
                      href={`/projects/${project.slug}/tasks`}
                      className={cn(
                        "flex items-center px-3 py-1.5 text-sm rounded-md transition-colors",
                        isProjectPathActive(project.slug, "/tasks")
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
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
          <div
            className={cn(
              "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-not-allowed opacity-50",
              "text-sidebar-foreground/30"
            )}
          >
            <Settings className="mr-3 h-5 w-5 flex-shrink-0 text-sidebar-foreground/30" />
            {t("nav.settings")}
          </div>
        </div>
      </div>
    </aside>
  );
}


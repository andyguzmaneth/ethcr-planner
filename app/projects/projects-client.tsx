"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, UserPlus, Check } from "lucide-react";
import Link from "next/link";
import { NewProjectModal } from "@/components/projects/new-project-modal";
import { useTranslation } from "@/lib/i18n/useTranslation";
import type { Project, ProjectType } from "@/lib/types";

interface ProjectsClientProps {
  projects: Array<
    Project & {
      areaCount: number;
      taskCount: number;
      completedTasks: number;
      isJoined: boolean;
    }
  >;
}

export function ProjectsClient({ projects }: ProjectsClientProps) {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [joiningProjects, setJoiningProjects] = useState<Set<string>>(new Set());
  const [joinedStates, setJoinedStates] = useState<Set<string>>(
    new Set(projects.filter((p) => p.isJoined).map((p) => p.id))
  );
  const router = useRouter();

  const handleContinue = (projectType: ProjectType, templateId?: string) => {
    // Here the logic for creating the project with the selected template will be implemented
    console.log("Create project with type:", projectType, "template:", templateId);
    // TODO: Implement project creation
  };

  const handleJoinProject = async (projectId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (joiningProjects.has(projectId)) return;

    setJoiningProjects((prev) => new Set(prev).add(projectId));

    try {
      const response = await fetch(`/api/projects/${projectId}/join`, {
        method: "POST",
      });

      if (response.ok) {
        setJoinedStates((prev) => new Set(prev).add(projectId));
        router.refresh(); // Refresh to update sidebar
      }
    } catch (error) {
      console.error("Error joining project:", error);
    } finally {
      setJoiningProjects((prev) => {
        const next = new Set(prev);
        next.delete(projectId);
        return next;
      });
    }
  };

  const handleLeaveProject = async (projectId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (joiningProjects.has(projectId)) return;

    setJoiningProjects((prev) => new Set(prev).add(projectId));

    try {
      const response = await fetch(`/api/projects/${projectId}/join`, {
        method: "DELETE",
      });

      if (response.ok) {
        setJoinedStates((prev) => {
          const next = new Set(prev);
          next.delete(projectId);
          return next;
        });
        router.refresh(); // Refresh to update sidebar
      }
    } catch (error) {
      console.error("Error leaving project:", error);
    } finally {
      setJoiningProjects((prev) => {
        const next = new Set(prev);
        next.delete(projectId);
        return next;
      });
    }
  };

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("projects.title")}</h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            {t("projects.description")}
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          {t("projects.newProject")}
        </Button>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">{t("projects.noProjects")}</p>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t("projects.createFirstProject")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const progress = project.taskCount > 0
              ? Math.round((project.completedTasks / project.taskCount) * 100)
              : 0;

            const isJoined = joinedStates.has(project.id);
            const isLoading = joiningProjects.has(project.id);

            return (
              <Card
                key={project.id}
                className="hover:shadow-lg transition-shadow relative"
              >
                <Link href={`/projects/${project.slug}`} className="block">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1 pr-2">
                        <CardTitle className="text-xl">{project.name}</CardTitle>
                        <CardDescription>
                          <Badge variant="secondary" className="mr-2">
                            {project.type}
                          </Badge>
                          {project.status}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{project.areaCount} {t("projects.areas")}</span>
                        <span className="text-muted-foreground">
                          {project.completedTasks}/{project.taskCount} {t("projects.tasks")}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{t("projects.progress")}</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Link>
                {/* Join/Leave Button - positioned absolutely to not interfere with card click */}
                <div className="absolute top-4 right-4">
                  {isJoined ? (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={(e) => handleLeaveProject(project.id, e)}
                      disabled={isLoading}
                      className="gap-2"
                    >
                      {isLoading ? (
                        <>
                          <span className="animate-spin">⟳</span>
                          {t("projects.leaving")}
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4" />
                          {t("projects.joined")}
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => handleJoinProject(project.id, e)}
                      disabled={isLoading}
                      className="gap-2"
                    >
                      {isLoading ? (
                        <>
                          <span className="animate-spin">⟳</span>
                          {t("projects.joining")}
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4" />
                          {t("projects.join")}
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <NewProjectModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onContinue={handleContinue}
      />
    </>
  );
}



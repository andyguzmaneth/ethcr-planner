"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Settings } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { NewAreaModal } from "@/components/projects/new-area-modal";
import { NewTaskModal } from "@/components/projects/new-task-modal";
import { DeleteAreaDialog } from "@/components/projects/delete-area-dialog";
import { EditProjectModal } from "@/components/projects/edit-project-modal";
import { AreaCard } from "@/components/projects/area-card";
import { useRouter } from "next/navigation";
import { Area, Task } from "@/lib/types";
import type { Project } from "@/lib/types";
import { ProjectTasksListClient } from "./tasks/project-tasks-list-client";
import { MeetingsClient } from "./meetings/meetings-client";

interface AreaWithStats {
  id: string;
  name: string;
  leadId?: string;
  leadName: string | null;
  taskCount: number;
  completed: number;
}

interface User {
  id: string;
  name: string;
  initials: string;
  email?: string;
}

interface TaskWithDetails extends Task {
  assignee?: {
    id: string;
    name: string;
    initials?: string;
  } | null;
  area?: {
    id: string;
    name: string;
  } | null;
}

import type { EnrichedMeeting } from "@/lib/utils/meeting-helpers";

type MeetingWithDetails = EnrichedMeeting;

interface ProjectDetailClientProps {
  project: {
    id: string;
    name: string;
    type: string;
    status: string;
  };
  projectSlug: string;
  areasWithStats: AreaWithStats[];
  totalAreas: number;
  totalTasks: number;
  completionPercentage: number;
  users: User[];
  areas: Array<{ id: string; name: string }>;
  tasks: TaskWithDetails[];
  statusColors: Record<string, string>;
  statusLabels: Record<string, string>;
  meetings: MeetingWithDetails[];
}

export function ProjectDetailClient({
  project,
  projectSlug,
  areasWithStats,
  totalAreas,
  totalTasks,
  completionPercentage,
  users,
  areas,
  tasks,
  statusColors,
  statusLabels,
  meetings,
}: ProjectDetailClientProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [isAreaModalOpen, setIsAreaModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [areaToDelete, setAreaToDelete] = useState<AreaWithStats | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
  const [fullProject, setFullProject] = useState<Project | null>(null);

  const handleAreaCreated = () => {
    router.refresh();
  };

  const handleModalClose = (open: boolean) => {
    setIsAreaModalOpen(open);
    if (!open) {
      setEditingArea(null);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, area: AreaWithStats) => {
    e.stopPropagation();
    setAreaToDelete(area);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!areaToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/areas/${areaToDelete.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setDeleteDialogOpen(false);
        setAreaToDelete(null);
        router.refresh();
      } else {
        console.error("Failed to delete area");
      }
    } catch (error) {
      console.error("Error deleting area:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditClick = async (e: React.MouseEvent, area: AreaWithStats) => {
    e.stopPropagation();
    
    // Fetch full area data
    try {
      const response = await fetch(`/api/areas/${area.id}`);
      if (response.ok) {
        const fullArea = await response.json();
        setEditingArea(fullArea);
        setIsAreaModalOpen(true);
      } else {
        console.error("Failed to fetch area data");
      }
    } catch (error) {
      console.error("Error fetching area data:", error);
    }
  };

  const handleEditProjectClick = async () => {
    try {
      const response = await fetch(`/api/projects/${project.id}`);
      if (response.ok) {
        const fullProjectData = await response.json();
        setFullProject(fullProjectData);
        setIsEditProjectModalOpen(true);
      } else {
        console.error("Failed to fetch project data");
      }
    } catch (error) {
      console.error("Error fetching project data:", error);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Project Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
            <Badge variant="secondary">{project.type}</Badge>
            <Badge>{project.status}</Badge>
          </div>
          <p className="text-muted-foreground">
            {t("projectDetail.projectPlanningPanel")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleEditProjectClick}>
            <Settings className="mr-2 h-4 w-4" />
            {t("projectDetail.editProject")}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">{t("projectDetail.overview")}</TabsTrigger>
          <TabsTrigger value="areas">{t("nav.areas")}</TabsTrigger>
          <TabsTrigger value="tasks">{t("nav.tasks")}</TabsTrigger>
          <TabsTrigger value="meetings">{t("nav.meetings")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">{t("projectDetail.totalAreas")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalAreas}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">{t("projectDetail.totalTasks")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalTasks}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">{t("projectDetail.completion")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completionPercentage}%</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="areas" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">{t("nav.areas")}</h2>
            <Button onClick={() => setIsAreaModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t("projectDetail.addArea")}
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {areasWithStats.map((area) => (
              <AreaCard
                key={area.id}
                area={{
                  id: area.id,
                  name: area.name,
                  taskCount: area.taskCount,
                  completed: area.completed,
                  leadName: area.leadName,
                }}
                projectSlug={projectSlug}
                onEditClick={(e) => handleEditClick(e, area)}
                onDeleteClick={(e) => handleDeleteClick(e, area)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">{t("nav.tasks")}</h2>
            <Button onClick={() => setIsTaskModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t("projectDetail.addTask")}
            </Button>
          </div>
          <ProjectTasksListClient
            tasks={tasks}
            projectId={project.id}
            projectName={project.name}
            areas={areas}
            users={users}
            statusColors={statusColors}
            statusLabels={statusLabels}
          />
        </TabsContent>

        <TabsContent value="meetings" className="space-y-4">
          <MeetingsClient
            projectId={project.id}
            projectSlug={projectSlug}
            projectName={project.name}
            initialMeetings={meetings}
            users={users}
            hideHeader={true}
          />
        </TabsContent>
      </Tabs>

      <NewAreaModal
        open={isAreaModalOpen}
        onOpenChange={handleModalClose}
        area={editingArea || undefined}
        projectId={project.id}
        users={users}
        onSuccess={handleAreaCreated}
      />
      <NewTaskModal
        open={isTaskModalOpen}
        onOpenChange={setIsTaskModalOpen}
        projectId={project.id}
        projectName={project.name}
        areas={areas}
        users={users}
        onSuccess={() => router.refresh()}
      />
      {areaToDelete && (
        <DeleteAreaDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          areaName={areaToDelete.name}
          taskCount={areaToDelete.taskCount}
          onConfirm={handleConfirmDelete}
          isDeleting={isDeleting}
        />
      )}
      {fullProject && (
        <EditProjectModal
          open={isEditProjectModalOpen}
          onOpenChange={setIsEditProjectModalOpen}
          project={fullProject}
          onSuccess={() => router.refresh()}
        />
      )}
    </div>
  );
}


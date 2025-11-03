"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Settings, MoreVertical, Edit, Trash2 } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { NewAreaModal } from "@/components/events/new-area-modal";
import { NewTaskModal } from "@/components/events/new-task-modal";
import { DeleteAreaDialog } from "@/components/events/delete-area-dialog";
import { useRouter } from "next/navigation";

interface AreaWithStats {
  id: string;
  name: string;
  leadId: string;
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

interface EventDetailClientProps {
  event: {
    id: string;
    name: string;
    type: string;
    status: string;
  };
  areasWithStats: AreaWithStats[];
  totalAreas: number;
  totalTasks: number;
  completionPercentage: number;
  users: User[];
  areas: Array<{ id: string; name: string }>;
}

export function EventDetailClient({
  event,
  areasWithStats,
  totalAreas,
  totalTasks,
  completionPercentage,
  users,
  areas,
}: EventDetailClientProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [isAreaModalOpen, setIsAreaModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [areaToDelete, setAreaToDelete] = useState<AreaWithStats | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleAreaCreated = () => {
    router.refresh();
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

  const handleEditClick = (e: React.MouseEvent, area: AreaWithStats) => {
    e.stopPropagation();
    // TODO: Implement edit area functionality
    console.log("Edit area:", area);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Event Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{event.name}</h1>
            <Badge variant="secondary">{event.type}</Badge>
            <Badge>{event.status}</Badge>
          </div>
          <p className="text-muted-foreground">
            {t("eventDetail.eventPlanningPanel")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            {t("eventDetail.editEvent")}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">{t("eventDetail.overview")}</TabsTrigger>
          <TabsTrigger value="areas">{t("nav.areas")}</TabsTrigger>
          <TabsTrigger value="tasks">{t("nav.tasks")}</TabsTrigger>
          <TabsTrigger value="meetings">{t("nav.meetings")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">{t("eventDetail.totalAreas")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalAreas}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">{t("eventDetail.totalTasks")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalTasks}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">{t("eventDetail.completion")}</CardTitle>
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
              {t("eventDetail.addArea")}
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {areasWithStats.map((area) => {
              const progress = area.taskCount > 0
                ? Math.round((area.completed / area.taskCount) * 100)
                : 0;

              return (
                <Card key={area.id} className="group relative">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{area.name}</CardTitle>
                        <CardDescription>
                          {t("eventDetail.leader")}: {area.leadName || t("eventDetail.unassigned")}
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">{t("common.actions")}</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => handleEditClick(e, area)}>
                            <Edit className="mr-2 h-4 w-4" />
                            {t("common.edit")}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={(e) => handleDeleteClick(e, area)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t("common.delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {area.completed}/{area.taskCount} {t("events.tasks")}
                        </span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="tasks">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">{t("nav.tasks")}</h2>
            <Button onClick={() => setIsTaskModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t("eventDetail.addTask")}
            </Button>
          </div>
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center py-8">
                {t("eventDetail.tasksListDescription")}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="meetings">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">{t("nav.meetings")}</h2>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t("eventDetail.scheduleMeeting")}
            </Button>
          </div>
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center py-8">
                {t("eventDetail.meetingsListDescription")}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <NewAreaModal
        open={isAreaModalOpen}
        onOpenChange={setIsAreaModalOpen}
        eventId={event.id}
        users={users}
        onSuccess={handleAreaCreated}
      />
      <NewTaskModal
        open={isTaskModalOpen}
        onOpenChange={setIsTaskModalOpen}
        eventId={event.id}
        eventName={event.name}
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
    </div>
  );
}


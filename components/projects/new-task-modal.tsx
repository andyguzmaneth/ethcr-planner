"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Task, RecurrenceFrequency } from "@/lib/types";

interface User {
  id: string;
  name: string;
  initials: string;
  email?: string;
}

interface Area {
  id: string;
  name: string;
  projectId?: string; // Optional for filtering when project is selected
}

interface Project {
  id: string;
  name: string;
}

interface NewTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task; // Optional task for edit mode
  projectId?: string; // Auto-filled from URL
  areaId?: string; // Auto-filled from URL
  projectName?: string; // For display
  areaName?: string; // For display
  projects?: Project[]; // For dropdown when projectId is not provided
  areas?: Area[]; // Areas for the project (filtered by projectId if provided)
  tasks?: Task[]; // All tasks from the project (for dependencies)
  users: User[];
  onSuccess?: () => void;
}

export function NewTaskModal({
  open,
  onOpenChange,
  task: editingTask,
  projectId: initialProjectId,
  areaId: initialAreaId,
  projectName,
  areaName,
  projects = [],
  areas = [],
  tasks = [],
  users,
  onSuccess,
}: NewTaskModalProps) {
  const { t } = useTranslation();
  const isEditMode = !!editingTask;
  
  // Initialize form with task data if editing
  const [title, setTitle] = useState(editingTask?.title || "");
  const [description, setDescription] = useState(editingTask?.description || "");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(editingTask?.projectId || initialProjectId || null);
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(editingTask?.areaId || initialAreaId || null);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string | null>(editingTask?.assigneeId || null);
  const [deadline, setDeadline] = useState(editingTask?.deadline ? editingTask.deadline.split("T")[0] : "");
  const [status, setStatus] = useState<"pending" | "in_progress" | "blocked" | "completed">(editingTask?.status || "pending");
  const [supportResources, setSupportResources] = useState(editingTask?.supportResources?.join("\n") || "");
  
  // Task dependencies
  const [selectedDependencies, setSelectedDependencies] = useState<string[]>(editingTask?.dependsOn || []);
  
  // Recurring tasks
  const [isRecurring, setIsRecurring] = useState(editingTask?.isRecurring || false);
  const [recurrenceFrequency, setRecurrenceFrequency] = useState<RecurrenceFrequency>(editingTask?.recurrence?.frequency || "monthly");
  const [recurrenceInterval, setRecurrenceInterval] = useState(editingTask?.recurrence?.interval || 1);
  const [recurrenceEndDate, setRecurrenceEndDate] = useState(editingTask?.recurrence?.endDate ? editingTask.recurrence.endDate.split("T")[0] : "");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isAreaDropdownOpen, setIsAreaDropdownOpen] = useState(false);
  const [isAssigneeDropdownOpen, setIsAssigneeDropdownOpen] = useState(false);
  const [isDependenciesDropdownOpen, setIsDependenciesDropdownOpen] = useState(false);
  const [projectSearchQuery, setProjectSearchQuery] = useState("");
  const [areaSearchQuery, setAreaSearchQuery] = useState("");
  const [assigneeSearchQuery, setAssigneeSearchQuery] = useState("");
  const [dependenciesSearchQuery, setDependenciesSearchQuery] = useState("");
  
  const projectDropdownRef = useRef<HTMLDivElement>(null);
  const areaDropdownRef = useRef<HTMLDivElement>(null);
  const assigneeDropdownRef = useRef<HTMLDivElement>(null);
  const dependenciesDropdownRef = useRef<HTMLDivElement>(null);

  // Get available tasks for dependencies (exclude current task if editing, filter by project)
  const availableDependencyTasks = useMemo(() => {
    if (!selectedProjectId) return [];
    return tasks.filter((t) => {
      // Exclude current task if editing
      if (editingTask && t.id === editingTask.id) return false;
      // Only include tasks from the same project
      return t.projectId === selectedProjectId || t.eventId === selectedProjectId;
    });
  }, [tasks, selectedProjectId, editingTask]);

  // Filter areas based on selected project
  const filteredAreas = useMemo(() => {
    if (!selectedProjectId) return [];
    // If areas have projectId, filter by it. Otherwise, assume they're already filtered by parent.
    return areas.filter((area) => {
      if (area.projectId) {
        return area.projectId === selectedProjectId;
      }
      // If no projectId in area, assume parent already filtered them
      return true;
    });
  }, [areas, selectedProjectId]);

  // Filter users
  const filteredUsers = useMemo(() => {
    if (!assigneeSearchQuery) return users;
    const query = assigneeSearchQuery.toLowerCase();
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.id.toLowerCase().includes(query)
    );
  }, [users, assigneeSearchQuery]);

  // Filter projects
  const filteredProjects = useMemo(() => {
    if (!projectSearchQuery) return projects;
    const query = projectSearchQuery.toLowerCase();
    return projects.filter(
      (project) =>
        project.name.toLowerCase().includes(query) ||
        project.id.toLowerCase().includes(query)
    );
  }, [projects, projectSearchQuery]);

  // Filter areas by search
  const filteredAreasBySearch = useMemo(() => {
    if (!areaSearchQuery) return filteredAreas;
    const query = areaSearchQuery.toLowerCase();
    return filteredAreas.filter(
      (area) =>
        area.name.toLowerCase().includes(query) ||
        area.id.toLowerCase().includes(query)
    );
  }, [filteredAreas, areaSearchQuery]);

  // Filter dependency tasks by search
  const filteredDependencyTasks = useMemo(() => {
    if (!dependenciesSearchQuery) return availableDependencyTasks;
    const query = dependenciesSearchQuery.toLowerCase();
    return availableDependencyTasks.filter(
      (task) =>
        task.title.toLowerCase().includes(query) ||
        task.id.toLowerCase().includes(query)
    );
  }, [availableDependencyTasks, dependenciesSearchQuery]);

  const selectedProject = projects.find((p) => p.id === selectedProjectId) || 
    (initialProjectId && projectName ? { id: initialProjectId, name: projectName } : null);
  const selectedArea = filteredAreas.find((a) => a.id === selectedAreaId) ||
    (initialAreaId && areaName ? { id: initialAreaId, name: areaName } : null);
  const selectedAssignee = users.find((u) => u.id === selectedAssigneeId) || null;

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (projectDropdownRef.current && !projectDropdownRef.current.contains(event.target as Node)) {
        setIsProjectDropdownOpen(false);
      }
      if (areaDropdownRef.current && !areaDropdownRef.current.contains(event.target as Node)) {
        setIsAreaDropdownOpen(false);
      }
      if (assigneeDropdownRef.current && !assigneeDropdownRef.current.contains(event.target as Node)) {
        setIsAssigneeDropdownOpen(false);
      }
      if (dependenciesDropdownRef.current && !dependenciesDropdownRef.current.contains(event.target as Node)) {
        setIsDependenciesDropdownOpen(false);
      }
    }

    if (isProjectDropdownOpen || isAreaDropdownOpen || isAssigneeDropdownOpen || isDependenciesDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProjectDropdownOpen, isAreaDropdownOpen, isAssigneeDropdownOpen, isDependenciesDropdownOpen]);

  // Update selectedProjectId when initialProjectId changes
  useEffect(() => {
    if (initialProjectId) {
      setSelectedProjectId(initialProjectId);
    }
  }, [initialProjectId]);

  // Update selectedAreaId when initialAreaId changes
  useEffect(() => {
    if (initialAreaId) {
      setSelectedAreaId(initialAreaId);
    }
  }, [initialAreaId]);

  // Reset form when modal opens/closes or task changes
  useEffect(() => {
    if (open && editingTask) {
      setTitle(editingTask.title || "");
      setDescription(editingTask.description || "");
      setSelectedProjectId(editingTask.projectId || editingTask.eventId || initialProjectId || null);
      setSelectedAreaId(editingTask.areaId || initialAreaId || null);
      setSelectedAssigneeId(editingTask.assigneeId || null);
      setDeadline(editingTask.deadline ? editingTask.deadline.split("T")[0] : "");
      setStatus(editingTask.status || "pending");
      setSupportResources(editingTask.supportResources?.join("\n") || "");
      setSelectedDependencies(editingTask.dependsOn || []);
      setIsRecurring(editingTask.isRecurring || false);
      setRecurrenceFrequency(editingTask.recurrence?.frequency || "monthly");
      setRecurrenceInterval(editingTask.recurrence?.interval || 1);
      setRecurrenceEndDate(editingTask.recurrence?.endDate ? editingTask.recurrence.endDate.split("T")[0] : "");
      setError(null);
    } else if (open && !editingTask) {
      // Reset to defaults when creating new task
      setTitle("");
      setDescription("");
      setSelectedProjectId(initialProjectId || null);
      setSelectedAreaId(initialAreaId || null);
      setSelectedAssigneeId(null);
      setDeadline("");
      setStatus("pending");
      setSupportResources("");
      setSelectedDependencies([]);
      setIsRecurring(false);
      setRecurrenceFrequency("monthly");
      setRecurrenceInterval(1);
      setRecurrenceEndDate("");
      setError(null);
    }
  }, [open, editingTask, initialProjectId, initialAreaId]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError(t("newTaskModal.errors.titleRequired"));
      return;
    }

    const finalProjectId = selectedProjectId || initialProjectId;
    if (!finalProjectId) {
      setError(t("newTaskModal.errors.projectRequired"));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const url = editingTask ? `/api/tasks/${editingTask.id}` : "/api/tasks";
      const method = editingTask ? "PUT" : "POST";

      // Parse support resources from textarea (one per line)
      let parsedSupportResources: string[] = [];
      if (supportResources && typeof supportResources === "string") {
        parsedSupportResources = supportResources
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line.length > 0);
      }

      // Build recurrence object if recurring
      const recurrence = isRecurring ? {
        frequency: recurrenceFrequency,
        interval: recurrenceInterval,
        endDate: recurrenceEndDate || undefined,
      } : undefined;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId: finalProjectId,
          areaId: selectedAreaId || undefined,
          title: title.trim(),
          description: description.trim() || undefined,
          assigneeId: selectedAssigneeId || undefined,
          deadline: deadline || undefined,
          status,
          supportResources: parsedSupportResources.length > 0 ? parsedSupportResources : undefined,
          dependsOn: selectedDependencies.length > 0 ? selectedDependencies : undefined,
          isRecurring: isRecurring || undefined,
          recurrence,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || (editingTask ? t("newTaskModal.errors.updateFailed") : t("newTaskModal.errors.createFailed")));
      }

      // Reset form
      setTitle("");
      setDescription("");
      setSelectedAreaId(initialAreaId || null);
      setSelectedAssigneeId(null);
      setDeadline("");
      setStatus("pending");
      setSupportResources("");
      setSelectedDependencies([]);
      setIsRecurring(false);
      setRecurrenceFrequency("monthly");
      setRecurrenceInterval(1);
      setRecurrenceEndDate("");
      setProjectSearchQuery("");
      setAreaSearchQuery("");
      setAssigneeSearchQuery("");
      setDependenciesSearchQuery("");
      setIsProjectDropdownOpen(false);
      setIsAreaDropdownOpen(false);
      setIsAssigneeDropdownOpen(false);
      setIsDependenciesDropdownOpen(false);
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : (editingTask ? t("newTaskModal.errors.updateFailed") : t("newTaskModal.errors.createFailed"))
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setTitle("");
    setDescription("");
    setSelectedProjectId(initialProjectId || null);
    setSelectedAreaId(initialAreaId || null);
    setSelectedAssigneeId(null);
    setDeadline("");
    setStatus("pending");
    setSupportResources("");
    setSelectedDependencies([]);
    setIsRecurring(false);
    setRecurrenceFrequency("monthly");
    setRecurrenceInterval(1);
    setRecurrenceEndDate("");
    setProjectSearchQuery("");
    setAreaSearchQuery("");
    setAssigneeSearchQuery("");
    setDependenciesSearchQuery("");
    setIsProjectDropdownOpen(false);
    setIsAreaDropdownOpen(false);
    setIsAssigneeDropdownOpen(false);
    setIsDependenciesDropdownOpen(false);
    setError(null);
    onOpenChange(false);
  };

  const toggleDependency = (taskId: string) => {
    setSelectedDependencies((prev) => {
      if (prev.includes(taskId)) {
        return prev.filter((id) => id !== taskId);
      } else {
        return [...prev, taskId];
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? t("newTaskModal.editTitle") : t("newTaskModal.title")}</DialogTitle>
          <DialogDescription>
            {isEditMode ? t("newTaskModal.editDescription") : t("newTaskModal.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Project (required, auto-filled or dropdown) */}
          {!initialProjectId && projects.length > 0 ? (
            <div className="space-y-2">
              <Label>
                {t("newTaskModal.project")} <span className="text-destructive">*</span>
              </Label>
              <div className="relative" ref={projectDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
                  disabled={isSubmitting}
                  className={cn(
                    "w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-between",
                    !selectedProject && "text-muted-foreground"
                  )}
                >
                  <span className="truncate">
                    {selectedProject ? selectedProject.name : t("newTaskModal.projectPlaceholder")}
                  </span>
                  <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                </button>

                {isProjectDropdownOpen && (
                  <div className="absolute z-50 w-full mt-1 bg-popover border border-input rounded-md shadow-md max-h-[300px] overflow-hidden">
                    <div className="p-2 border-b">
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder={t("newTaskModal.searchProject")}
                          value={projectSearchQuery}
                          onChange={(e) => setProjectSearchQuery(e.target.value)}
                          className="pl-8 h-8"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="overflow-y-auto max-h-[240px]">
                      {filteredProjects.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-muted-foreground text-center">
                          {t("newTaskModal.noProjectsFound")}
                        </div>
                      ) : (
                        filteredProjects.map((project) => (
                          <button
                            key={project.id}
                            type="button"
                            onClick={() => {
                              setSelectedProjectId(project.id);
                              setIsProjectDropdownOpen(false);
                              setProjectSearchQuery("");
                              // Reset area when project changes
                              setSelectedAreaId(null);
                            }}
                            className={cn(
                              "w-full px-3 py-2 text-sm text-left hover:bg-accent hover:text-accent-foreground flex items-center gap-2",
                              selectedProjectId === project.id && "bg-accent"
                            )}
                          >
                            <div className="h-5 w-5 flex items-center justify-center">
                              {selectedProjectId === project.id && (
                                <Check className="h-4 w-4" />
                              )}
                            </div>
                            <span>{project.name}</span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : initialProjectId && projectName ? (
            <div className="space-y-2">
              <Label>{t("newTaskModal.project")}</Label>
              <Input
                value={projectName}
                disabled
                className="bg-muted"
              />
            </div>
          ) : null}

          {/* Area (optional, auto-filled or dropdown) */}
          <div className="space-y-2">
            <Label>{t("newTaskModal.area")}</Label>
            {initialAreaId && areaName ? (
              <Input
                value={areaName}
                disabled
                className="bg-muted"
              />
            ) : (
              <div className="relative" ref={areaDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsAreaDropdownOpen(!isAreaDropdownOpen)}
                  disabled={isSubmitting || !selectedProjectId}
                  className={cn(
                    "w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-between",
                    !selectedArea && "text-muted-foreground"
                  )}
                >
                  <span className="truncate">
                    {selectedArea ? selectedArea.name : t("newTaskModal.areaPlaceholder")}
                  </span>
                  <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                </button>

                {isAreaDropdownOpen && (
                  <div className="absolute z-50 w-full mt-1 bg-popover border border-input rounded-md shadow-md max-h-[300px] overflow-hidden">
                    <div className="p-2 border-b">
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder={t("newTaskModal.searchArea")}
                          value={areaSearchQuery}
                          onChange={(e) => setAreaSearchQuery(e.target.value)}
                          className="pl-8 h-8"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="overflow-y-auto max-h-[240px]">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedAreaId(null);
                          setIsAreaDropdownOpen(false);
                          setAreaSearchQuery("");
                        }}
                        className={cn(
                          "w-full px-3 py-2 text-sm text-left hover:bg-accent hover:text-accent-foreground flex items-center gap-2",
                          !selectedAreaId && "bg-accent"
                        )}
                      >
                        <div className="h-5 w-5 flex items-center justify-center">
                          {!selectedAreaId && (
                            <Check className="h-4 w-4" />
                          )}
                        </div>
                        <span className="text-muted-foreground">
                          {t("newTaskModal.noArea")}
                        </span>
                      </button>
                      {filteredAreasBySearch.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-muted-foreground text-center">
                          {t("newTaskModal.noAreasFound")}
                        </div>
                      ) : (
                        filteredAreasBySearch.map((area) => (
                          <button
                            key={area.id}
                            type="button"
                            onClick={() => {
                              setSelectedAreaId(area.id);
                              setIsAreaDropdownOpen(false);
                              setAreaSearchQuery("");
                            }}
                            className={cn(
                              "w-full px-3 py-2 text-sm text-left hover:bg-accent hover:text-accent-foreground flex items-center gap-2",
                              selectedAreaId === area.id && "bg-accent"
                            )}
                          >
                            <div className="h-5 w-5 flex items-center justify-center">
                              {selectedAreaId === area.id && (
                                <Check className="h-4 w-4" />
                              )}
                            </div>
                            <span>{area.name}</span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Title (required) */}
          <div className="space-y-2">
            <Label htmlFor="task-title">
              {t("newTaskModal.titleField")} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="task-title"
              placeholder={t("newTaskModal.titlePlaceholder")}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Description (optional) */}
          <div className="space-y-2">
            <Label htmlFor="task-description">
              {t("newTaskModal.descriptionField")}
            </Label>
            <Textarea
              id="task-description"
              placeholder={t("newTaskModal.descriptionPlaceholder")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              rows={3}
            />
          </div>

          {/* Task Dependencies */}
          {selectedProjectId && availableDependencyTasks.length > 0 && (
            <div className="space-y-2">
              <Label>{t("taskDependencies.blockingTasks")}</Label>
              <div className="relative" ref={dependenciesDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsDependenciesDropdownOpen(!isDependenciesDropdownOpen)}
                  disabled={isSubmitting}
                  className={cn(
                    "w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-between",
                    selectedDependencies.length === 0 && "text-muted-foreground"
                  )}
                >
                  <span className="truncate">
                    {selectedDependencies.length === 0
                      ? t("taskDependencies.selectBlocking")
                      : `${selectedDependencies.length} ${t("taskDependencies.blockingTasks").toLowerCase()}`}
                  </span>
                  <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                </button>

                {isDependenciesDropdownOpen && (
                  <div className="absolute z-50 w-full mt-1 bg-popover border border-input rounded-md shadow-md max-h-[300px] overflow-hidden">
                    <div className="p-2 border-b">
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder={t("taskDependencies.selectBlocking")}
                          value={dependenciesSearchQuery}
                          onChange={(e) => setDependenciesSearchQuery(e.target.value)}
                          className="pl-8 h-8"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="overflow-y-auto max-h-[240px]">
                      {filteredDependencyTasks.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-muted-foreground text-center">
                          {t("taskDependencies.noDependencies")}
                        </div>
                      ) : (
                        filteredDependencyTasks.map((task) => (
                          <button
                            key={task.id}
                            type="button"
                            onClick={() => toggleDependency(task.id)}
                            className={cn(
                              "w-full px-3 py-2 text-sm text-left hover:bg-accent hover:text-accent-foreground flex items-center gap-2",
                              selectedDependencies.includes(task.id) && "bg-accent"
                            )}
                          >
                            <div className="h-5 w-5 flex items-center justify-center">
                              {selectedDependencies.includes(task.id) && (
                                <Check className="h-4 w-4" />
                              )}
                            </div>
                            <span>{task.title}</span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              {selectedDependencies.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedDependencies.map((taskId) => {
                    const task = availableDependencyTasks.find((t) => t.id === taskId);
                    return task ? (
                      <Badge key={taskId} variant="secondary" className="text-xs">
                        {task.title}
                        <button
                          type="button"
                          onClick={() => toggleDependency(taskId)}
                          className="ml-1 hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          )}

          {/* Recurring Tasks */}
          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is-recurring"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                disabled={isSubmitting}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="is-recurring" className="font-normal cursor-pointer">
                {t("recurringTasks.makeRecurring")}
              </Label>
            </div>

            {isRecurring && (
              <div className="space-y-3 pl-6">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="recurrence-frequency">
                      {t("recurringTasks.frequency")}
                    </Label>
                    <select
                      id="recurrence-frequency"
                      value={recurrenceFrequency}
                      onChange={(e) => setRecurrenceFrequency(e.target.value as RecurrenceFrequency)}
                      disabled={isSubmitting}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="daily">{t("recurringTasks.daily")}</option>
                      <option value="weekly">{t("recurringTasks.weekly")}</option>
                      <option value="monthly">{t("recurringTasks.monthly")}</option>
                      <option value="quarterly">{t("recurringTasks.quarterly")}</option>
                      <option value="yearly">{t("recurringTasks.yearly")}</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="recurrence-interval">
                      {t("recurringTasks.interval")}
                    </Label>
                    <Input
                      id="recurrence-interval"
                      type="number"
                      min="1"
                      value={recurrenceInterval}
                      onChange={(e) => setRecurrenceInterval(parseInt(e.target.value) || 1)}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recurrence-end-date">
                    {t("recurringTasks.endDate")}
                  </Label>
                  <Input
                    id="recurrence-end-date"
                    type="date"
                    value={recurrenceEndDate}
                    onChange={(e) => setRecurrenceEndDate(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Assignee (optional) */}
          <div className="space-y-2">
            <Label>{t("newTaskModal.assignee")}</Label>
            <div className="relative" ref={assigneeDropdownRef}>
              <button
                type="button"
                onClick={() => setIsAssigneeDropdownOpen(!isAssigneeDropdownOpen)}
                disabled={isSubmitting}
                className={cn(
                  "w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-between",
                  !selectedAssignee && "text-muted-foreground"
                )}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {selectedAssignee ? (
                    <>
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="text-xs">
                          {selectedAssignee.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate">{selectedAssignee.name}</span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">
                      {t("newTaskModal.assigneePlaceholder")}
                    </span>
                  )}
                </div>
                <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
              </button>

              {isAssigneeDropdownOpen && (
                <div className="absolute z-50 w-full mt-1 bg-popover border border-input rounded-md shadow-md max-h-[300px] overflow-hidden">
                  <div className="p-2 border-b">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder={t("newTaskModal.searchAssignee")}
                        value={assigneeSearchQuery}
                        onChange={(e) => setAssigneeSearchQuery(e.target.value)}
                        className="pl-8 h-8"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="overflow-y-auto max-h-[240px]">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAssigneeId(null);
                        setIsAssigneeDropdownOpen(false);
                        setAssigneeSearchQuery("");
                      }}
                      className={cn(
                        "w-full px-3 py-2 text-sm text-left hover:bg-accent hover:text-accent-foreground flex items-center gap-2",
                        !selectedAssigneeId && "bg-accent"
                      )}
                    >
                      <div className="h-5 w-5 flex items-center justify-center">
                        {!selectedAssigneeId && (
                          <Check className="h-4 w-4" />
                        )}
                      </div>
                      <span className="text-muted-foreground">
                        {t("newTaskModal.noAssignee")}
                      </span>
                    </button>
                    {filteredUsers.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-muted-foreground text-center">
                        {t("newTaskModal.noUsersFound")}
                      </div>
                    ) : (
                      filteredUsers.map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => {
                            setSelectedAssigneeId(user.id);
                            setIsAssigneeDropdownOpen(false);
                            setAssigneeSearchQuery("");
                          }}
                          className={cn(
                            "w-full px-3 py-2 text-sm text-left hover:bg-accent hover:text-accent-foreground flex items-center gap-2",
                            selectedAssigneeId === user.id && "bg-accent"
                          )}
                        >
                          <div className="h-5 w-5 flex items-center justify-center">
                            {selectedAssigneeId === user.id && (
                              <Check className="h-4 w-4" />
                            )}
                          </div>
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {user.initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="truncate font-medium">{user.name}</div>
                            {user.email && (
                              <div className="truncate text-xs text-muted-foreground">
                                {user.email}
                              </div>
                            )}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Deadline (optional) */}
          <div className="space-y-2">
            <Label htmlFor="task-deadline">
              {t("newTaskModal.deadline")}
            </Label>
            <Input
              id="task-deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="task-status">
              {t("newTaskModal.status")}
            </Label>
            <select
              id="task-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
              disabled={isSubmitting}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="pending">{t("newTaskModal.statusPending")}</option>
              <option value="in_progress">{t("newTaskModal.statusInProgress")}</option>
              <option value="blocked">{t("newTaskModal.statusBlocked")}</option>
              <option value="completed">{t("newTaskModal.statusCompleted")}</option>
            </select>
          </div>

          {/* Support Resources (optional textarea) */}
          <div className="space-y-2">
            <Label htmlFor="task-support-resources">
              {t("newTaskModal.supportResources")}
            </Label>
            <Textarea
              id="task-support-resources"
              placeholder={t("newTaskModal.supportResourcesPlaceholder")}
              value={supportResources}
              onChange={(e) => setSupportResources(e.target.value)}
              disabled={isSubmitting}
              rows={3}
            />
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-2 rounded-md">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isSubmitting}>
            {t("newTaskModal.cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !title.trim()}>
            {isSubmitting
              ? (isEditMode ? t("newTaskModal.updating") : t("newTaskModal.creating"))
              : (isEditMode ? t("newTaskModal.update") : t("newTaskModal.create"))}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

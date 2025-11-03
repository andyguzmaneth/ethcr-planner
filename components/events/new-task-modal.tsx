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
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Task } from "@/lib/types";

interface User {
  id: string;
  name: string;
  initials: string;
  email?: string;
}

interface Area {
  id: string;
  name: string;
  eventId?: string; // Optional for filtering when event is selected
}

interface Event {
  id: string;
  name: string;
}

interface NewTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task; // Optional task for edit mode
  eventId?: string; // Auto-filled from URL
  areaId?: string; // Auto-filled from URL
  eventName?: string; // For display
  areaName?: string; // For display
  events?: Event[]; // For dropdown when eventId is not provided
  areas?: Area[]; // Areas for the event (filtered by eventId if provided)
  users: User[];
  onSuccess?: () => void;
}

export function NewTaskModal({
  open,
  onOpenChange,
  task: editingTask,
  eventId: initialEventId,
  areaId: initialAreaId,
  eventName,
  areaName,
  events = [],
  areas = [],
  users,
  onSuccess,
}: NewTaskModalProps) {
  const { t } = useTranslation();
  const isEditMode = !!editingTask;
  
  // Initialize form with task data if editing
  const [title, setTitle] = useState(editingTask?.title || "");
  const [description, setDescription] = useState(editingTask?.description || "");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(editingTask?.eventId || initialEventId || null);
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(editingTask?.areaId || initialAreaId || null);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string | null>(editingTask?.assigneeId || null);
  const [deadline, setDeadline] = useState(editingTask?.deadline ? editingTask.deadline.split("T")[0] : "");
  const [status, setStatus] = useState<"pending" | "in_progress" | "blocked" | "completed">(editingTask?.status || "pending");
  const [supportResources, setSupportResources] = useState(editingTask?.supportResources?.join("\n") || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isEventDropdownOpen, setIsEventDropdownOpen] = useState(false);
  const [isAreaDropdownOpen, setIsAreaDropdownOpen] = useState(false);
  const [isAssigneeDropdownOpen, setIsAssigneeDropdownOpen] = useState(false);
  const [eventSearchQuery, setEventSearchQuery] = useState("");
  const [areaSearchQuery, setAreaSearchQuery] = useState("");
  const [assigneeSearchQuery, setAssigneeSearchQuery] = useState("");
  
  const eventDropdownRef = useRef<HTMLDivElement>(null);
  const areaDropdownRef = useRef<HTMLDivElement>(null);
  const assigneeDropdownRef = useRef<HTMLDivElement>(null);

  // Filter areas based on selected event
  const filteredAreas = useMemo(() => {
    if (!selectedEventId) return [];
    // If areas have eventId, filter by it. Otherwise, assume they're already filtered by parent.
    return areas.filter((area) => {
      if (area.eventId) {
        return area.eventId === selectedEventId;
      }
      // If no eventId in area, assume parent already filtered them
      return true;
    });
  }, [areas, selectedEventId]);

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

  // Filter events
  const filteredEvents = useMemo(() => {
    if (!eventSearchQuery) return events;
    const query = eventSearchQuery.toLowerCase();
    return events.filter(
      (event) =>
        event.name.toLowerCase().includes(query) ||
        event.id.toLowerCase().includes(query)
    );
  }, [events, eventSearchQuery]);

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

  const selectedEvent = events.find((e) => e.id === selectedEventId) || 
    (initialEventId && eventName ? { id: initialEventId, name: eventName } : null);
  const selectedArea = filteredAreas.find((a) => a.id === selectedAreaId) ||
    (initialAreaId && areaName ? { id: initialAreaId, name: areaName } : null);
  const selectedAssignee = users.find((u) => u.id === selectedAssigneeId) || null;

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (eventDropdownRef.current && !eventDropdownRef.current.contains(event.target as Node)) {
        setIsEventDropdownOpen(false);
      }
      if (areaDropdownRef.current && !areaDropdownRef.current.contains(event.target as Node)) {
        setIsAreaDropdownOpen(false);
      }
      if (assigneeDropdownRef.current && !assigneeDropdownRef.current.contains(event.target as Node)) {
        setIsAssigneeDropdownOpen(false);
      }
    }

    if (isEventDropdownOpen || isAreaDropdownOpen || isAssigneeDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isEventDropdownOpen, isAreaDropdownOpen, isAssigneeDropdownOpen]);

  // Update selectedEventId when initialEventId changes
  useEffect(() => {
    if (initialEventId) {
      setSelectedEventId(initialEventId);
    }
  }, [initialEventId]);

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
      setSelectedEventId(editingTask.eventId);
      setSelectedAreaId(editingTask.areaId || initialAreaId || null);
      setSelectedAssigneeId(editingTask.assigneeId || null);
      setDeadline(editingTask.deadline ? editingTask.deadline.split("T")[0] : "");
      setStatus(editingTask.status || "pending");
      setSupportResources(editingTask.supportResources?.join("\n") || "");
      setError(null);
    } else if (open && !editingTask) {
      // Reset to defaults when creating new task
      setTitle("");
      setDescription("");
      setSelectedEventId(initialEventId || null);
      setSelectedAreaId(initialAreaId || null);
      setSelectedAssigneeId(null);
      setDeadline("");
      setStatus("pending");
      setSupportResources("");
      setError(null);
    }
  }, [open, editingTask, initialEventId, initialAreaId]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError(t("newTaskModal.errors.titleRequired"));
      return;
    }

    const finalEventId = selectedEventId || initialEventId;
    if (!finalEventId) {
      setError(t("newTaskModal.errors.eventRequired"));
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

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId: finalEventId,
          areaId: selectedAreaId || undefined,
          title: title.trim(),
          description: description.trim() || undefined,
          assigneeId: selectedAssigneeId || undefined,
          deadline: deadline || undefined,
          status,
          supportResources: parsedSupportResources.length > 0 ? parsedSupportResources : undefined,
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
      setEventSearchQuery("");
      setAreaSearchQuery("");
      setAssigneeSearchQuery("");
      setIsEventDropdownOpen(false);
      setIsAreaDropdownOpen(false);
      setIsAssigneeDropdownOpen(false);
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
    setSelectedEventId(initialEventId || null);
    setSelectedAreaId(initialAreaId || null);
    setSelectedAssigneeId(null);
    setDeadline("");
    setStatus("pending");
    setSupportResources("");
    setEventSearchQuery("");
    setAreaSearchQuery("");
    setAssigneeSearchQuery("");
    setIsEventDropdownOpen(false);
    setIsAreaDropdownOpen(false);
    setIsAssigneeDropdownOpen(false);
    setError(null);
    onOpenChange(false);
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
          {/* Event (required, auto-filled or dropdown) */}
          {!initialEventId && events.length > 0 ? (
            <div className="space-y-2">
              <Label>
                {t("newTaskModal.event")} <span className="text-destructive">*</span>
              </Label>
              <div className="relative" ref={eventDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsEventDropdownOpen(!isEventDropdownOpen)}
                  disabled={isSubmitting}
                  className={cn(
                    "w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-between",
                    !selectedEvent && "text-muted-foreground"
                  )}
                >
                  <span className="truncate">
                    {selectedEvent ? selectedEvent.name : t("newTaskModal.eventPlaceholder")}
                  </span>
                  <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                </button>

                {isEventDropdownOpen && (
                  <div className="absolute z-50 w-full mt-1 bg-popover border border-input rounded-md shadow-md max-h-[300px] overflow-hidden">
                    <div className="p-2 border-b">
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder={t("newTaskModal.searchEvent")}
                          value={eventSearchQuery}
                          onChange={(e) => setEventSearchQuery(e.target.value)}
                          className="pl-8 h-8"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="overflow-y-auto max-h-[240px]">
                      {filteredEvents.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-muted-foreground text-center">
                          {t("newTaskModal.noEventsFound")}
                        </div>
                      ) : (
                        filteredEvents.map((event) => (
                          <button
                            key={event.id}
                            type="button"
                            onClick={() => {
                              setSelectedEventId(event.id);
                              setIsEventDropdownOpen(false);
                              setEventSearchQuery("");
                              // Reset area when event changes
                              setSelectedAreaId(null);
                            }}
                            className={cn(
                              "w-full px-3 py-2 text-sm text-left hover:bg-accent hover:text-accent-foreground flex items-center gap-2",
                              selectedEventId === event.id && "bg-accent"
                            )}
                          >
                            <div className="h-5 w-5 flex items-center justify-center">
                              {selectedEventId === event.id && (
                                <Check className="h-4 w-4" />
                              )}
                            </div>
                            <span>{event.name}</span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : initialEventId && eventName ? (
            <div className="space-y-2">
              <Label>{t("newTaskModal.event")}</Label>
              <Input
                value={eventName}
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
                  disabled={isSubmitting || !selectedEventId}
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


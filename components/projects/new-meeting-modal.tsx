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
import { useTranslation } from "@/lib/i18n/useTranslation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronsUpDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Meeting } from "@/lib/types";

interface User {
  id: string;
  name: string;
  initials: string;
  email?: string;
}

interface NewMeetingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meeting?: Meeting;
  projectId: string;
  projectName?: string;
  users: User[];
  onSuccess?: () => void;
}

export function NewMeetingModal({
  open,
  onOpenChange,
  meeting: editingMeeting,
  projectId,
  projectName,
  users,
  onSuccess,
}: NewMeetingModalProps) {
  const { t } = useTranslation();
  const isEditMode = !!editingMeeting;

  // Initialize form with meeting data if editing
  const [title, setTitle] = useState(editingMeeting?.title || "");
  const [date, setDate] = useState(
    editingMeeting?.date ? editingMeeting.date.split("T")[0] : ""
  );
  const [time, setTime] = useState(editingMeeting?.time || "");
  const [selectedAttendeeIds, setSelectedAttendeeIds] = useState<string[]>(
    editingMeeting?.attendeeIds || []
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isAttendeesDropdownOpen, setIsAttendeesDropdownOpen] = useState(false);
  const [attendeesSearchQuery, setAttendeesSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Reset form when modal opens/closes or meeting changes
  useEffect(() => {
    if (open && editingMeeting) {
      setTitle(editingMeeting.title || "");
      setDate(editingMeeting.date ? editingMeeting.date.split("T")[0] : "");
      setTime(editingMeeting.time || "");
      setSelectedAttendeeIds(editingMeeting.attendeeIds || []);
      setError(null);
    } else if (open && !editingMeeting) {
      // Reset to defaults when creating new meeting
      setTitle("");
      setDate("");
      setTime("");
      setSelectedAttendeeIds([]);
      setError(null);
    }
    setAttendeesSearchQuery("");
    setIsAttendeesDropdownOpen(false);
  }, [open, editingMeeting]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsAttendeesDropdownOpen(false);
      }
    }

    if (isAttendeesDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isAttendeesDropdownOpen]);

  const filteredUsers = useMemo(() => {
    if (!attendeesSearchQuery) return users;
    const query = attendeesSearchQuery.toLowerCase();
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.id.toLowerCase().includes(query)
    );
  }, [users, attendeesSearchQuery]);

  const selectedAttendees = useMemo(() => {
    return users.filter((u) => selectedAttendeeIds.includes(u.id));
  }, [users, selectedAttendeeIds]);

  const toggleAttendee = (userId: string) => {
    setSelectedAttendeeIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const removeAttendee = (userId: string) => {
    setSelectedAttendeeIds((prev) => prev.filter((id) => id !== userId));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("Meeting title is required");
      return;
    }

    if (!date) {
      setError("Meeting date is required");
      return;
    }

    if (!time) {
      setError("Meeting time is required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const url = editingMeeting
        ? `/api/meetings/${editingMeeting.id}`
        : "/api/meetings";
      const method = editingMeeting ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId,
          title: title.trim(),
          date: date,
          time: time,
          attendeeIds: selectedAttendeeIds,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(
          data.error ||
            (editingMeeting
              ? "Failed to update meeting"
              : "Failed to create meeting")
        );
      }

      // Reset form
      setTitle("");
      setDate("");
      setTime("");
      setSelectedAttendeeIds([]);
      setAttendeesSearchQuery("");
      setIsAttendeesDropdownOpen(false);
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : editingMeeting
            ? "Failed to update meeting"
            : "Failed to create meeting"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setTitle("");
    setDate("");
    setTime("");
    setSelectedAttendeeIds([]);
    setAttendeesSearchQuery("");
    setIsAttendeesDropdownOpen(false);
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Meeting" : "Create Meeting"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the meeting details below."
              : `Create a new meeting for ${projectName || "this project"}.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Meeting title"
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time *</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          {/* Attendees */}
          <div className="space-y-2">
            <Label>Attendees</Label>
            <div className="space-y-2">
              {/* Selected Attendees */}
              {selectedAttendees.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedAttendees.map((attendee) => (
                    <Badge
                      key={attendee.id}
                      variant="secondary"
                      className="flex items-center gap-1 pr-1"
                    >
                      <Avatar className="h-4 w-4">
                        <AvatarFallback className="text-xs">
                          {attendee.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs">{attendee.name}</span>
                      <button
                        type="button"
                        onClick={() => removeAttendee(attendee.id)}
                        className="ml-1 rounded-full hover:bg-secondary-foreground/20"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Attendees Dropdown */}
              <div ref={dropdownRef} className="relative">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => setIsAttendeesDropdownOpen(!isAttendeesDropdownOpen)}
                >
                  <span className="text-muted-foreground">
                    {selectedAttendees.length > 0
                      ? `${selectedAttendees.length} attendee(s) selected`
                      : "Select attendees"}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
                {isAttendeesDropdownOpen && (
                  <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-1 shadow-md">
                    <div className="flex items-center border-b px-3">
                      <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                      <Input
                        placeholder="Search users..."
                        value={attendeesSearchQuery}
                        onChange={(e) => setAttendeesSearchQuery(e.target.value)}
                        className="h-9 border-0 focus-ring-0"
                      />
                    </div>
                    <div className="max-h-60 overflow-auto">
                      {filteredUsers.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                          No users found
                        </div>
                      ) : (
                        filteredUsers.map((user) => {
                          const isSelected = selectedAttendeeIds.includes(
                            user.id
                          );
                          return (
                            <button
                              key={user.id}
                              type="button"
                              className={cn(
                                "relative flex w-full cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                                isSelected && "bg-accent"
                              )}
                              onClick={() => toggleAttendee(user.id)}
                            >
                              <div className="flex items-center gap-2 flex-1">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="text-xs">
                                    {user.initials}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                  <span>{user.name}</span>
                                  {user.email && (
                                    <span className="text-xs text-muted-foreground">
                                      {user.email}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {isSelected && (
                                <Check className="h-4 w-4 text-primary" />
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting
              ? isEditMode
                ? "Updating..."
                : "Creating..."
              : isEditMode
                ? "Update Meeting"
                : "Create Meeting"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


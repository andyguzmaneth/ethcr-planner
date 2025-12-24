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
import { Area } from "@/lib/types";

interface User {
  id: string;
  name: string;
  initials: string;
  email?: string;
}

interface NewAreaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  area?: Area; // Optional area for edit mode
  projectId: string;
  users: User[];
  onSuccess?: () => void;
}

export function NewAreaModal({
  open,
  onOpenChange,
  area: editingArea,
  projectId,
  users,
  onSuccess,
}: NewAreaModalProps) {
  const { t } = useTranslation();
  const isEditMode = !!editingArea;
  
  // Initialize form with area data if editing
  const [areaName, setAreaName] = useState(editingArea?.name || "");
  const [description, setDescription] = useState(editingArea?.description || "");
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(editingArea?.leadId || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLeadDropdownOpen, setIsLeadDropdownOpen] = useState(false);
  const [leadSearchQuery, setLeadSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Reset form when modal opens/closes or editing area changes
  useEffect(() => {
    if (open) {
      if (editingArea) {
        setAreaName(editingArea.name);
        setDescription(editingArea.description || "");
        setSelectedLeadId(editingArea.leadId || null);
      } else {
        setAreaName("");
        setDescription("");
        setSelectedLeadId(null);
      }
      setLeadSearchQuery("");
      setIsLeadDropdownOpen(false);
      setError(null);
    }
  }, [open, editingArea]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsLeadDropdownOpen(false);
      }
    }

    if (isLeadDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isLeadDropdownOpen]);

  const filteredUsers = useMemo(() => {
    if (!leadSearchQuery) return users;
    const query = leadSearchQuery.toLowerCase();
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.id.toLowerCase().includes(query)
    );
  }, [users, leadSearchQuery]);

  const selectedLead = users.find((u) => u.id === selectedLeadId) || null;

  const handleSubmit = async () => {
    if (!areaName.trim()) {
      setError(t("newAreaModal.errors.nameRequired"));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const url = isEditMode
        ? `/api/areas/${editingArea.id}`
        : "/api/areas";
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId: isEditMode ? (editingArea.projectId || editingArea.eventId || "") : projectId,
          name: areaName.trim(),
          description: description.trim() || undefined,
          leadId: selectedLeadId || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(
          data.error ||
            (isEditMode
              ? t("newAreaModal.errors.updateFailed")
              : t("newAreaModal.errors.createFailed"))
        );
      }

      // Reset form
      setAreaName("");
      setDescription("");
      setSelectedLeadId(null);
      setLeadSearchQuery("");
      setIsLeadDropdownOpen(false);
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : isEditMode
            ? t("newAreaModal.errors.updateFailed")
            : t("newAreaModal.errors.createFailed")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setAreaName("");
    setDescription("");
    setSelectedLeadId(null);
    setLeadSearchQuery("");
    setIsLeadDropdownOpen(false);
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? t("newAreaModal.editTitle") : t("newAreaModal.title")}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? t("newAreaModal.editDescription")
              : t("newAreaModal.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Area Name */}
          <div className="space-y-2">
            <Label htmlFor="area-name">
              {t("newAreaModal.areaName")} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="area-name"
              placeholder={t("newAreaModal.areaNamePlaceholder")}
              value={areaName}
              onChange={(e) => setAreaName(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="area-description">
              {t("newAreaModal.description")}
            </Label>
            <Textarea
              id="area-description"
              placeholder={t("newAreaModal.descriptionPlaceholder")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              rows={3}
            />
          </div>

          {/* Lead Selector */}
          <div className="space-y-2">
            <Label>{t("newAreaModal.lead")}</Label>
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsLeadDropdownOpen(!isLeadDropdownOpen)}
                disabled={isSubmitting}
                className={cn(
                  "w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-between",
                  !selectedLead && "text-muted-foreground"
                )}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {selectedLead ? (
                    <>
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="text-xs">
                          {selectedLead.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate">{selectedLead.name}</span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">
                      {t("newAreaModal.leadPlaceholder")}
                    </span>
                  )}
                </div>
                <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
              </button>

              {isLeadDropdownOpen && (
                <div className="absolute z-50 w-full mt-1 bg-popover border border-input rounded-md shadow-md max-h-[300px] overflow-hidden">
                  <div className="p-2 border-b">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder={t("newAreaModal.searchLead")}
                        value={leadSearchQuery}
                        onChange={(e) => setLeadSearchQuery(e.target.value)}
                        className="pl-8 h-8"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="overflow-y-auto max-h-[240px]">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedLeadId(null);
                        setIsLeadDropdownOpen(false);
                        setLeadSearchQuery("");
                      }}
                      className={cn(
                        "w-full px-3 py-2 text-sm text-left hover:bg-accent hover:text-accent-foreground flex items-center gap-2",
                        !selectedLeadId && "bg-accent"
                      )}
                    >
                      <div className="h-5 w-5 flex items-center justify-center">
                        {!selectedLeadId && (
                          <Check className="h-4 w-4" />
                        )}
                      </div>
                      <span className="text-muted-foreground">
                        {t("newAreaModal.noLead")}
                      </span>
                    </button>
                    {filteredUsers.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-muted-foreground text-center">
                        {t("newAreaModal.noUsersFound")}
                      </div>
                    ) : (
                      filteredUsers.map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => {
                            setSelectedLeadId(user.id);
                            setIsLeadDropdownOpen(false);
                            setLeadSearchQuery("");
                          }}
                          className={cn(
                            "w-full px-3 py-2 text-sm text-left hover:bg-accent hover:text-accent-foreground flex items-center gap-2",
                            selectedLeadId === user.id && "bg-accent"
                          )}
                        >
                          <div className="h-5 w-5 flex items-center justify-center">
                            {selectedLeadId === user.id && (
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

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-2 rounded-md">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isSubmitting}>
            {t("newAreaModal.cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !areaName.trim()}>
            {isSubmitting
              ? isEditMode
                ? t("newAreaModal.updating")
                : t("newAreaModal.creating")
              : isEditMode
                ? t("newAreaModal.update")
                : t("newAreaModal.create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { RefObject } from "react";
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
import { ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Project, ProjectType, ProjectStatus } from "@/lib/types";

interface EditProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
  onSuccess?: () => void;
}

const formatDate = (date?: string) => (date ? date.split("T")[0] : "");

export function EditProjectModal({
  open,
  onOpenChange,
  project,
  onSuccess,
}: EditProjectModalProps) {
  const { t } = useTranslation();

  const [name, setName] = useState(project.name || "");
  const [type, setType] = useState<ProjectType>(project.type);
  const [status, setStatus] = useState<ProjectStatus>(project.status);
  const [description, setDescription] = useState(project.description || "");
  const [startDate, setStartDate] = useState(formatDate(project.startDate));
  const [endDate, setEndDate] = useState(formatDate(project.endDate));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const typeDropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  const resetForm = useCallback(() => {
    setName(project.name || "");
    setType(project.type);
    setStatus(project.status);
    setDescription(project.description || "");
    setStartDate(formatDate(project.startDate));
    setEndDate(formatDate(project.endDate));
    setError(null);
    setIsTypeDropdownOpen(false);
    setIsStatusDropdownOpen(false);
  }, [project]);

  // Reset form when modal opens or project changes
  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open, resetForm]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        typeDropdownRef.current &&
        !typeDropdownRef.current.contains(event.target as Node)
      ) {
        setIsTypeDropdownOpen(false);
      }
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(event.target as Node)
      ) {
        setIsStatusDropdownOpen(false);
      }
    }

    if (isTypeDropdownOpen || isStatusDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isTypeDropdownOpen, isStatusDropdownOpen]);

  const projectTypes: { value: ProjectType; label: string }[] = [
    { value: "Conference", label: t("projectTypes.event") },
    { value: "Meetup", label: t("projectTypes.meetup") },
    { value: "Property", label: t("projectTypes.property") },
    { value: "Custom", label: t("projectTypes.custom") },
  ];

  const projectStatuses: { value: ProjectStatus; label: string }[] = [
    { value: "In Planning", label: "In Planning" },
    { value: "Active", label: "Active" },
    { value: "Completed", label: "Completed" },
    { value: "Cancelled", label: "Cancelled" },
  ];

  const renderDropdown = <T extends string>(
    value: T,
    options: { value: T; label: string }[],
    onChange: (value: T) => void,
    isOpen: boolean,
    onToggle: (open: boolean) => void,
    dropdownRef: RefObject<HTMLDivElement | null>,
    label: string
  ) => {
    return (
    <div className="space-y-2">
      <Label>
        {label} <span className="text-destructive">*</span>
      </Label>
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => onToggle(!isOpen)}
          disabled={isSubmitting}
          className={cn(
            "w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-between"
          )}
        >
          <span>
            {options.find((opt) => opt.value === value)?.label || value}
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-popover border border-input rounded-md shadow-md">
            <div className="overflow-y-auto max-h-[200px]">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    onToggle(false);
                  }}
                  className={cn(
                    "w-full px-3 py-2 text-sm text-left hover:bg-accent hover:text-accent-foreground flex items-center gap-2",
                    value === option.value && "bg-accent"
                  )}
                >
                  <div className="h-5 w-5 flex items-center justify-center">
                    {value === option.value && (
                      <Check className="h-4 w-4" />
                    )}
                  </div>
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
    );
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError(t("editProjectModal.errors.nameRequired"));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          type,
          status,
          description: description.trim() || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || t("editProjectModal.errors.updateFailed"));
      }

      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t("editProjectModal.errors.updateFailed")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("editProjectModal.title")}</DialogTitle>
          <DialogDescription>
            {t("editProjectModal.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Project Name */}
          <div className="space-y-2">
            <Label htmlFor="project-name">
              {t("editProjectModal.name")} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="project-name"
              placeholder={t("editProjectModal.namePlaceholder")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Project Type */}
          {renderDropdown(
            type,
            projectTypes,
            setType,
            isTypeDropdownOpen,
            setIsTypeDropdownOpen,
            typeDropdownRef,
            t("editProjectModal.type")
          )}

          {/* Project Status */}
          {renderDropdown(
            status,
            projectStatuses,
            setStatus,
            isStatusDropdownOpen,
            setIsStatusDropdownOpen,
            statusDropdownRef,
            t("editProjectModal.status")
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="project-description">
              {t("editProjectModal.descriptionLabel")}
            </Label>
            <Textarea
              id="project-description"
              placeholder={t("editProjectModal.descriptionPlaceholder")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              rows={3}
            />
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <Label htmlFor="project-start-date">
              {t("editProjectModal.startDate")}
            </Label>
            <Input
              id="project-start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <Label htmlFor="project-end-date">
              {t("editProjectModal.endDate")}
            </Label>
            <Input
              id="project-end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={isSubmitting}
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
            {t("editProjectModal.cancel")}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !name.trim()}>
            {isSubmitting
              ? t("editProjectModal.updating")
              : t("editProjectModal.update")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


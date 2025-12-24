"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TemplateOption } from "./template-option";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { cn } from "@/lib/utils";
import type { ProjectType, ProjectTemplate } from "@/lib/types";

interface NewProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinue: (projectType: ProjectType, templateId?: string) => void;
  templates?: ProjectTemplate[];
}

export function NewProjectModal({
  open,
  onOpenChange,
  onContinue,
  templates = [],
}: NewProjectModalProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedProjectType, setSelectedProjectType] = useState<ProjectType | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  // Filter templates by selected project type
  const filteredTemplates = useMemo(() => {
    if (!selectedProjectType) return [];
    return templates.filter((t) => t.projectType === selectedProjectType);
  }, [templates, selectedProjectType]);

  const handleProjectTypeSelect = (type: ProjectType) => {
    setSelectedProjectType(type);
    setStep(2);
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
  };

  const handleContinue = () => {
    if (selectedProjectType) {
      onContinue(selectedProjectType, selectedTemplateId || undefined);
      onOpenChange(false);
      resetForm();
    }
  };

  const handleBack = () => {
    setStep(1);
    setSelectedTemplateId(null);
  };

  const handleCancel = () => {
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setStep(1);
    setSelectedProjectType(null);
    setSelectedTemplateId(null);
  };

  // Reset form when modal closes
  if (!open && (step !== 1 || selectedProjectType !== null)) {
    resetForm();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {step === 1
              ? t("newProjectModal.title")
              : t("newProjectModal.selectTemplate")}
          </DialogTitle>
          <DialogDescription>
            {step === 1
              ? t("newProjectModal.description")
              : t("newProjectModal.templateDescription")}
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <div className="grid grid-cols-2 gap-4 py-4">
            <TemplateOption
              title={t("projectTypes.event")}
              description={t("projectTypes.eventDescription")}
              isSelected={selectedProjectType === "Conference"}
              onClick={() => handleProjectTypeSelect("Conference")}
            />
            <TemplateOption
              title={t("projectTypes.meetup")}
              description={t("projectTypes.meetupDescription")}
              isSelected={selectedProjectType === "Meetup"}
              onClick={() => handleProjectTypeSelect("Meetup")}
            />
            <TemplateOption
              title={t("projectTypes.property")}
              description={t("projectTypes.propertyDescription")}
              isSelected={selectedProjectType === "Property"}
              onClick={() => handleProjectTypeSelect("Property")}
            />
            <TemplateOption
              title={t("projectTypes.custom")}
              description={t("projectTypes.customDescription")}
              isSelected={selectedProjectType === "Custom"}
              onClick={() => handleProjectTypeSelect("Custom")}
            />
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {filteredTemplates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {t("newProjectModal.noTemplatesAvailable")}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredTemplates.map((template) => (
                  <TemplateOption
                    key={template.id}
                    title={template.name}
                    description={template.description || ""}
                    isSelected={selectedTemplateId === template.id}
                    onClick={() => handleTemplateSelect(template.id)}
                  />
                ))}
              </div>
            )}
            <div className="pt-2">
              <Button
                variant="ghost"
                onClick={() => {
                  // Allow creating without template
                  setSelectedTemplateId(null);
                }}
                className={cn(
                  "w-full",
                  selectedTemplateId === null && "bg-accent"
                )}
              >
                {t("newProjectModal.startFromScratch")}
              </Button>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={step === 1 ? handleCancel : handleBack}>
            {step === 1 ? t("newProjectModal.cancel") : t("common.back")}
          </Button>
          {step === 2 && (
            <Button
              onClick={handleContinue}
              disabled={!selectedProjectType}
            >
              {t("newProjectModal.continue")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


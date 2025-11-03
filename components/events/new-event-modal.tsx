"use client";

import { useState } from "react";
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

interface NewEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinue: (template: "meetup" | "eth-pura-vida") => void;
}

export function NewEventModal({
  open,
  onOpenChange,
  onContinue,
}: NewEventModalProps) {
  const { t } = useTranslation();
  const [selectedTemplate, setSelectedTemplate] = useState<
    "meetup" | "eth-pura-vida" | null
  >(null);

  const handleContinue = () => {
    if (selectedTemplate) {
      onContinue(selectedTemplate);
      onOpenChange(false);
      setSelectedTemplate(null);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setSelectedTemplate(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t("newEventModal.title")}</DialogTitle>
          <DialogDescription>
            {t("newEventModal.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          <TemplateOption
            title={t("newEventModal.meetupTemplate")}
            description={t("newEventModal.meetupDescription")}
            isSelected={selectedTemplate === "meetup"}
            onClick={() => setSelectedTemplate("meetup")}
          />
          <TemplateOption
            title={t("newEventModal.ethPuraVidaTemplate")}
            description={t("newEventModal.ethPuraVidaDescription")}
            isSelected={selectedTemplate === "eth-pura-vida"}
            onClick={() => setSelectedTemplate("eth-pura-vida")}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            {t("newEventModal.cancel")}
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!selectedTemplate}
          >
            {t("newEventModal.continue")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


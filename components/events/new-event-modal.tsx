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
          <DialogTitle>Crear Nuevo Evento</DialogTitle>
          <DialogDescription>
            Selecciona una plantilla para comenzar. Podrás personalizar el evento
            después de crearlo.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          <TemplateOption
            title="Plantilla de Meetups"
            description="Ideal para eventos regulares de la comunidad. Incluye tracks básicos como Venue, Speakers, Marketing y más."
            isSelected={selectedTemplate === "meetup"}
            onClick={() => setSelectedTemplate("meetup")}
          />
          <TemplateOption
            title="Plantilla de ETH Pura Vida"
            description="Estructura completa para conferencias grandes. Incluye todos los tracks necesarios para eventos de mayor escala."
            isSelected={selectedTemplate === "eth-pura-vida"}
            onClick={() => setSelectedTemplate("eth-pura-vida")}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!selectedTemplate}
          >
            Continuar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


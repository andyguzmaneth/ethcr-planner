"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { AlertTriangle } from "lucide-react";

interface DeleteAreaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  areaName: string;
  taskCount: number;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export function DeleteAreaDialog({
  open,
  onOpenChange,
  areaName,
  taskCount,
  onConfirm,
  isDeleting = false,
}: DeleteAreaDialogProps) {
  const { t } = useTranslation();

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div className="flex-1">
              <DialogTitle>{t("deleteArea.title")}</DialogTitle>
              <DialogDescription className="mt-2">
                {taskCount > 0 ? (
                  <span>
                    {t("deleteArea.descriptionWithTasks", { areaName, taskCount })}
                  </span>
                ) : (
                  <span>
                    {t("deleteArea.description", { areaName })}
                  </span>
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            {t("common.cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? t("deleteArea.deleting") : t("common.delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


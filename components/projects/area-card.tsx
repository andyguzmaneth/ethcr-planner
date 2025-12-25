"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Edit, Trash2, GripVertical } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface AreaCardLead {
  id: string;
  name: string;
  initials?: string;
}

interface AreaCardProps {
  area: {
    id: string;
    name: string;
    taskCount: number;
    completed: number;
    lead?: AreaCardLead | null;
    leadName?: string | null;
  };
  projectSlug: string;
  onEditClick: (e: React.MouseEvent) => void;
  onDeleteClick: (e: React.MouseEvent) => void;
  isDragging?: boolean;
  dragHandleProps?: {
    attributes: Record<string, unknown>;
    listeners: Record<string, unknown>;
  };
  cardRef?: (node: HTMLElement | null) => void;
  cardStyle?: React.CSSProperties;
}

export function AreaCard({
  area,
  projectSlug,
  onEditClick,
  onDeleteClick,
  isDragging = false,
  dragHandleProps,
  cardRef,
  cardStyle,
}: AreaCardProps) {
  const router = useRouter();
  const { t } = useTranslation();

  const progress = area.taskCount > 0
    ? Math.round((area.completed / area.taskCount) * 100)
    : 0;

  const leadName = area.lead?.name || area.leadName || null;

  const handleCardClick = () => {
    if (!isDragging) {
      router.push(`/projects/${projectSlug}/areas/${area.id}`);
    }
  };

  return (
    <Card
      ref={cardRef}
      style={cardStyle}
      onClick={handleCardClick}
      className="hover:shadow-lg transition-shadow cursor-pointer h-full group relative"
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 flex-1">
            {dragHandleProps && (
              <button
                {...dragHandleProps.attributes}
                {...dragHandleProps.listeners}
                className="mt-1 cursor-grab active:cursor-grabbing touch-none"
                onClick={(e) => e.stopPropagation()}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
            <div className="flex-1">
              <CardTitle className="text-lg">{area.name}</CardTitle>
              <CardDescription>
                {t("projectDetail.leader")}: {leadName || t("projectDetail.unassigned")}
              </CardDescription>
            </div>
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
              <DropdownMenuItem onClick={onEditClick}>
                <Edit className="mr-2 h-4 w-4" />
                {t("common.edit")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={onDeleteClick}>
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
              {area.completed}/{area.taskCount} {t("projects.tasks")}
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{t("projects.progress")}</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


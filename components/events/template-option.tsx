"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TemplateOptionProps {
  title: string;
  description: string;
  isSelected: boolean;
  onClick: () => void;
}

export function TemplateOption({
  title,
  description,
  isSelected,
  onClick,
}: TemplateOptionProps) {
  return (
    <Card
      onClick={onClick}
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        isSelected
          ? "ring-2 ring-primary border-primary"
          : "hover:border-primary/50"
      )}
    >
      <CardContent className="p-6">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}


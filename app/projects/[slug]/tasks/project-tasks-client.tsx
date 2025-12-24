"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { NewTaskModal } from "@/components/projects/new-task-modal";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface ProjectTasksClientProps {
  projectId: string;
  projectName: string;
  areaId?: string;
  areaName?: string;
  areas: Array<{ id: string; name: string }>;
  users: Array<{ id: string; name: string; initials: string; email?: string }>;
}

export function ProjectTasksClient({
  projectId,
  projectName,
  areaId,
  areaName,
  areas,
  users,
}: ProjectTasksClientProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleTaskCreated = () => {
    router.refresh();
  };

  return (
    <>
      <Button onClick={() => setIsModalOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        {t("projectDetail.newTask")}
      </Button>
      <NewTaskModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        projectId={projectId}
        areaId={areaId}
        projectName={projectName}
        areaName={areaName}
        areas={areas}
        users={users}
        onSuccess={handleTaskCreated}
      />
    </>
  );
}


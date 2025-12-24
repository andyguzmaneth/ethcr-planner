"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { NewTaskModal } from "@/components/projects/new-task-modal";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n/useTranslation";

interface TasksPageClientProps {
  projects: Array<{ id: string; name: string }>;
  areas: Array<{ id: string; name: string; projectId?: string }>;
  users: Array<{ id: string; name: string; initials: string; email?: string }>;
}

export function TasksPageClient({
  projects,
  areas,
  users,
}: TasksPageClientProps) {
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
        projects={projects}
        areas={areas}
        users={users}
        onSuccess={handleTaskCreated}
      />
    </>
  );
}


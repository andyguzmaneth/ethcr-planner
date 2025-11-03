import { MainLayout } from "@/components/layout/main-layout";
import { AreaTasksClient } from "./area-tasks-client";
import { 
  getEventBySlug, 
  getAreaById, 
  getTasksByAreaId, 
  getUserById 
} from "@/lib/data";

interface AreaDetailPageProps {
  params: Promise<{ slug: string; areaId: string }>;
}

export default async function AreaDetailPage({ params }: AreaDetailPageProps) {
  const { slug, areaId } = await params;

  const event = getEventBySlug(slug);
  if (!event) {
    return (
      <MainLayout>
        <div className="container mx-auto p-6">
          <p>Evento no encontrado</p>
        </div>
      </MainLayout>
    );
  }

  const area = getAreaById(areaId);
  if (!area || area.eventId !== event.id) {
    return (
      <MainLayout>
        <div className="container mx-auto p-6">
          <p>Área no encontrada</p>
        </div>
      </MainLayout>
    );
  }

  const tasks = getTasksByAreaId(areaId);
  const lead = getUserById(area.leadId);

  // Enrich tasks with details
  const tasksWithDetails = tasks.map((task) => {
    const assignee = task.assigneeId ? getUserById(task.assigneeId) : null;

    return {
      ...task,
      assignee,
    };
  });

  return (
    <MainLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{area.name}</h1>
          {area.description && (
            <p className="text-muted-foreground text-lg">{area.description}</p>
          )}
          {lead && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Líder:</span>
              <span className="text-sm font-medium">{lead.name}</span>
            </div>
          )}
        </div>

        {/* Tasks Section */}
        <AreaTasksClient 
          eventName={event.name}
          areaName={area.name}
          tasks={tasksWithDetails}
        />
      </div>
    </MainLayout>
  );
}


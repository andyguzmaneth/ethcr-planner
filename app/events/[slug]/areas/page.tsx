import { MainLayout } from "@/components/layout/main-layout";
import { EventAreasClient } from "./event-areas-client";
import { getEventBySlug, getAreasByEventId, getTasksByEventId, getUserById, getUsers } from "@/lib/data";

interface EventAreasPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EventAreasPage({ params }: EventAreasPageProps) {
  const { slug } = await params;

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

  const areas = getAreasByEventId(event.id);
  const allTasks = getTasksByEventId(event.id);

  // Calculate stats for each area
  const areasWithStats = areas.map((area) => {
    const areaTasks = allTasks.filter((t) => t.areaId === area.id);
    const completed = areaTasks.filter((t) => t.status === "completed").length;
    const progress = areaTasks.length > 0 ? Math.round((completed / areaTasks.length) * 100) : 0;
    const leadUser = getUserById(area.leadId);

    return {
      ...area,
      taskCount: areaTasks.length,
      completed,
      progress,
      lead: leadUser
        ? {
            id: leadUser.id,
            name: leadUser.name,
            initials: leadUser.initials,
          }
        : null,
    };
  });

  const users = getUsers().map((user) => ({
    id: user.id,
    name: user.name,
    initials: user.initials,
    email: user.email,
  }));

  return (
    <MainLayout>
      <EventAreasClient
        eventId={event.id}
        eventName={event.name}
        areasWithStats={areasWithStats}
        users={users}
      />
    </MainLayout>
  );
}


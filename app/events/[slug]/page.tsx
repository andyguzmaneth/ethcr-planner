import { MainLayout } from "@/components/layout/main-layout";
import { getEventBySlug, getAreasByEventId, getTasksByEventId, getUserById, getUsers } from "@/lib/data";
import { EventDetailClient } from "./event-detail-client";
import { createServerTranslationFunction } from "@/lib/i18n";

interface EventDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { slug } = await params;
  const t = createServerTranslationFunction();

  const event = getEventBySlug(slug);
  if (!event) {
    return (
      <MainLayout>
        <div className="container mx-auto p-6">
          <p>{t("eventDetail.notFound")}</p>
        </div>
      </MainLayout>
    );
  }

  const areas = getAreasByEventId(event.id);
  const allTasks = getTasksByEventId(event.id);

  // Calculate stats for areas
  const areasWithStats = areas.map((area) => {
    const areaTasks = allTasks.filter((t) => t.areaId === area.id);
    const completed = areaTasks.filter((t) => t.status === "completed").length;
    const lead = getUserById(area.leadId);
    return {
      id: area.id,
      name: area.name,
      leadId: area.leadId,
      leadName: lead?.name || null,
      taskCount: areaTasks.length,
      completed,
    };
  });

  const totalTasks = allTasks.length;
  const totalCompleted = allTasks.filter((t) => t.status === "completed").length;
  const completionPercentage =
    totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

  const users = getUsers().map((user) => ({
    id: user.id,
    name: user.name,
    initials: user.initials,
    email: user.email,
  }));

  return (
    <MainLayout>
      <EventDetailClient
        event={{
          id: event.id,
          name: event.name,
          type: event.type,
          status: event.status,
        }}
        areasWithStats={areasWithStats}
        totalAreas={areas.length}
        totalTasks={totalTasks}
        completionPercentage={completionPercentage}
        users={users}
        areas={areas.map(a => ({ id: a.id, name: a.name }))}
      />
    </MainLayout>
  );
}

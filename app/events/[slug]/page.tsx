import { MainLayout } from "@/components/layout/main-layout";
import { getEventBySlug, getTracksByEventId, getTasksByEventId, getUserById, getUsers } from "@/lib/data";
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

  const tracks = getTracksByEventId(event.id);
  const allTasks = getTasksByEventId(event.id);

  // Calculate stats for tracks
  const tracksWithStats = tracks.map((track) => {
    const trackTasks = allTasks.filter((t) => t.trackId === track.id);
    const completed = trackTasks.filter((t) => t.status === "completed").length;
    const lead = getUserById(track.leadId);
    return {
      id: track.id,
      name: track.name,
      leadId: track.leadId,
      leadName: lead?.name || null,
      taskCount: trackTasks.length,
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
        tracksWithStats={tracksWithStats}
        totalTracks={tracks.length}
        totalTasks={totalTasks}
        completionPercentage={completionPercentage}
        users={users}
      />
    </MainLayout>
  );
}

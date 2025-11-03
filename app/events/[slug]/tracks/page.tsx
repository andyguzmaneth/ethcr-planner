import { MainLayout } from "@/components/layout/main-layout";
import { EventTracksClient } from "./event-tracks-client";
import { getEventBySlug, getTracksByEventId, getTasksByEventId, getUserById, getUsers } from "@/lib/data";

interface EventTracksPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EventTracksPage({ params }: EventTracksPageProps) {
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

  const tracks = getTracksByEventId(event.id);
  const allTasks = getTasksByEventId(event.id);

  // Calculate stats for each track
  const tracksWithStats = tracks.map((track) => {
    const trackTasks = allTasks.filter((t) => t.trackId === track.id);
    const completed = trackTasks.filter((t) => t.status === "completed").length;
    const progress = trackTasks.length > 0 ? Math.round((completed / trackTasks.length) * 100) : 0;
    const lead = getUserById(track.leadId);

    return {
      ...track,
      taskCount: trackTasks.length,
      completed,
      progress,
      lead,
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
      <EventTracksClient
        eventId={event.id}
        eventName={event.name}
        tracksWithStats={tracksWithStats}
        users={users}
      />
    </MainLayout>
  );
}

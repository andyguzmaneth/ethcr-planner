import { MainLayout } from "@/components/layout/main-layout";
import { getProjectBySlug, getMeetingById, getMeetingNoteByMeetingId, getUserById, getUsers } from "@/lib/data-supabase";
import { mapUsersForClient } from "@/lib/utils/server-helpers";
import { MeetingDetailClient } from "./meeting-detail-client";

interface MeetingDetailPageProps {
  params: Promise<{ slug: string; meetingId: string }>;
}

export default async function MeetingDetailPage({ params }: MeetingDetailPageProps) {
  const { slug, meetingId } = await params;

  const project = await getProjectBySlug(slug);
  if (!project) {
    return (
      <MainLayout>
        <div className="container mx-auto p-6">
          <p>Proyecto no encontrado</p>
        </div>
      </MainLayout>
    );
  }

  const meeting = await getMeetingById(meetingId);
  if (!meeting || meeting.projectId !== project.id) {
    return (
      <MainLayout>
        <div className="container mx-auto p-6">
          <p>Reunión no encontrada</p>
        </div>
      </MainLayout>
    );
  }

  const [notes, attendees, usersList] = await Promise.all([
    getMeetingNoteByMeetingId(meetingId),
    Promise.all(
      meeting.attendeeIds.map(async (id) => {
        const user = await getUserById(id);
        return user || null;
      })
    ),
    getUsers(),
  ]);
  const users = mapUsersForClient(usersList);

  return (
    <MainLayout>
      <MeetingDetailClient
        meeting={meeting}
        project={project}
        notes={notes}
        attendees={attendees}
        users={users}
      />
    </MainLayout>
  );
}


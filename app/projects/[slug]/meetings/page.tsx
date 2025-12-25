import { MainLayout } from "@/components/layout/main-layout";
import { getProjectBySlug, getMeetingsByProjectId, getUsers } from "@/lib/data-supabase";
import { mapUsersForClient } from "@/lib/utils/server-helpers";
import { enrichMeetingsWithDetails } from "@/lib/utils/meeting-helpers";
import { MeetingsClient } from "./meetings-client";

interface ProjectMeetingsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProjectMeetingsPage({ params }: ProjectMeetingsPageProps) {
  const { slug } = await params;

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

  const [meetings, usersList] = await Promise.all([
    getMeetingsByProjectId(project.id),
    getUsers(),
  ]);

  const meetingsWithDetails = await enrichMeetingsWithDetails(meetings);

  const users = mapUsersForClient(usersList);

  return (
    <MainLayout>
      <MeetingsClient
        projectId={project.id}
        projectSlug={project.slug}
        projectName={project.name}
        initialMeetings={meetingsWithDetails}
        users={users}
      />
    </MainLayout>
  );
}

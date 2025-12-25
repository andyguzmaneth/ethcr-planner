import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { getProjects, getUserJoinedProjects, getAreasByProjectId } from "@/lib/data-supabase";

interface MainLayoutProps {
  children: React.ReactNode;
}

// For now, we'll use a hardcoded user ID. In a real app, get from auth session
const CURRENT_USER_ID = "00000000-0000-0000-0000-000000000001"; // Example UUID

export async function MainLayout({ children }: MainLayoutProps) {
  // Only show projects that the user has joined in the sidebar
  const joinedProjects = await getUserJoinedProjects(CURRENT_USER_ID);
  const sidebarProjects = await Promise.all(
    joinedProjects.map(async (p) => {
      const areas = await getAreasByProjectId(p.id);
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        areas: areas.map((a) => ({
          id: a.id,
          name: a.name,
        })),
      };
    })
  );

  // All projects for header (for now - could also filter if needed)
  const allProjectsList = await getProjects();
  const allProjects = allProjectsList.map((p) => ({ 
    id: p.id, 
    name: p.name, 
    slug: p.slug 
  }));

  return (
    <div className="min-h-screen bg-background">
      <Header projects={allProjects} />
      <div className="flex">
        <Sidebar projects={sidebarProjects} />
        <main className="flex-1 md:ml-64 mt-16 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}


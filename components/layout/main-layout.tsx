import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { getProjects, getUserJoinedProjects, getAreasByProjectId } from "@/lib/data";

interface MainLayoutProps {
  children: React.ReactNode;
}

// For now, we'll use a hardcoded user ID. In a real app, get from auth session
const CURRENT_USER_ID = "user-alfredo";

export function MainLayout({ children }: MainLayoutProps) {
  // Only show projects that the user has joined in the sidebar
  const joinedProjects = getUserJoinedProjects(CURRENT_USER_ID);
  const sidebarProjects = joinedProjects.map((p) => {
    const areas = getAreasByProjectId(p.id).map((a) => ({
      id: a.id,
      name: a.name,
    }));
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      areas,
    };
  });

  // All projects for header (for now - could also filter if needed)
  const allProjects = getProjects().map((p) => ({ 
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


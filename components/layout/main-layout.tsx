import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { getEvents, getUserJoinedEvents } from "@/lib/data";

interface MainLayoutProps {
  children: React.ReactNode;
}

// For now, we'll use a hardcoded user ID. In a real app, get from auth session
const CURRENT_USER_ID = "user-alfredo";

export function MainLayout({ children }: MainLayoutProps) {
  // Only show events that the user has joined in the sidebar
  const joinedEvents = getUserJoinedEvents(CURRENT_USER_ID);
  const sidebarEvents = joinedEvents.map((e) => ({ 
    id: e.id, 
    name: e.name, 
    slug: e.slug 
  }));

  // All events for header (for now - could also filter if needed)
  const allEvents = getEvents().map((e) => ({ 
    id: e.id, 
    name: e.name, 
    slug: e.slug 
  }));

  return (
    <div className="min-h-screen bg-background">
      <Header events={allEvents} />
      <div className="flex">
        <Sidebar events={sidebarEvents} />
        <main className="flex-1 md:ml-64 mt-16 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}


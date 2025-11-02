import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { getEvents } from "@/lib/data";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const events = getEvents().map((e) => ({ id: e.id, name: e.name }));

  return (
    <div className="min-h-screen bg-background">
      <Header events={events} />
      <div className="flex">
        <Sidebar events={events} />
        <main className="flex-1 md:ml-64 mt-16 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}


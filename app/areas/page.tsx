import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { getAreas, getTasksByAreaId, getUserById, getProjectById } from "@/lib/data-supabase";
import { getUserIfProvided, calculateTaskStats } from "@/lib/utils/server-helpers";

export default async function AreasPage() {
  const areas = await getAreas();

  // Enrich areas with details
  const areasWithDetails = await Promise.all(
    areas.map(async (area) => {
      const [lead, project, areaTasks] = await Promise.all([
        getUserIfProvided(area.leadId),
        area.projectId ? getProjectById(area.projectId) : Promise.resolve(undefined),
        getTasksByAreaId(area.id),
      ]);
      const { total, completed } = calculateTaskStats(areaTasks);
      const participants = await Promise.all(
        area.participantIds.map((id) => getUserById(id))
      );

      return {
        ...area,
        lead,
        project,
        tasks: total,
        completed,
        participants: participants.filter(Boolean),
      };
    })
  );

  return (
    <MainLayout>
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Areas</h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Explora todas las áreas entre eventos
          </p>
        </div>

        {/* Areas Grid */}
        {areasWithDetails.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">No se encontraron áreas</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {areasWithDetails.map((area) => {
              const progress = area.tasks > 0 ? Math.round((area.completed / area.tasks) * 100) : 0;

              return (
                <Link key={area.id} href={`/areas/${area.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <CardTitle className="text-xl">{area.name}</CardTitle>
                      <CardDescription>{area.project?.name || "Proyecto desconocido"}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={area.lead?.avatar || ""} alt={area.lead?.name || ""} />
                            <AvatarFallback>{area.lead?.initials || "?"}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{area.lead?.name || "Sin asignar"}</p>
                            <p className="text-xs text-muted-foreground">Líder del Área</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {area.participants?.length || 0} Participantes
                          </span>
                          <span className="text-muted-foreground">
                            {area.completed}/{area.tasks} Tareas
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Progreso</span>
                            <span>{progress}%</span>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}


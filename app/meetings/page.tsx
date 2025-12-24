import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, FileText } from "lucide-react";
import Link from "next/link";
import { getMeetings, getMeetingNoteByMeetingId, getUserById, getEventById } from "@/lib/data";
import { createServerTranslationFunction, getLocaleFromCookies } from "@/lib/i18n";
import { cookies } from "next/headers";

export default async function MeetingsPage() {
  const cookieStore = await cookies();
  const localeFromCookie = cookieStore.get("app_locale")?.value;
  const locale = getLocaleFromCookies(localeFromCookie);
  const t = createServerTranslationFunction(locale);

  const meetings = getMeetings();

  // Enrich meetings with details
  const meetingsWithDetails = meetings.map((meeting) => {
    const notes = getMeetingNoteByMeetingId(meeting.id);
    const attendees = meeting.attendeeIds.map((id) => getUserById(id)).filter(Boolean);
    const event = getEventById(meeting.eventId);

    return {
      ...meeting,
      hasNotes: !!notes,
      attendees,
      event,
    };
  });

  return (
    <MainLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reuniones</h1>
            <p className="text-muted-foreground mt-2">
              Ver y gestionar notas de reuniones
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t("projectDetail.scheduleMeeting")}
          </Button>
        </div>

        {/* Meetings List */}
        {meetingsWithDetails.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">No hay reuniones programadas</p>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t("projectDetail.createFirstMeeting")}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {meetingsWithDetails.map((meeting) => (
              <Link key={meeting.id} href={`/meetings/${meeting.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{meeting.title}</CardTitle>
                        <CardDescription>{meeting.event?.name || "Evento desconocido"}</CardDescription>
                      </div>
                      {meeting.hasNotes && (
                        <Badge variant="outline">
                          <FileText className="mr-1 h-3 w-3" />
                          Tiene Notas
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">
                          {meeting.date} a las {meeting.time}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Asistentes:</span>
                        <div className="flex -space-x-2">
                          {meeting.attendees.map((attendee, idx) => (
                            <Avatar key={idx} className="h-6 w-6 border-2 border-background">
                              <AvatarImage src={attendee?.avatar || ""} alt={attendee?.name || ""} />
                              <AvatarFallback className="text-xs">
                                {attendee?.initials || "?"}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}

import "server-only";
import { getMeetingNoteByMeetingId, getUserById } from "@/lib/data-supabase";
import type { Meeting } from "@/lib/types";

export interface EnrichedMeeting extends Meeting {
  hasNotes: boolean;
  attendees: Array<{
    id: string;
    name: string;
    initials: string;
    email?: string;
    avatar?: string;
  } | null>;
}

/**
 * Enrich meetings with notes and attendee details
 */
export async function enrichMeetingsWithDetails(
  meetings: Meeting[]
): Promise<EnrichedMeeting[]> {
  return Promise.all(
    meetings.map(async (meeting) => {
      const notes = await getMeetingNoteByMeetingId(meeting.id);
      const attendees = await Promise.all(
        meeting.attendeeIds.map(async (id) => {
          const user = await getUserById(id);
          return user || null;
        })
      );

      return {
        ...meeting,
        hasNotes: !!notes,
        attendees,
      };
    })
  );
}


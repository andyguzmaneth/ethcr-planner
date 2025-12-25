export function buildMeetingNotePayload(
  content: string | undefined,
  agenda: string | undefined,
  decisions: string | undefined,
  actionItems: unknown
): {
  content: string;
  agenda?: string;
  decisions?: string;
  actionItems?: string[];
} {
  const payload: {
    content: string;
    agenda?: string;
    decisions?: string;
    actionItems?: string[];
  } = {
    content: content?.trim() || "",
  };

  if (agenda !== undefined) {
    payload.agenda = agenda.trim() || undefined;
  }

  if (decisions !== undefined) {
    payload.decisions = decisions.trim() || undefined;
  }

  if (actionItems !== undefined) {
    payload.actionItems =
      Array.isArray(actionItems) && actionItems.length > 0 ? actionItems : undefined;
  }

  return payload;
}


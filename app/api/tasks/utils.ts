const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function parseSupportResources(supportResources: unknown): string[] | undefined {
  if (typeof supportResources === "string") {
    const parsed = supportResources
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    return parsed.length > 0 ? parsed : undefined;
  }
  if (Array.isArray(supportResources)) {
    return supportResources.length > 0 ? supportResources : undefined;
  }
  return undefined;
}

export function validateUUID(id: string | null | undefined, fieldName: string): string | undefined {
  if (!id) return undefined;
  if (UUID_REGEX.test(id)) return id;
  throw new Error(
    `Invalid ${fieldName}: must be a valid UUID. Received: "${id}". ` +
    `This usually means the data is coming from the old mock data system. ` +
    `Please ensure you're using functions from @/lib/data-supabase instead of @/lib/data.`
  );
}


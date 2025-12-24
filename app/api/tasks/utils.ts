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


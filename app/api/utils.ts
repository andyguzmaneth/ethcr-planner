import { NextResponse } from "next/server";

export function handleApiError(
  error: unknown,
  operation: string,
  defaultMessage?: string
): NextResponse {
  console.error(`Error ${operation}:`, error);
  const errorMessage = error instanceof Error ? error.message : defaultMessage || `Failed to ${operation}`;
  const statusCode = errorMessage.includes("Invalid") ? 400 : 500;
  return NextResponse.json({ error: errorMessage }, { status: statusCode });
}

export function notFoundResponse(entityName: string): NextResponse {
  return NextResponse.json({ error: `${entityName} not found` }, { status: 404 });
}

export function badRequestResponse(message: string): NextResponse {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function validateRequiredString(
  value: unknown,
  fieldName: string
): string | null {
  if (!value || typeof value !== "string" || value.trim().length === 0) {
    return null;
  }
  return value.trim();
}


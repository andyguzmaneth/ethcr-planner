import "server-only";
import type { User } from "@/lib/types";
import { getUserById } from "@/lib/data-supabase";

/**
 * Get current user ID (placeholder - should be replaced with actual auth)
 * TODO: Replace with actual authentication session
 */
export function getCurrentUserId(): string {
  return "00000000-0000-0000-0000-000000000001";
}

/**
 * Map users to a simplified format for client components
 */
export function mapUsersForClient(users: User[]): Array<{
  id: string;
  name: string;
  initials: string;
  email?: string;
}> {
  return users.map((user) => ({
    id: user.id,
    name: user.name,
    initials: user.initials,
    email: user.email,
  }));
}

/**
 * Get user by ID if provided, otherwise return undefined
 */
export async function getUserIfProvided(userId?: string): Promise<User | undefined> {
  if (!userId) return undefined;
  return getUserById(userId);
}

/**
 * Calculate task completion stats
 */
export function calculateTaskStats(tasks: Array<{ status: string }>) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "completed").length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { total, completed, progress };
}


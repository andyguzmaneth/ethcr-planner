import "server-only";
import type { User } from "@/lib/types";
import { getUserById, getUsers, createUser } from "@/lib/data-supabase";

/**
 * Get or create a default user for testing purposes
 * TODO: Replace with actual authentication session
 */
export async function getCurrentUserId(): Promise<string> {
  // Try to get the first user from the database
  const users = await getUsers();
  if (users.length > 0) {
    return users[0].id;
  }

  // If no users exist, create a default user
  const defaultUser = await createUser({
    name: "Default User",
    email: "default@example.com",
    initials: "DU",
  });

  return defaultUser.id;
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


import { NextResponse } from "next/server";
import { migrateMockDataToSupabase } from "@/lib/scripts/migrate-mock-data-to-supabase";

export async function POST() {
  try {
    await migrateMockDataToSupabase();
    return NextResponse.json({ success: true, message: "Migration completed successfully" });
  } catch (error) {
    console.error("Migration error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}


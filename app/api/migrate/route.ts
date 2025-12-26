import { NextResponse } from "next/server";

// Migration route - migration has been completed
// This route is kept for reference but is no longer functional
export async function POST() {
  return NextResponse.json(
    { 
      success: false, 
      message: "Migration has been completed. This route is no longer available." 
    },
    { status: 410 } // 410 Gone - resource is no longer available
  );
}


import { NextResponse } from "next/server";
import { getRecentAuditLog } from "@/lib/db/queries/audit";

// GET: List recent audit log entries
export async function GET() {
  try {
    const entries = await getRecentAuditLog(100);
    return NextResponse.json({ entries });
  } catch (error) {
    console.error("Admin audit GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch audit log" },
      { status: 500 },
    );
  }
}

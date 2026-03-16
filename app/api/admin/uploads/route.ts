import { NextResponse } from "next/server";
import { getAllUploads } from "@/lib/db/queries/uploads";

// GET: List all uploads (admin view)
export async function GET() {
  try {
    const uploads = await getAllUploads();
    return NextResponse.json({ uploads });
  } catch (error) {
    console.error("Admin uploads GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch uploads" },
      { status: 500 },
    );
  }
}

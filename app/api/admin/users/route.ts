import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

// GET: List all users
export async function GET() {
  try {
    const allUsers = await db.select().from(users).orderBy(users.createdAt);
    return NextResponse.json({ users: allUsers });
  } catch (error) {
    console.error("Admin users GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}

// PATCH: Update a user's role
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json(
        { error: "userId and role are required" },
        { status: 400 },
      );
    }

    const validRoles = ["admin", "data_steward", "uploader", "viewer"];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${validRoles.join(", ")}` },
        { status: 400 },
      );
    }

    const [updated] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Admin users PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update user role" },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { referenceCodes } from "@/lib/db/schema";
import {
  getReferenceCodesByType,
  upsertReferenceCode,
} from "@/lib/db/queries/reference";

// GET: List reference codes by type
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const codeType = searchParams.get("codeType");

  if (!codeType) {
    return NextResponse.json(
      { error: "codeType parameter required" },
      { status: 400 },
    );
  }

  try {
    const codes = await getReferenceCodesByType(codeType);
    return NextResponse.json({ codeType, codes });
  } catch (error) {
    console.error("Reference data GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reference codes" },
      { status: 500 },
    );
  }
}

// POST: Create or update a reference code
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { codeType, code, description } = body;

    if (!codeType || !code) {
      return NextResponse.json(
        { error: "codeType and code are required" },
        { status: 400 },
      );
    }

    const result = await upsertReferenceCode(codeType, code, description);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Reference data POST error:", error);
    return NextResponse.json(
      { error: "Failed to save reference code" },
      { status: 500 },
    );
  }
}

// DELETE: Deactivate a reference code by id
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "id parameter required" },
      { status: 400 },
    );
  }

  try {
    const [updated] = await db
      .update(referenceCodes)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(referenceCodes.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: "Reference code not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Reference data DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to deactivate reference code" },
      { status: 500 },
    );
  }
}

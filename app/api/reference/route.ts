import { NextRequest, NextResponse } from "next/server";

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

  // TODO: Query database once connected
  return NextResponse.json({
    codeType,
    codes: [],
    message: "Database not yet connected. Seed reference data to populate.",
  });
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

    // TODO: Upsert to database once connected
    return NextResponse.json({
      message: "Reference code saved (pending DB integration)",
      codeType,
      code,
      description,
    });
  } catch (error) {
    console.error("Reference data error:", error);
    return NextResponse.json(
      { error: "Failed to save reference code" },
      { status: 500 },
    );
  }
}

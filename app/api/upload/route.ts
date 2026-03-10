import { NextRequest, NextResponse } from "next/server";
import { parseExcelFile, validateFileMetadata, validateHeaders } from "@/lib/parsers/excel";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const dataType = formData.get("dataType") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!dataType) {
      return NextResponse.json(
        { error: "No data type selected" },
        { status: 400 },
      );
    }

    // Validate file metadata
    const metaError = validateFileMetadata(file.name, file.size);
    if (metaError) {
      return NextResponse.json({ error: metaError.message }, { status: 400 });
    }

    // Parse the Excel file
    const buffer = await file.arrayBuffer();
    const parsed = parseExcelFile(buffer);

    // TODO: Validate headers against expected template for this data type
    // TODO: Run validation engine against each row
    // TODO: Save upload record and validation results to DB
    // TODO: Create audit log entry

    return NextResponse.json({
      uploadId: "pending-db-integration",
      filename: file.name,
      dataType,
      rowCount: parsed.rowCount,
      headers: parsed.headers,
      message: `Parsed ${parsed.rowCount} rows. Validation engine will run once DB is connected.`,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to process upload" },
      { status: 500 },
    );
  }
}

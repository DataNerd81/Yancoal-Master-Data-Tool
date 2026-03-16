import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getValidationResults, getUploadById } from "@/lib/db/queries/uploads";
import { generateAnnotatedExcel } from "@/lib/parsers/excel";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ uploadId: string }> },
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { uploadId } = await params;

    const upload = await getUploadById(uploadId);
    if (!upload) {
      return NextResponse.json({ error: "Upload not found" }, { status: 404 });
    }

    const results = await getValidationResults(uploadId);

    return NextResponse.json({
      upload: {
        id: upload.id,
        filename: upload.filename,
        dataType: upload.dataType,
        status: upload.status,
        rowCount: upload.rowCount,
        errorCount: upload.errorCount,
        warningCount: upload.warningCount,
        cleanCount: upload.cleanCount,
        createdAt: upload.createdAt,
        completedAt: upload.completedAt,
      },
      results: results.map((r) => ({
        id: r.id,
        rowNumber: r.rowNumber,
        columnName: r.columnName,
        originalValue: r.originalValue,
        ruleId: r.ruleId,
        severity: r.severity,
        message: r.message,
        suggestedFix: r.suggestedFix,
      })),
    });
  } catch (error) {
    console.error("Error fetching results:", error);
    return NextResponse.json(
      { error: "Failed to fetch results" },
      { status: 500 },
    );
  }
}

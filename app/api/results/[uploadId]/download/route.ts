import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getValidationResults, getUploadById } from "@/lib/db/queries/uploads";
import * as XLSX from "xlsx";

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

    // Build an annotated summary sheet from validation results
    const annotatedRows = results.map((r) => ({
      Row: r.rowNumber,
      Column: r.columnName,
      "Original Value": r.originalValue ?? "",
      Rule: r.ruleId,
      Severity: r.severity,
      Message: r.message,
      "Suggested Fix": r.suggestedFix ?? "",
    }));

    const workbook = XLSX.utils.book_new();
    const sheet = XLSX.utils.json_to_sheet(annotatedRows);
    XLSX.utils.book_append_sheet(workbook, sheet, "Validation Results");

    const buffer = XLSX.write(workbook, { type: "array", bookType: "xlsx" });

    const filename = upload.filename.replace(/\.\w+$/, "") + "_validation_results.xlsx";

    return new NextResponse(Buffer.from(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error generating download:", error);
    return NextResponse.json(
      { error: "Failed to generate download" },
      { status: 500 },
    );
  }
}

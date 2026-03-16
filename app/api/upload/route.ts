import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, validationResults, type NewValidationResult } from "@/lib/db/schema";
import { createUpload, updateUploadStatus } from "@/lib/db/queries/uploads";
import { getCodeSet } from "@/lib/db/queries/reference";
import { parseExcelFile, validateFileMetadata } from "@/lib/parsers/excel";
import {
  validateFunctionalLocation,
  validateMaintenancePlan,
  validateTaskList,
  validateEquipment,
  type FLReferenceData,
  type ValidationError,
} from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    // ── Auth ──────────────────────────────────────────────────────────
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ── Find or create user in DB ────────────────────────────────────
    let [dbUser] = await db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, clerkUserId));

    if (!dbUser) {
      const clerkUser = await currentUser();
      const [inserted] = await db
        .insert(users)
        .values({
          clerkUserId,
          email:
            clerkUser?.emailAddresses?.[0]?.emailAddress ?? "unknown@example.com",
          name: clerkUser
            ? `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim()
            : null,
        })
        .returning();
      dbUser = inserted;
    }

    // ── Parse form data ──────────────────────────────────────────────
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

    // ── Create upload record (status = processing) ───────────────────
    const upload = await createUpload({
      userId: dbUser.id,
      filename: file.name,
      dataType: dataType as "functional_location" | "equipment" | "maintenance_plan" | "task_list" | "work_centre" | "bom",
      rowCount: parsed.rowCount,
    });

    // ── Load reference data from database ─────────────────────────────
    const [
      divisionCodes,
      businessUnits,
      siteCodes,
      plantTypes,
      componentCodes,
      costCentres,
      workCentres,
      fleetCodes,
      actionCodes,
      locationCodes,
    ] = await Promise.all([
      getCodeSet("division"),
      getCodeSet("business_unit"),
      getCodeSet("site_code"),
      getCodeSet("plant_type"),
      getCodeSet("component"),
      getCodeSet("cost_centre"),
      getCodeSet("work_centre"),
      getCodeSet("fleet_code"),
      getCodeSet("action_code"),
      getCodeSet("location_code"),
    ]);

    const refData: FLReferenceData = {
      divisionCodes,
      businessUnits,
      siteCodes,
      plantTypes,
      componentCodes,
      costCentres,
      workCentres,
    };

    // ── Run validation engine ────────────────────────────────────────
    const allErrors: ValidationError[] = [];
    const existingFLs = new Set<string>();
    const uploadFLsSoFar = new Set<string>();

    for (let i = 0; i < parsed.rows.length; i++) {
      // Rows come from the Excel parser as Record<string, string>.
      // The validators use typed overlapping interfaces, so we cast here.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const row = parsed.rows[i] as any;
      const rowNumber = i + 1;
      let rowErrors: ValidationError[] = [];

      switch (dataType) {
        case "functional_location":
          rowErrors = validateFunctionalLocation(
            row,
            rowNumber,
            refData,
            existingFLs,
            uploadFLsSoFar,
          );
          if (row.functionalLocation) {
            uploadFLsSoFar.add(row.functionalLocation.trim());
          }
          break;
        case "maintenance_plan":
          rowErrors = validateMaintenancePlan(row, rowNumber, {
            fleetCodes,
            actionCodes,
            siteCodes,
          });
          break;
        case "task_list":
          rowErrors = validateTaskList(row, rowNumber, {
            locationCodes,
          });
          break;
        case "equipment":
          rowErrors = validateEquipment(row, rowNumber, existingFLs);
          break;
        default:
          await updateUploadStatus(upload.id, "failed");
          return NextResponse.json(
            { error: `Unsupported data type: ${dataType}` },
            { status: 400 },
          );
      }

      allErrors.push(...rowErrors);
    }

    // ── Store validation results in DB (batch insert) ────────────────
    if (allErrors.length > 0) {
      // Insert in chunks of 500 to avoid overly large statements
      const BATCH_SIZE = 500;
      for (let i = 0; i < allErrors.length; i += BATCH_SIZE) {
        const batch: NewValidationResult[] = allErrors
          .slice(i, i + BATCH_SIZE)
          .map((e) => ({
            uploadId: upload.id,
            rowNumber: e.rowNumber,
            columnName: e.columnName,
            originalValue: e.originalValue ?? null,
            ruleId: e.ruleId,
            severity: e.severity as "error" | "warning",
            message: e.message,
            suggestedFix: e.suggestedFix ?? null,
          }));

        await db.insert(validationResults).values(batch);
      }
    }

    // ── Update upload record with final counts ───────────────────────
    const errorCount = allErrors.filter((e) => e.severity === "error").length;
    const warningCount = allErrors.filter((e) => e.severity === "warning").length;
    const rowsWithIssues = new Set(allErrors.map((e) => e.rowNumber)).size;

    await updateUploadStatus(upload.id, "complete", {
      rowCount: parsed.rowCount,
      errorCount,
      warningCount,
      cleanCount: parsed.rowCount - rowsWithIssues,
    });

    // ── Return real uploadId ─────────────────────────────────────────
    return NextResponse.json({
      uploadId: upload.id,
      filename: file.name,
      dataType,
      rowCount: parsed.rowCount,
      errorCount,
      warningCount,
      cleanCount: parsed.rowCount - rowsWithIssues,
      message: `Validated ${parsed.rowCount} rows. ${errorCount} errors, ${warningCount} warnings.`,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to process upload" },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
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
    const body = await request.json();
    const { rows, dataType } = body;

    if (!rows || !Array.isArray(rows)) {
      return NextResponse.json(
        { error: "Invalid request: rows array required" },
        { status: 400 },
      );
    }

    if (!dataType) {
      return NextResponse.json(
        { error: "Invalid request: dataType required" },
        { status: 400 },
      );
    }

    const allErrors: ValidationError[] = [];

    // TODO: Load reference data from database
    // For now, use empty sets as placeholder
    const emptyRefData: FLReferenceData = {
      divisionCodes: new Set(),
      businessUnits: new Set(),
      siteCodes: new Set(),
      plantTypes: new Set(),
      componentCodes: new Set(),
      costCentres: new Set(),
      workCentres: new Set(),
    };

    const existingFLs = new Set<string>();
    const uploadFLsSoFar = new Set<string>();

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 1;
      let rowErrors: ValidationError[] = [];

      switch (dataType) {
        case "functional_location":
          rowErrors = validateFunctionalLocation(
            row,
            rowNumber,
            emptyRefData,
            existingFLs,
            uploadFLsSoFar,
          );
          if (row.functionalLocation) {
            uploadFLsSoFar.add(row.functionalLocation.trim());
          }
          break;
        case "maintenance_plan":
          rowErrors = validateMaintenancePlan(row, rowNumber, {
            fleetCodes: new Set(),
            actionCodes: new Set(),
            siteCodes: new Set(),
          });
          break;
        case "task_list":
          rowErrors = validateTaskList(row, rowNumber, {
            locationCodes: new Set(),
          });
          break;
        case "equipment":
          rowErrors = validateEquipment(row, rowNumber, existingFLs);
          break;
        default:
          return NextResponse.json(
            { error: `Unsupported data type: ${dataType}` },
            { status: 400 },
          );
      }

      allErrors.push(...rowErrors);
    }

    const errorCount = allErrors.filter((e) => e.severity === "error").length;
    const warningCount = allErrors.filter(
      (e) => e.severity === "warning",
    ).length;

    return NextResponse.json({
      totalRows: rows.length,
      errorCount,
      warningCount,
      cleanCount: rows.length - new Set(allErrors.map((e) => e.rowNumber)).size,
      errors: allErrors,
    });
  } catch (error) {
    console.error("Validation error:", error);
    return NextResponse.json(
      { error: "Validation failed" },
      { status: 500 },
    );
  }
}

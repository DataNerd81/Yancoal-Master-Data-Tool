import { NextRequest, NextResponse } from "next/server";
import { getCodeSet } from "@/lib/db/queries/reference";
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

    // Load reference data from database
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

    const allErrors: ValidationError[] = [];
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

import { z } from "zod";
import type { ValidationError } from "./functional-location";

export const taskListSchema = z.object({
  header: z.string().min(1, "Task list header is required"),
  operationDescription: z.string().optional(),
  locationCode: z.string().optional(),
});

export type TaskListRow = z.infer<typeof taskListSchema>;

const MAX_LENGTH = 40;

export function validateTaskList(
  row: TaskListRow,
  rowNumber: number,
  refData: { locationCodes: Set<string> },
): ValidationError[] {
  const errors: ValidationError[] = [];

  // TL-001: Header max 40 characters
  if (row.header.length > MAX_LENGTH) {
    errors.push({
      rowNumber,
      columnName: "header",
      originalValue: row.header,
      ruleId: "TL-001",
      severity: "error",
      message: `Task list header exceeds ${MAX_LENGTH} characters (${row.header.length} chars)`,
      suggestedFix: row.header.substring(0, MAX_LENGTH),
    });
  }

  // TL-002: Operation description max 40 characters
  if (row.operationDescription && row.operationDescription.length > MAX_LENGTH) {
    errors.push({
      rowNumber,
      columnName: "operationDescription",
      originalValue: row.operationDescription,
      ruleId: "TL-002",
      severity: "error",
      message: `Operation description exceeds ${MAX_LENGTH} characters (${row.operationDescription.length} chars)`,
      suggestedFix: row.operationDescription.substring(0, MAX_LENGTH),
    });
  }

  // TL-003: Location Code from validated list
  if (row.locationCode && !refData.locationCodes.has(row.locationCode)) {
    errors.push({
      rowNumber,
      columnName: "locationCode",
      originalValue: row.locationCode,
      ruleId: "TL-003",
      severity: "warning",
      message: `Location Code '${row.locationCode}' not found in validated list`,
      suggestedFix: "Check reference data for valid location codes",
    });
  }

  // GEN-001: Whitespace
  if (row.header !== row.header.trim()) {
    errors.push({
      rowNumber,
      columnName: "header",
      originalValue: row.header,
      ruleId: "GEN-001",
      severity: "warning",
      message: "Header has leading/trailing whitespace",
      suggestedFix: row.header.trim(),
    });
  }

  return errors;
}

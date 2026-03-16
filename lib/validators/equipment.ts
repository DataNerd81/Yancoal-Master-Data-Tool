import { z } from "zod";
import type { ValidationError } from "./functional-location";

export const equipmentSchema = z.object({
  equipmentNumber: z.string().min(1, "Equipment number is required"),
  description: z.string().min(1, "Description is required"),
  functionalLocation: z.string().optional(),
  category: z.string().optional(),
});

export type EquipmentRow = z.infer<typeof equipmentSchema>;

export function validateEquipment(
  row: EquipmentRow,
  rowNumber: number,
  existingFLs: Set<string>,
): ValidationError[] {
  const errors: ValidationError[] = [];

  // EQ-001: Equipment number format (must be alphanumeric, no special chars)
  if (!/^[A-Za-z0-9\-]+$/.test(row.equipmentNumber)) {
    errors.push({
      rowNumber,
      columnName: "equipmentNumber",
      originalValue: row.equipmentNumber,
      ruleId: "EQ-001",
      severity: "error",
      message: `Equipment number '${row.equipmentNumber}' contains invalid characters`,
      suggestedFix: row.equipmentNumber.replace(/[^A-Za-z0-9\-]/g, ''),
    });
  }

  // EQ-002: Must reference valid Functional Location
  if (row.functionalLocation && !existingFLs.has(row.functionalLocation)) {
    errors.push({
      rowNumber,
      columnName: "functionalLocation",
      originalValue: row.functionalLocation,
      ruleId: "EQ-002",
      severity: "error",
      message: `Referenced Functional Location '${row.functionalLocation}' does not exist`,
      suggestedFix: "Verify the Functional Location exists or create it first",
    });
  }

  // GEN-001: Whitespace
  if (row.equipmentNumber !== row.equipmentNumber.trim()) {
    errors.push({
      rowNumber,
      columnName: "equipmentNumber",
      originalValue: row.equipmentNumber,
      ruleId: "GEN-001",
      severity: "warning",
      message: "Equipment number has leading/trailing whitespace",
      suggestedFix: row.equipmentNumber.trim(),
    });
  }

  return errors;
}

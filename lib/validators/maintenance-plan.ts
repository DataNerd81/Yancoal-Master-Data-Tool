import { z } from "zod";
import type { ValidationError } from "./functional-location";

// ─── Zod Schema ──────────────────────────────────────────────────────────────

export const maintenancePlanSchema = z.object({
  planName: z.string().min(1, "Plan name is required"),
  fleetDesignator: z.string().optional(),
  trade: z.string().optional(),
  actionCode: z.string().optional(),
  frequency: z.string().optional(),
  processCode: z.string().optional(),
  planType: z.enum(["HME", "FIXED_PLANT", "UNDERGROUND"]).optional(),
});

export type MaintenancePlanRow = z.infer<typeof maintenancePlanSchema>;

// ─── Constants ───────────────────────────────────────────────────────────────

const MAX_NAME_LENGTH = 40;
const VALID_FREQUENCIES = new Set([
  "WKLY", "HR", "YRLY", "MNTH", "QRTLY", "SMYR", "DALY",
]);

// ─── Validation Function ─────────────────────────────────────────────────────

export function validateMaintenancePlan(
  row: MaintenancePlanRow,
  rowNumber: number,
  refData: {
    fleetCodes: Set<string>;
    actionCodes: Set<string>;
    siteCodes: Set<string>;
  },
): ValidationError[] {
  const errors: ValidationError[] = [];

  // MP-001: Name max 40 characters
  if (row.planName.length > MAX_NAME_LENGTH) {
    errors.push({
      rowNumber,
      columnName: "planName",
      originalValue: row.planName,
      ruleId: "MP-001",
      severity: "error",
      message: `Plan name exceeds ${MAX_NAME_LENGTH} characters (${row.planName.length} chars)`,
      suggestedFix: row.planName.substring(0, MAX_NAME_LENGTH),
    });
  }

  // MP-002: Fleet Designator from validated list
  if (row.fleetDesignator && !refData.fleetCodes.has(row.fleetDesignator)) {
    errors.push({
      rowNumber,
      columnName: "fleetDesignator",
      originalValue: row.fleetDesignator,
      ruleId: "MP-002",
      severity: "error",
      message: `Fleet Designator '${row.fleetDesignator}' not found in registered fleet codes`,
      suggestedFix: "Check reference data for valid fleet codes",
    });
  }

  // MP-003: Action Code must be uppercase and from validated list
  if (row.actionCode) {
    if (row.actionCode !== row.actionCode.toUpperCase()) {
      errors.push({
        rowNumber,
        columnName: "actionCode",
        originalValue: row.actionCode,
        ruleId: "MP-003",
        severity: "error",
        message: `Action Code '${row.actionCode}' must be uppercase`,
        suggestedFix: row.actionCode.toUpperCase(),
      });
    }
    if (!refData.actionCodes.has(row.actionCode.toUpperCase())) {
      errors.push({
        rowNumber,
        columnName: "actionCode",
        originalValue: row.actionCode,
        ruleId: "MP-003",
        severity: "error",
        message: `Action Code '${row.actionCode}' not found in validated list`,
        suggestedFix: null,
      });
    }
  }

  // MP-004: Frequency format
  if (row.frequency && !VALID_FREQUENCIES.has(row.frequency)) {
    errors.push({
      rowNumber,
      columnName: "frequency",
      originalValue: row.frequency,
      ruleId: "MP-004",
      severity: "warning",
      message: `Frequency '${row.frequency}' doesn't match standard formats (WKLY, HR, YRLY, etc.)`,
      suggestedFix: [...VALID_FREQUENCIES].sort((a, b) => {
        const distA = Math.abs(a.length - (row.frequency?.length ?? 0));
        const distB = Math.abs(b.length - (row.frequency?.length ?? 0));
        return distA - distB;
      })[0] ?? null,
    });
  }

  // MP-005: Process Code must align with FL Site Codes
  if (row.processCode && !refData.siteCodes.has(row.processCode)) {
    errors.push({
      rowNumber,
      columnName: "processCode",
      originalValue: row.processCode,
      ruleId: "MP-005",
      severity: "error",
      message: `Process Code '${row.processCode}' does not align with FL Site Codes`,
      suggestedFix: "Check reference data for valid site codes",
    });
  }

  // GEN-001: Whitespace
  if (row.planName !== row.planName.trim()) {
    errors.push({
      rowNumber,
      columnName: "planName",
      originalValue: row.planName,
      ruleId: "GEN-001",
      severity: "warning",
      message: "Plan name has leading/trailing whitespace",
      suggestedFix: row.planName.trim(),
    });
  }

  return errors;
}

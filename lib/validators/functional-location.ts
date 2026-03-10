import { z } from "zod";
import { RULES, type Severity } from "./rules";

// ─── Validation Error Type ───────────────────────────────────────────────────

export interface ValidationError {
  rowNumber: number;
  columnName: string;
  originalValue: string | null;
  ruleId: string;
  severity: Severity;
  message: string;
  suggestedFix: string | null;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const VALID_USER_STATUSES = ["INIT", "ACTV", "INAC", "PARK", "RTRD", "NMOB"] as const;
const VALID_ABC_INDICATORS = ["1", "2", "3", "4", "5"] as const;

// Mask 1 (NAVI): NNNN-NNNN-AAXX-AXXX-XXXX-XXXX
const MASK1_REGEX = /^\d{4}-\d{4}-[A-Z]{2}\d{2}-[A-Z]\w{3}-\w{4}-\w{4}$/;

// Mask 2 (UNIT): NNNNAAXXXX-AAAXXX-AAAXXX-AAAXXX-XXXXXXXX
const MASK2_REGEX = /^\d{4}[A-Z]{2}\w{4}-[A-Z]{3}\w{3}-[A-Z]{3}\w{3}-[A-Z]{3}\w{3}-\w{8}$/;

// ─── Zod Schema for a Functional Location Row ───────────────────────────────

export const functionalLocationSchema = z.object({
  functionalLocation: z.string().min(1, "Functional Location is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().optional(),
  maskType: z.enum(["NAVI", "UNIT"]).optional(),
  superiorFL: z.string().optional(),
  costCentre: z.string().optional(),
  workCentre: z.string().optional(),
  constructionType: z.string().optional(),
  abcIndicator: z.string().optional(),
  userStatus: z.string().optional(),
});

export type FunctionalLocationRow = z.infer<typeof functionalLocationSchema>;

// ─── Reference Data Context (passed in from DB lookup) ──────────────────────

export interface FLReferenceData {
  divisionCodes: Set<string>;
  businessUnits: Set<string>;
  siteCodes: Set<string>;
  plantTypes: Set<string>;
  componentCodes: Set<string>;
  costCentres: Set<string>;
  workCentres: Set<string>;
}

// ─── Mask Pattern Validators ─────────────────────────────────────────────────

function detectMaskType(fl: string): "NAVI" | "UNIT" | null {
  if (MASK1_REGEX.test(fl)) return "NAVI";
  if (MASK2_REGEX.test(fl)) return "UNIT";
  return null;
}

function validateMask1Levels(
  fl: string,
  rowNumber: number,
  refData: FLReferenceData,
): ValidationError[] {
  const errors: ValidationError[] = [];
  const parts = fl.split("-");

  // Level 1: Division code (4 numeric)
  if (parts[0] && !/^\d{4}$/.test(parts[0])) {
    errors.push({
      rowNumber,
      columnName: "functionalLocation",
      originalValue: parts[0],
      ruleId: "FL-003",
      severity: "error",
      message: `Level 1 Division code '${parts[0]}' is not 4 numeric characters`,
      suggestedFix: null,
    });
  } else if (parts[0] && !refData.divisionCodes.has(parts[0])) {
    errors.push({
      rowNumber,
      columnName: "functionalLocation",
      originalValue: parts[0],
      ruleId: "FL-003",
      severity: "error",
      message: `Division code '${parts[0]}' not found in reference table`,
      suggestedFix: null,
    });
  }

  // Level 2: Business Unit (4 numeric)
  if (parts[1] && !/^\d{4}$/.test(parts[1])) {
    errors.push({
      rowNumber,
      columnName: "functionalLocation",
      originalValue: parts[1],
      ruleId: "FL-004",
      severity: "error",
      message: `Level 2 Business Unit '${parts[1]}' is not 4 numeric characters`,
      suggestedFix: null,
    });
  } else if (parts[1] && !refData.businessUnits.has(parts[1])) {
    errors.push({
      rowNumber,
      columnName: "functionalLocation",
      originalValue: parts[1],
      ruleId: "FL-004",
      severity: "error",
      message: `Business Unit '${parts[1]}' not found in reference table`,
      suggestedFix: null,
    });
  }

  // Level 3: AAXX - chars 1-2 alpha site code, chars 3-4 numeric
  if (parts[2]) {
    const siteCode = parts[2].substring(0, 2);
    const numericPart = parts[2].substring(2, 4);

    if (!/^[A-Z]{2}$/.test(siteCode)) {
      errors.push({
        rowNumber,
        columnName: "functionalLocation",
        originalValue: siteCode,
        ruleId: "FL-005",
        severity: "error",
        message: `Level 3 Site Code '${siteCode}' must be 2 alpha characters`,
        suggestedFix: null,
      });
    } else if (!refData.siteCodes.has(siteCode)) {
      errors.push({
        rowNumber,
        columnName: "functionalLocation",
        originalValue: siteCode,
        ruleId: "FL-005",
        severity: "error",
        message: `Site Code '${siteCode}' not found in validated list`,
        suggestedFix: null,
      });
    }

    if (!/^\d{2}$/.test(numericPart)) {
      errors.push({
        rowNumber,
        columnName: "functionalLocation",
        originalValue: numericPart,
        ruleId: "FL-006",
        severity: "error",
        message: `Level 3 chars 3-4 '${numericPart}' must be numeric`,
        suggestedFix: null,
      });
    }
  }

  // Level 4: AXXX - chars 1-2 plant type
  if (parts[3]) {
    const plantType = parts[3].substring(0, 2);
    if (!/^[A-Z]{1}/.test(parts[3])) {
      errors.push({
        rowNumber,
        columnName: "functionalLocation",
        originalValue: parts[3],
        ruleId: "FL-007",
        severity: "error",
        message: `Level 4 must start with alpha character`,
        suggestedFix: null,
      });
    } else if (!refData.plantTypes.has(plantType)) {
      errors.push({
        rowNumber,
        columnName: "functionalLocation",
        originalValue: plantType,
        ruleId: "FL-007",
        severity: "error",
        message: `Plant Type '${plantType}' not found in validated list`,
        suggestedFix: null,
      });
    }
  }

  return errors;
}

function validateMask2Levels(
  fl: string,
  rowNumber: number,
  refData: FLReferenceData,
): ValidationError[] {
  const errors: ValidationError[] = [];
  const parts = fl.split("-");

  // Level 1: NNNNAAXXXX - plant type AA from validated list
  if (parts[0]) {
    const plantType = parts[0].substring(4, 6);
    if (!/^[A-Z]{2}$/.test(plantType)) {
      errors.push({
        rowNumber,
        columnName: "functionalLocation",
        originalValue: plantType,
        ruleId: "FL-007",
        severity: "error",
        message: `Mask 2 Level 1 Plant Type '${plantType}' must be 2 alpha characters`,
        suggestedFix: null,
      });
    } else if (!refData.plantTypes.has(plantType)) {
      errors.push({
        rowNumber,
        columnName: "functionalLocation",
        originalValue: plantType,
        ruleId: "FL-007",
        severity: "error",
        message: `Plant Type '${plantType}' not found in validated list`,
        suggestedFix: null,
      });
    }
  }

  // Levels 2-4: AAAXXX - component code AAA
  for (let i = 1; i <= 3; i++) {
    if (parts[i]) {
      const componentCode = parts[i].substring(0, 3);
      if (!/^[A-Z]{3}$/.test(componentCode)) {
        errors.push({
          rowNumber,
          columnName: "functionalLocation",
          originalValue: componentCode,
          ruleId: "FL-015",
          severity: "error",
          message: `Mask 2 Level ${i + 1} Component code '${componentCode}' must be 3 alpha characters`,
          suggestedFix: null,
        });
      } else if (!refData.componentCodes.has(componentCode)) {
        errors.push({
          rowNumber,
          columnName: "functionalLocation",
          originalValue: componentCode,
          ruleId: "FL-015",
          severity: "error",
          message: `Component code '${componentCode}' not found in validated list`,
          suggestedFix: null,
        });
      }
    }
  }

  return errors;
}

// ─── Main Validation Function ────────────────────────────────────────────────

export function validateFunctionalLocation(
  row: FunctionalLocationRow,
  rowNumber: number,
  refData: FLReferenceData,
  existingFLs: Set<string>,
  uploadFLsSoFar: Set<string>,
): ValidationError[] {
  const errors: ValidationError[] = [];
  const fl = row.functionalLocation;

  // GEN-001: Whitespace check
  if (fl !== fl.trim()) {
    errors.push({
      rowNumber,
      columnName: "functionalLocation",
      originalValue: fl,
      ruleId: "GEN-001",
      severity: "warning",
      message: "Functional Location has leading/trailing whitespace",
      suggestedFix: fl.trim(),
    });
  }

  const trimmedFL = fl.trim();

  // FL-016: Required fields check
  if (!row.description || row.description.trim() === "") {
    errors.push({
      rowNumber,
      columnName: "description",
      originalValue: row.description || null,
      ruleId: "FL-016",
      severity: "error",
      message: "Description is required",
      suggestedFix: null,
    });
  }

  // Detect mask type and validate pattern
  const maskType = row.maskType || detectMaskType(trimmedFL);

  if (!maskType) {
    // Neither mask matched
    errors.push({
      rowNumber,
      columnName: "functionalLocation",
      originalValue: trimmedFL,
      ruleId: "FL-001",
      severity: "error",
      message:
        "Functional Location does not match Mask 1 (NAVI) or Mask 2 (UNIT) pattern",
      suggestedFix: null,
    });
  } else if (maskType === "NAVI") {
    // FL-001: Mask 1 pattern
    if (!MASK1_REGEX.test(trimmedFL)) {
      errors.push({
        rowNumber,
        columnName: "functionalLocation",
        originalValue: trimmedFL,
        ruleId: "FL-001",
        severity: "error",
        message: `Does not match NAVI mask: NNNN-NNNN-AAXX-AXXX-XXXX-XXXX`,
        suggestedFix: null,
      });
    } else {
      errors.push(...validateMask1Levels(trimmedFL, rowNumber, refData));
    }

    // FL-010: NAVI must have ABC=5 and status=NMOB
    if (row.abcIndicator && row.abcIndicator !== "5") {
      errors.push({
        rowNumber,
        columnName: "abcIndicator",
        originalValue: row.abcIndicator,
        ruleId: "FL-010",
        severity: "error",
        message: "NAVI Functional Location must have ABC Indicator = 5",
        suggestedFix: "5",
      });
    }
    if (row.userStatus && row.userStatus !== "NMOB") {
      errors.push({
        rowNumber,
        columnName: "userStatus",
        originalValue: row.userStatus,
        ruleId: "FL-010",
        severity: "error",
        message: "NAVI Functional Location must have User Status = NMOB",
        suggestedFix: "NMOB",
      });
    }
  } else if (maskType === "UNIT") {
    // FL-002: Mask 2 pattern
    if (!MASK2_REGEX.test(trimmedFL)) {
      errors.push({
        rowNumber,
        columnName: "functionalLocation",
        originalValue: trimmedFL,
        ruleId: "FL-002",
        severity: "error",
        message: `Does not match UNIT mask: NNNNAAXXXX-AAAXXX-AAAXXX-AAAXXX-XXXXXXXX`,
        suggestedFix: null,
      });
    } else {
      errors.push(...validateMask2Levels(trimmedFL, rowNumber, refData));
    }
  }

  // FL-008: ABC Indicator must be 1-5
  if (
    row.abcIndicator &&
    !VALID_ABC_INDICATORS.includes(row.abcIndicator as typeof VALID_ABC_INDICATORS[number])
  ) {
    errors.push({
      rowNumber,
      columnName: "abcIndicator",
      originalValue: row.abcIndicator,
      ruleId: "FL-008",
      severity: "error",
      message: `ABC Indicator '${row.abcIndicator}' must be 1-5`,
      suggestedFix: null,
    });
  }

  // FL-009: User Status validation
  if (
    row.userStatus &&
    !VALID_USER_STATUSES.includes(row.userStatus as typeof VALID_USER_STATUSES[number])
  ) {
    errors.push({
      rowNumber,
      columnName: "userStatus",
      originalValue: row.userStatus,
      ruleId: "FL-009",
      severity: "error",
      message: `User Status '${row.userStatus}' must be one of: ${VALID_USER_STATUSES.join(", ")}`,
      suggestedFix: null,
    });
  }

  // FL-011: Superior FL must exist
  if (row.superiorFL && row.superiorFL.trim() !== "") {
    const superiorExists =
      existingFLs.has(row.superiorFL) || uploadFLsSoFar.has(row.superiorFL);
    if (!superiorExists) {
      errors.push({
        rowNumber,
        columnName: "superiorFL",
        originalValue: row.superiorFL,
        ruleId: "FL-011",
        severity: "error",
        message: `Superior FL '${row.superiorFL}' not found in database or preceding rows`,
        suggestedFix: null,
      });
    }
  }

  // FL-012: Duplicate check
  if (uploadFLsSoFar.has(trimmedFL)) {
    errors.push({
      rowNumber,
      columnName: "functionalLocation",
      originalValue: trimmedFL,
      ruleId: "FL-012",
      severity: "warning",
      message: "Duplicate Functional Location found in this upload",
      suggestedFix: null,
    });
  }
  if (existingFLs.has(trimmedFL)) {
    errors.push({
      rowNumber,
      columnName: "functionalLocation",
      originalValue: trimmedFL,
      ruleId: "FL-012",
      severity: "warning",
      message: "Functional Location already exists in the database",
      suggestedFix: null,
    });
  }

  // FL-013: Cost Centre reference
  if (row.costCentre && !refData.costCentres.has(row.costCentre)) {
    errors.push({
      rowNumber,
      columnName: "costCentre",
      originalValue: row.costCentre,
      ruleId: "FL-013",
      severity: "error",
      message: `Cost Centre '${row.costCentre}' not found in reference table`,
      suggestedFix: null,
    });
  }

  // FL-014: Work Centre reference
  if (row.workCentre && !refData.workCentres.has(row.workCentre)) {
    errors.push({
      rowNumber,
      columnName: "workCentre",
      originalValue: row.workCentre,
      ruleId: "FL-014",
      severity: "error",
      message: `Work Centre '${row.workCentre}' not found in reference table`,
      suggestedFix: null,
    });
  }

  // GEN-002: Special characters in code fields
  if (/[^A-Za-z0-9\-_]/.test(trimmedFL)) {
    errors.push({
      rowNumber,
      columnName: "functionalLocation",
      originalValue: trimmedFL,
      ruleId: "GEN-002",
      severity: "error",
      message: "Functional Location contains invalid special characters",
      suggestedFix: null,
    });
  }

  return errors;
}

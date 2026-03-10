// ─── Validation Rule Definitions ─────────────────────────────────────────────
// Every rule from Section 3.4 of the architecture document.
// Each rule has a unique ID for traceability in test cases and error reports.

export type Severity = "error" | "warning";

export interface ValidationRule {
  ruleId: string;
  dataType: string;
  description: string;
  severity: Severity;
  source: string;
}

export const RULES: Record<string, ValidationRule> = {
  // ─── Functional Location Rules ──────────────────────────────────────────
  "FL-001": {
    ruleId: "FL-001",
    dataType: "functional_location",
    description:
      "Mask 1 pattern: NNNN-NNNN-AAXX-AXXX-XXXX-XXXX",
    severity: "error",
    source: "BPD315",
  },
  "FL-002": {
    ruleId: "FL-002",
    dataType: "functional_location",
    description:
      "Mask 2 pattern: NNNNAAXXXX-AAAXXX-AAAXXX-AAAXXX-XXXXXXXX",
    severity: "error",
    source: "BPD315",
  },
  "FL-003": {
    ruleId: "FL-003",
    dataType: "functional_location",
    description: "Level 1 Division code must exist in reference table",
    severity: "error",
    source: "BPD315",
  },
  "FL-004": {
    ruleId: "FL-004",
    dataType: "functional_location",
    description: "Level 2 Business Unit must exist in reference table",
    severity: "error",
    source: "BPD315",
  },
  "FL-005": {
    ruleId: "FL-005",
    dataType: "functional_location",
    description:
      "Level 3 Site Code chars 1-2 must be validated alpha (ME, LW, IF, etc.)",
    severity: "error",
    source: "BPD315",
  },
  "FL-006": {
    ruleId: "FL-006",
    dataType: "functional_location",
    description: "Level 3 chars 3-4 must be numeric",
    severity: "error",
    source: "BPD315",
  },
  "FL-007": {
    ruleId: "FL-007",
    dataType: "functional_location",
    description:
      "Level 4 Plant Type chars 1-2 from validated list (TR, DZ, CV, etc.)",
    severity: "error",
    source: "BPD315",
  },
  "FL-008": {
    ruleId: "FL-008",
    dataType: "functional_location",
    description: "ABC Indicator must be 1-5",
    severity: "error",
    source: "BPD315",
  },
  "FL-009": {
    ruleId: "FL-009",
    dataType: "functional_location",
    description: "User Status must be INIT/ACTV/INAC/PARK/RTRD/NMOB",
    severity: "error",
    source: "BPD315",
  },
  "FL-010": {
    ruleId: "FL-010",
    dataType: "functional_location",
    description: "Mask 1 (NAVI) must have ABC=5 and status=NMOB",
    severity: "error",
    source: "BPD315",
  },
  "FL-011": {
    ruleId: "FL-011",
    dataType: "functional_location",
    description: "Superior FL must exist (parent before child)",
    severity: "error",
    source: "BPD315",
  },
  "FL-012": {
    ruleId: "FL-012",
    dataType: "functional_location",
    description:
      "Duplicate check: no matching FL in current upload or DB",
    severity: "warning",
    source: "BPD315",
  },
  "FL-013": {
    ruleId: "FL-013",
    dataType: "functional_location",
    description: "Cost Centre must exist in reference table",
    severity: "error",
    source: "BPD315",
  },
  "FL-014": {
    ruleId: "FL-014",
    dataType: "functional_location",
    description: "Work Centre must exist in reference table",
    severity: "error",
    source: "BPD315",
  },
  "FL-015": {
    ruleId: "FL-015",
    dataType: "functional_location",
    description: "Mask 2 Component code (AAA) must be from validated list",
    severity: "error",
    source: "BPD315",
  },
  "FL-016": {
    ruleId: "FL-016",
    dataType: "functional_location",
    description:
      "No empty/null required fields (Description, Category, etc.)",
    severity: "error",
    source: "General",
  },

  // ─── Maintenance Plan Rules ─────────────────────────────────────────────
  "MP-001": {
    ruleId: "MP-001",
    dataType: "maintenance_plan",
    description: "Name max 40 characters",
    severity: "error",
    source: "GCAA Naming",
  },
  "MP-002": {
    ruleId: "MP-002",
    dataType: "maintenance_plan",
    description: "Fleet Designator must match registered fleet codes",
    severity: "error",
    source: "GCAA Naming",
  },
  "MP-003": {
    ruleId: "MP-003",
    dataType: "maintenance_plan",
    description: "Action Code must be uppercase and from validated list",
    severity: "error",
    source: "GCAA Naming",
  },
  "MP-004": {
    ruleId: "MP-004",
    dataType: "maintenance_plan",
    description:
      "Frequency format must follow standard (WKLY, HR, YRLY etc.)",
    severity: "warning",
    source: "GCAA Naming",
  },
  "MP-005": {
    ruleId: "MP-005",
    dataType: "maintenance_plan",
    description: "Process Code must align with FL Site Codes",
    severity: "error",
    source: "GCAA Naming",
  },

  // ─── Task List Rules ────────────────────────────────────────────────────
  "TL-001": {
    ruleId: "TL-001",
    dataType: "task_list",
    description: "Header max 40 characters",
    severity: "error",
    source: "GCAA Naming",
  },
  "TL-002": {
    ruleId: "TL-002",
    dataType: "task_list",
    description: "Operation description max 40 characters",
    severity: "error",
    source: "GCAA Naming",
  },
  "TL-003": {
    ruleId: "TL-003",
    dataType: "task_list",
    description: "Location Code from validated list if used",
    severity: "warning",
    source: "GCAA Naming",
  },

  // ─── Equipment Rules ────────────────────────────────────────────────────
  "EQ-001": {
    ruleId: "EQ-001",
    dataType: "equipment",
    description: "Equipment number format validation",
    severity: "error",
    source: "General",
  },
  "EQ-002": {
    ruleId: "EQ-002",
    dataType: "equipment",
    description: "Must reference valid Functional Location",
    severity: "error",
    source: "General",
  },

  // ─── General Rules (All Types) ──────────────────────────────────────────
  "GEN-001": {
    ruleId: "GEN-001",
    dataType: "all",
    description: "No trailing/leading whitespace in any field",
    severity: "warning",
    source: "General",
  },
  "GEN-002": {
    ruleId: "GEN-002",
    dataType: "all",
    description: "No special characters in code fields",
    severity: "error",
    source: "General",
  },
  "GEN-003": {
    ruleId: "GEN-003",
    dataType: "all",
    description: "Character encoding must be UTF-8",
    severity: "warning",
    source: "General",
  },
};

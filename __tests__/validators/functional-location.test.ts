import { describe, it, expect } from "vitest";
import {
  validateFunctionalLocation,
  type FunctionalLocationRow,
  type FLReferenceData,
} from "@/lib/validators/functional-location";

// ─── Test Reference Data ─────────────────────────────────────────────────────

const refData: FLReferenceData = {
  divisionCodes: new Set(["1000", "2000"]),
  businessUnits: new Set(["1001", "1002"]),
  siteCodes: new Set(["ME", "LW", "IF"]),
  plantTypes: new Set(["TR", "DZ", "CV"]),
  componentCodes: new Set(["ENG", "PMP", "MTR"]),
  costCentres: new Set(["CC01", "CC02"]),
  workCentres: new Set(["WC01", "WC02"]),
};

const emptyExisting = new Set<string>();
const emptyUpload = new Set<string>();

function makeRow(overrides: Partial<FunctionalLocationRow> = {}): FunctionalLocationRow {
  return {
    functionalLocation: "1000-1001-ME01-TR01-0000-0000",
    description: "Test Functional Location",
    ...overrides,
  };
}

// ─── FL-001: Mask 1 Pattern ──────────────────────────────────────────────────

describe("FL-001: Mask 1 (NAVI) pattern validation", () => {
  it("accepts valid Mask 1 pattern", () => {
    const row = makeRow();
    const errors = validateFunctionalLocation(row, 1, refData, emptyExisting, emptyUpload);
    const fl001Errors = errors.filter((e) => e.ruleId === "FL-001");
    expect(fl001Errors).toHaveLength(0);
  });

  it("rejects invalid Mask 1 pattern", () => {
    const row = makeRow({ functionalLocation: "ABCD-1001-ME01-TR01-0000-0000" });
    const errors = validateFunctionalLocation(row, 1, refData, emptyExisting, emptyUpload);
    const fl001Errors = errors.filter((e) => e.ruleId === "FL-001");
    expect(fl001Errors.length).toBeGreaterThan(0);
  });
});

// ─── FL-003: Division Code ───────────────────────────────────────────────────

describe("FL-003: Division code reference check", () => {
  it("accepts valid division code", () => {
    const row = makeRow();
    const errors = validateFunctionalLocation(row, 1, refData, emptyExisting, emptyUpload);
    const fl003Errors = errors.filter((e) => e.ruleId === "FL-003");
    expect(fl003Errors).toHaveLength(0);
  });

  it("rejects unknown division code", () => {
    const row = makeRow({ functionalLocation: "9999-1001-ME01-TR01-0000-0000" });
    const errors = validateFunctionalLocation(row, 1, refData, emptyExisting, emptyUpload);
    const fl003Errors = errors.filter((e) => e.ruleId === "FL-003");
    expect(fl003Errors).toHaveLength(1);
  });
});

// ─── FL-005: Site Code ───────────────────────────────────────────────────────

describe("FL-005: Site Code validation", () => {
  it("accepts valid site code", () => {
    const row = makeRow({ functionalLocation: "1000-1001-LW01-TR01-0000-0000" });
    const errors = validateFunctionalLocation(row, 1, refData, emptyExisting, emptyUpload);
    const fl005Errors = errors.filter((e) => e.ruleId === "FL-005");
    expect(fl005Errors).toHaveLength(0);
  });

  it("rejects unknown site code", () => {
    const row = makeRow({ functionalLocation: "1000-1001-ZZ01-TR01-0000-0000" });
    const errors = validateFunctionalLocation(row, 1, refData, emptyExisting, emptyUpload);
    const fl005Errors = errors.filter((e) => e.ruleId === "FL-005");
    expect(fl005Errors).toHaveLength(1);
  });
});

// ─── FL-008: ABC Indicator ───────────────────────────────────────────────────

describe("FL-008: ABC Indicator validation", () => {
  it("accepts valid ABC indicator (1-5)", () => {
    const row = makeRow({ abcIndicator: "3" });
    const errors = validateFunctionalLocation(row, 1, refData, emptyExisting, emptyUpload);
    const fl008Errors = errors.filter((e) => e.ruleId === "FL-008");
    expect(fl008Errors).toHaveLength(0);
  });

  it("rejects invalid ABC indicator", () => {
    const row = makeRow({ abcIndicator: "7" });
    const errors = validateFunctionalLocation(row, 1, refData, emptyExisting, emptyUpload);
    const fl008Errors = errors.filter((e) => e.ruleId === "FL-008");
    expect(fl008Errors).toHaveLength(1);
  });
});

// ─── FL-009: User Status ─────────────────────────────────────────────────────

describe("FL-009: User Status validation", () => {
  it("accepts valid user status", () => {
    for (const status of ["INIT", "ACTV", "INAC", "PARK", "RTRD", "NMOB"]) {
      const row = makeRow({ userStatus: status });
      const errors = validateFunctionalLocation(row, 1, refData, emptyExisting, emptyUpload);
      const fl009Errors = errors.filter((e) => e.ruleId === "FL-009");
      expect(fl009Errors).toHaveLength(0);
    }
  });

  it("rejects invalid user status", () => {
    const row = makeRow({ userStatus: "INVALID" });
    const errors = validateFunctionalLocation(row, 1, refData, emptyExisting, emptyUpload);
    const fl009Errors = errors.filter((e) => e.ruleId === "FL-009");
    expect(fl009Errors).toHaveLength(1);
  });
});

// ─── FL-010: NAVI must have ABC=5 and status=NMOB ────────────────────────────

describe("FL-010: NAVI FL constraints", () => {
  it("errors when NAVI FL has ABC != 5", () => {
    const row = makeRow({ maskType: "NAVI", abcIndicator: "3" });
    const errors = validateFunctionalLocation(row, 1, refData, emptyExisting, emptyUpload);
    const fl010Errors = errors.filter((e) => e.ruleId === "FL-010");
    expect(fl010Errors.length).toBeGreaterThan(0);
  });

  it("errors when NAVI FL has status != NMOB", () => {
    const row = makeRow({ maskType: "NAVI", userStatus: "ACTV" });
    const errors = validateFunctionalLocation(row, 1, refData, emptyExisting, emptyUpload);
    const fl010Errors = errors.filter((e) => e.ruleId === "FL-010");
    expect(fl010Errors.length).toBeGreaterThan(0);
  });
});

// ─── FL-011: Superior FL ─────────────────────────────────────────────────────

describe("FL-011: Superior FL must exist", () => {
  it("errors when superior FL is not found", () => {
    const row = makeRow({ superiorFL: "NONEXISTENT-FL" });
    const errors = validateFunctionalLocation(row, 1, refData, emptyExisting, emptyUpload);
    const fl011Errors = errors.filter((e) => e.ruleId === "FL-011");
    expect(fl011Errors).toHaveLength(1);
  });

  it("passes when superior FL exists in preceding rows", () => {
    const preceding = new Set(["1000-1001-ME01-TR01-0000-0000"]);
    const row = makeRow({
      functionalLocation: "1000-1001-ME01-TR02-0000-0000",
      superiorFL: "1000-1001-ME01-TR01-0000-0000",
    });
    const errors = validateFunctionalLocation(row, 2, refData, emptyExisting, preceding);
    const fl011Errors = errors.filter((e) => e.ruleId === "FL-011");
    expect(fl011Errors).toHaveLength(0);
  });
});

// ─── FL-012: Duplicate Check ─────────────────────────────────────────────────

describe("FL-012: Duplicate detection", () => {
  it("warns on duplicate within upload", () => {
    const preceding = new Set(["1000-1001-ME01-TR01-0000-0000"]);
    const row = makeRow();
    const errors = validateFunctionalLocation(row, 2, refData, emptyExisting, preceding);
    const fl012Errors = errors.filter((e) => e.ruleId === "FL-012");
    expect(fl012Errors.length).toBeGreaterThan(0);
  });

  it("warns on duplicate in database", () => {
    const existingDb = new Set(["1000-1001-ME01-TR01-0000-0000"]);
    const row = makeRow();
    const errors = validateFunctionalLocation(row, 1, refData, existingDb, emptyUpload);
    const fl012Errors = errors.filter((e) => e.ruleId === "FL-012");
    expect(fl012Errors.length).toBeGreaterThan(0);
  });
});

// ─── FL-016: Required Fields ─────────────────────────────────────────────────

describe("FL-016: Required fields", () => {
  it("errors when description is empty", () => {
    const row = makeRow({ description: "" });
    const errors = validateFunctionalLocation(row, 1, refData, emptyExisting, emptyUpload);
    const fl016Errors = errors.filter((e) => e.ruleId === "FL-016");
    expect(fl016Errors).toHaveLength(1);
  });
});

// ─── GEN-001: Whitespace ─────────────────────────────────────────────────────

describe("GEN-001: Whitespace detection", () => {
  it("warns on leading whitespace", () => {
    const row = makeRow({ functionalLocation: " 1000-1001-ME01-TR01-0000-0000" });
    const errors = validateFunctionalLocation(row, 1, refData, emptyExisting, emptyUpload);
    const gen001Errors = errors.filter((e) => e.ruleId === "GEN-001");
    expect(gen001Errors.length).toBeGreaterThan(0);
    expect(gen001Errors[0].suggestedFix).toBe("1000-1001-ME01-TR01-0000-0000");
  });
});

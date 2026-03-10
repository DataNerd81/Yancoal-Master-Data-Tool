import { describe, it, expect } from "vitest";
import {
  validateMaintenancePlan,
  type MaintenancePlanRow,
} from "@/lib/validators/maintenance-plan";

const refData = {
  fleetCodes: new Set(["D10T", "D11T", "CAT789D"]),
  actionCodes: new Set(["INSPECTION", "SERVICE", "OVERHAUL", "REPLACEMENT"]),
  siteCodes: new Set(["ME", "LW", "IF"]),
};

function makeRow(
  overrides: Partial<MaintenancePlanRow> = {},
): MaintenancePlanRow {
  return {
    planName: "D10T MECH Inspection Weekly",
    ...overrides,
  };
}

describe("MP-001: Name max 40 characters", () => {
  it("accepts name within 40 chars", () => {
    const row = makeRow({ planName: "A".repeat(40) });
    const errors = validateMaintenancePlan(row, 1, refData);
    const mp001 = errors.filter((e) => e.ruleId === "MP-001");
    expect(mp001).toHaveLength(0);
  });

  it("rejects name exceeding 40 chars", () => {
    const row = makeRow({ planName: "A".repeat(41) });
    const errors = validateMaintenancePlan(row, 1, refData);
    const mp001 = errors.filter((e) => e.ruleId === "MP-001");
    expect(mp001).toHaveLength(1);
    expect(mp001[0].suggestedFix).toHaveLength(40);
  });
});

describe("MP-002: Fleet Designator validation", () => {
  it("accepts valid fleet code", () => {
    const row = makeRow({ fleetDesignator: "D10T" });
    const errors = validateMaintenancePlan(row, 1, refData);
    const mp002 = errors.filter((e) => e.ruleId === "MP-002");
    expect(mp002).toHaveLength(0);
  });

  it("rejects unknown fleet code", () => {
    const row = makeRow({ fleetDesignator: "UNKNOWN" });
    const errors = validateMaintenancePlan(row, 1, refData);
    const mp002 = errors.filter((e) => e.ruleId === "MP-002");
    expect(mp002).toHaveLength(1);
  });
});

describe("MP-003: Action Code must be uppercase", () => {
  it("accepts uppercase action code from list", () => {
    const row = makeRow({ actionCode: "INSPECTION" });
    const errors = validateMaintenancePlan(row, 1, refData);
    const mp003 = errors.filter((e) => e.ruleId === "MP-003");
    expect(mp003).toHaveLength(0);
  });

  it("rejects lowercase action code", () => {
    const row = makeRow({ actionCode: "inspection" });
    const errors = validateMaintenancePlan(row, 1, refData);
    const mp003 = errors.filter((e) => e.ruleId === "MP-003");
    expect(mp003.length).toBeGreaterThan(0);
  });
});

describe("MP-004: Frequency format", () => {
  it("accepts standard frequency", () => {
    const row = makeRow({ frequency: "WKLY" });
    const errors = validateMaintenancePlan(row, 1, refData);
    const mp004 = errors.filter((e) => e.ruleId === "MP-004");
    expect(mp004).toHaveLength(0);
  });

  it("warns on non-standard frequency", () => {
    const row = makeRow({ frequency: "BIWEEKLY" });
    const errors = validateMaintenancePlan(row, 1, refData);
    const mp004 = errors.filter((e) => e.ruleId === "MP-004");
    expect(mp004).toHaveLength(1);
    expect(mp004[0].severity).toBe("warning");
  });
});

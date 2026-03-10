import { eq, and } from "drizzle-orm";
import { db } from "..";
import { referenceCodes, referenceMasks, dataTypeTemplates } from "../schema";

export async function getReferenceCodesByType(codeType: string) {
  return db
    .select()
    .from(referenceCodes)
    .where(
      and(
        eq(referenceCodes.codeType, codeType),
        eq(referenceCodes.isActive, true),
      ),
    );
}

export async function getCodeSet(codeType: string): Promise<Set<string>> {
  const codes = await getReferenceCodesByType(codeType);
  return new Set(codes.map((c) => c.code));
}

export async function getMasksForDataType(
  dataType: "functional_location" | "equipment" | "maintenance_plan" | "task_list" | "work_centre" | "bom",
) {
  return db
    .select()
    .from(referenceMasks)
    .where(eq(referenceMasks.dataType, dataType))
    .orderBy(referenceMasks.level);
}

export async function getTemplateColumns(
  dataType: "functional_location" | "equipment" | "maintenance_plan" | "task_list" | "work_centre" | "bom",
) {
  return db
    .select()
    .from(dataTypeTemplates)
    .where(eq(dataTypeTemplates.dataType, dataType))
    .orderBy(dataTypeTemplates.columnIndex);
}

export async function upsertReferenceCode(
  codeType: string,
  code: string,
  description?: string,
) {
  const existing = await db
    .select()
    .from(referenceCodes)
    .where(
      and(eq(referenceCodes.codeType, codeType), eq(referenceCodes.code, code)),
    );

  if (existing.length > 0) {
    const [updated] = await db
      .update(referenceCodes)
      .set({ description, isActive: true, updatedAt: new Date() })
      .where(eq(referenceCodes.id, existing[0].id))
      .returning();
    return updated;
  }

  const [created] = await db
    .insert(referenceCodes)
    .values({ codeType, code, description })
    .returning();
  return created;
}

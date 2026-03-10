import { desc } from "drizzle-orm";
import { db } from "..";
import { auditLog } from "../schema";

export async function createAuditEntry(data: {
  userId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
}) {
  const [entry] = await db.insert(auditLog).values(data).returning();
  return entry;
}

export async function getRecentAuditLog(limit = 50) {
  return db
    .select()
    .from(auditLog)
    .orderBy(desc(auditLog.createdAt))
    .limit(limit);
}

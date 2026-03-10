import { eq, desc } from "drizzle-orm";
import { db } from "..";
import { uploads, validationResults, type NewUpload } from "../schema";

export async function createUpload(data: NewUpload) {
  const [upload] = await db.insert(uploads).values(data).returning();
  return upload;
}

export async function updateUploadStatus(
  uploadId: string,
  status: "processing" | "complete" | "failed",
  counts?: {
    rowCount: number;
    errorCount: number;
    warningCount: number;
    cleanCount: number;
  },
) {
  const values: Record<string, unknown> = { status };
  if (counts) {
    Object.assign(values, counts);
  }
  if (status === "complete" || status === "failed") {
    values.completedAt = new Date();
  }

  const [updated] = await db
    .update(uploads)
    .set(values)
    .where(eq(uploads.id, uploadId))
    .returning();
  return updated;
}

export async function getUploadsByUser(userId: string) {
  return db
    .select()
    .from(uploads)
    .where(eq(uploads.userId, userId))
    .orderBy(desc(uploads.createdAt));
}

export async function getAllUploads() {
  return db.select().from(uploads).orderBy(desc(uploads.createdAt));
}

export async function getUploadById(uploadId: string) {
  const [upload] = await db
    .select()
    .from(uploads)
    .where(eq(uploads.id, uploadId));
  return upload;
}

export async function getValidationResults(uploadId: string) {
  return db
    .select()
    .from(validationResults)
    .where(eq(validationResults.uploadId, uploadId))
    .orderBy(validationResults.rowNumber);
}

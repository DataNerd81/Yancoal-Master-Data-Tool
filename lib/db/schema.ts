import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";

// ─── Enums ───────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum("user_role", [
  "admin",
  "data_steward",
  "uploader",
  "viewer",
]);

export const uploadStatusEnum = pgEnum("upload_status", [
  "processing",
  "complete",
  "failed",
]);

export const severityEnum = pgEnum("severity", ["error", "warning"]);

export const dataTypeEnum = pgEnum("data_type", [
  "functional_location",
  "equipment",
  "maintenance_plan",
  "task_list",
  "work_centre",
  "bom",
]);

// ─── Users ───────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkUserId: text("clerk_user_id").unique().notNull(),
  email: text("email").notNull(),
  name: text("name"),
  role: userRoleEnum("role").notNull().default("uploader"),
  orgId: text("org_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Uploads ─────────────────────────────────────────────────────────────────

export const uploads = pgTable("uploads", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  filename: text("filename").notNull(),
  dataType: dataTypeEnum("data_type").notNull(),
  status: uploadStatusEnum("status").notNull().default("processing"),
  rowCount: integer("row_count").default(0),
  errorCount: integer("error_count").default(0),
  warningCount: integer("warning_count").default(0),
  cleanCount: integer("clean_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

// ─── Validation Results ──────────────────────────────────────────────────────

export const validationResults = pgTable("validation_results", {
  id: uuid("id").primaryKey().defaultRandom(),
  uploadId: uuid("upload_id")
    .references(() => uploads.id, { onDelete: "cascade" })
    .notNull(),
  rowNumber: integer("row_number").notNull(),
  columnName: text("column_name").notNull(),
  originalValue: text("original_value"),
  ruleId: text("rule_id").notNull(),
  severity: severityEnum("severity").notNull(),
  message: text("message").notNull(),
  suggestedFix: text("suggested_fix"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Reference Codes ─────────────────────────────────────────────────────────

export const referenceCodes = pgTable("reference_codes", {
  id: uuid("id").primaryKey().defaultRandom(),
  codeType: text("code_type").notNull(),
  code: text("code").notNull(),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Reference Masks ─────────────────────────────────────────────────────────

export const referenceMasks = pgTable("reference_masks", {
  id: uuid("id").primaryKey().defaultRandom(),
  dataType: dataTypeEnum("data_type").notNull(),
  maskName: text("mask_name").notNull(),
  level: integer("level").notNull(),
  maskPattern: text("mask_pattern").notNull(),
  charRules: jsonb("char_rules"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Data Type Templates ─────────────────────────────────────────────────────

export const dataTypeTemplates = pgTable("data_type_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  dataType: dataTypeEnum("data_type").notNull(),
  columnName: text("column_name").notNull(),
  columnIndex: integer("column_index").notNull(),
  isRequired: boolean("is_required").notNull().default(true),
  description: text("description"),
});

// ─── Audit Log ───────────────────────────────────────────────────────────────

export const auditLog = pgTable("audit_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  action: text("action").notNull(),
  resourceType: text("resource_type").notNull(),
  resourceId: text("resource_id"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Type Exports ────────────────────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Upload = typeof uploads.$inferSelect;
export type NewUpload = typeof uploads.$inferInsert;
export type ValidationResult = typeof validationResults.$inferSelect;
export type NewValidationResult = typeof validationResults.$inferInsert;
export type ReferenceCode = typeof referenceCodes.$inferSelect;
export type AuditLogEntry = typeof auditLog.$inferSelect;

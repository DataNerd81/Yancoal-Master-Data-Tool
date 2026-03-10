// ─── RBAC Role Definitions (Section 5.1) ─────────────────────────────────────

export const ROLES = {
  ADMIN: "admin",
  DATA_STEWARD: "data_steward",
  UPLOADER: "uploader",
  VIEWER: "viewer",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const PERMISSIONS = {
  // Upload
  UPLOAD_CREATE: "upload:create",
  UPLOAD_VIEW_OWN: "upload:view_own",
  UPLOAD_VIEW_ALL: "upload:view_all",
  UPLOAD_EXPORT: "upload:export",
  // Reference Data
  REF_VIEW: "reference:view",
  REF_CREATE: "reference:create",
  REF_EDIT: "reference:edit",
  REF_DELETE: "reference:delete",
  // Admin
  ADMIN_USERS: "admin:users",
  ADMIN_AUDIT: "admin:audit",
  ADMIN_SETTINGS: "admin:settings",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: Object.values(PERMISSIONS),
  data_steward: [
    PERMISSIONS.UPLOAD_CREATE,
    PERMISSIONS.UPLOAD_VIEW_ALL,
    PERMISSIONS.UPLOAD_EXPORT,
    PERMISSIONS.REF_VIEW,
    PERMISSIONS.REF_CREATE,
    PERMISSIONS.REF_EDIT,
  ],
  uploader: [
    PERMISSIONS.UPLOAD_CREATE,
    PERMISSIONS.UPLOAD_VIEW_OWN,
    PERMISSIONS.UPLOAD_EXPORT,
    PERMISSIONS.REF_VIEW,
  ],
  viewer: [
    PERMISSIONS.UPLOAD_VIEW_ALL,
    PERMISSIONS.UPLOAD_EXPORT,
    PERMISSIONS.REF_VIEW,
  ],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function getAllPermissions(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

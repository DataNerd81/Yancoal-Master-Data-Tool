"use client";

import { useState, useEffect, useCallback } from "react";

interface User {
  id: string;
  clerkUserId: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
}

interface AuditEntry {
  id: string;
  userId: string | null;
  action: string;
  resourceType: string;
  resourceId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

interface UploadRecord {
  id: string;
  filename: string;
  dataType: string;
  status: string;
  rowCount: number;
  errorCount: number;
  warningCount: number;
  cleanCount: number;
  createdAt: string;
  completedAt: string | null;
}

const ROLES = ["admin", "data_steward", "uploader", "viewer"] as const;

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"users" | "audit" | "uploads">(
    "users",
  );
  const [users, setUsers] = useState<User[]>([]);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [uploads, setUploads] = useState<UploadRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint =
        activeTab === "users"
          ? "/api/admin/users"
          : activeTab === "audit"
            ? "/api/admin/audit"
            : "/api/admin/uploads";

      const res = await fetch(endpoint);
      if (!res.ok) throw new Error(`Failed to fetch ${activeTab}`);
      const data = await res.json();

      if (activeTab === "users") setUsers(data.users || []);
      else if (activeTab === "audit") setAuditLog(data.entries || []);
      else setUploads(data.uploads || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (!res.ok) throw new Error("Failed to update role");
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update role");
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("en-AU", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Admin Panel
        </h1>
        <p className="mt-1 text-zinc-500">
          Manage users, roles, and view audit logs
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(["users", "audit", "uploads"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            }`}
          >
            {tab === "users"
              ? "Users"
              : tab === "audit"
                ? "Audit Log"
                : "Upload History"}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-900">
              <tr>
                <th className="px-4 py-3 font-medium text-zinc-500">Name</th>
                <th className="px-4 py-3 font-medium text-zinc-500">Email</th>
                <th className="px-4 py-3 font-medium text-zinc-500">Role</th>
                <th className="px-4 py-3 font-medium text-zinc-500">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-950">
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-12 text-center text-zinc-400"
                  >
                    Loading...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-12 text-center text-zinc-400"
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-3 text-zinc-900 dark:text-zinc-100">
                      {user.name || "—"}
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                      {user.email}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={user.role}
                        onChange={(e) =>
                          handleRoleChange(user.id, e.target.value)
                        }
                        className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-xs dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                      >
                        {ROLES.map((role) => (
                          <option key={role} value={role}>
                            {role.replace(/_/g, " ")}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-500">
                      {formatDate(user.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Audit Log Tab */}
      {activeTab === "audit" && (
        <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-900">
              <tr>
                <th className="px-4 py-3 font-medium text-zinc-500">Time</th>
                <th className="px-4 py-3 font-medium text-zinc-500">Action</th>
                <th className="px-4 py-3 font-medium text-zinc-500">
                  Resource
                </th>
                <th className="px-4 py-3 font-medium text-zinc-500">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-950">
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-12 text-center text-zinc-400"
                  >
                    Loading...
                  </td>
                </tr>
              ) : auditLog.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-12 text-center text-zinc-400"
                  >
                    No audit entries yet. Activity will appear here as users
                    upload files and make changes.
                  </td>
                </tr>
              ) : (
                auditLog.map((entry) => (
                  <tr key={entry.id}>
                    <td className="px-4 py-3 text-xs text-zinc-500">
                      {formatDate(entry.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                        {entry.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                      {entry.resourceType}
                      {entry.resourceId && (
                        <span className="ml-1 font-mono text-xs text-zinc-400">
                          {entry.resourceId.substring(0, 8)}...
                        </span>
                      )}
                    </td>
                    <td className="max-w-xs truncate px-4 py-3 text-xs text-zinc-500">
                      {entry.metadata
                        ? JSON.stringify(entry.metadata)
                        : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Upload History Tab */}
      {activeTab === "uploads" && (
        <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-900">
              <tr>
                <th className="px-4 py-3 font-medium text-zinc-500">File</th>
                <th className="px-4 py-3 font-medium text-zinc-500">Type</th>
                <th className="px-4 py-3 font-medium text-zinc-500">Status</th>
                <th className="px-4 py-3 font-medium text-zinc-500">Rows</th>
                <th className="px-4 py-3 font-medium text-zinc-500">Errors</th>
                <th className="px-4 py-3 font-medium text-zinc-500">
                  Warnings
                </th>
                <th className="px-4 py-3 font-medium text-zinc-500">
                  Uploaded
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-950">
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-zinc-400"
                  >
                    Loading...
                  </td>
                </tr>
              ) : uploads.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-zinc-400"
                  >
                    No uploads yet.
                  </td>
                </tr>
              ) : (
                uploads.map((upload) => (
                  <tr key={upload.id}>
                    <td className="px-4 py-3 text-zinc-900 dark:text-zinc-100">
                      {upload.filename}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                        {upload.dataType.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          upload.status === "complete"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                            : upload.status === "failed"
                              ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                              : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                        }`}
                      >
                        {upload.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-zinc-600 dark:text-zinc-400">
                      {upload.rowCount}
                    </td>
                    <td className="px-4 py-3 font-mono text-red-600 dark:text-red-400">
                      {upload.errorCount}
                    </td>
                    <td className="px-4 py-3 font-mono text-yellow-600 dark:text-yellow-400">
                      {upload.warningCount}
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-500">
                      {formatDate(upload.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

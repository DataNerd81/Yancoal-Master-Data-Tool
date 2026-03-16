"use client";

import { useState, useEffect, useCallback } from "react";

const CODE_TYPES = [
  "division",
  "business_unit",
  "site_code",
  "plant_type",
  "component",
  "cost_centre",
  "work_centre",
  "action_code",
  "fleet_code",
  "frequency",
  "location_code",
] as const;

interface ReferenceCode {
  id: string;
  codeType: string;
  code: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ReferenceDataPage() {
  const [selectedType, setSelectedType] = useState<string>(CODE_TYPES[0]);
  const [codes, setCodes] = useState<ReferenceCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchCodes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/reference?codeType=${selectedType}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setCodes(data.codes || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load codes");
      setCodes([]);
    } finally {
      setLoading(false);
    }
  }, [selectedType]);

  useEffect(() => {
    fetchCodes();
  }, [fetchCodes]);

  const handleAdd = async () => {
    if (!newCode.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/reference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codeType: selectedType,
          code: newCode.trim(),
          description: newDescription.trim() || null,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setNewCode("");
      setNewDescription("");
      setShowAddForm(false);
      await fetchCodes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save code");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/reference?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to deactivate");
      await fetchCodes();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to deactivate code",
      );
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Reference Data
        </h1>
        <p className="mt-1 text-zinc-500">
          Manage code tables used for validation
        </p>
      </div>

      <div className="flex gap-6">
        {/* Code Type List */}
        <aside className="w-48 flex-shrink-0">
          <ul className="flex flex-col gap-1">
            {CODE_TYPES.map((ct) => (
              <li key={ct}>
                <button
                  onClick={() => {
                    setSelectedType(ct);
                    setShowAddForm(false);
                  }}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    selectedType === ct
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                      : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  }`}
                >
                  {ct.replace(/_/g, " ")}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Code Table */}
        <div className="flex-1">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold capitalize text-zinc-900 dark:text-zinc-50">
              {selectedType.replace(/_/g, " ")}
            </h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              {showAddForm ? "Cancel" : "Add Code"}
            </button>
          </div>

          {/* Add Form */}
          {showAddForm && (
            <div className="mb-4 flex gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
              <input
                type="text"
                placeholder="Code"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                className="w-32 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              />
              <input
                type="text"
                placeholder="Description"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              />
              <button
                onClick={handleAdd}
                disabled={saving || !newCode.trim()}
                className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-900">
                <tr>
                  <th className="px-4 py-3 font-medium text-zinc-500">Code</th>
                  <th className="px-4 py-3 font-medium text-zinc-500">
                    Description
                  </th>
                  <th className="px-4 py-3 font-medium text-zinc-500">
                    Status
                  </th>
                  <th className="px-4 py-3 font-medium text-zinc-500">
                    Actions
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
                ) : codes.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-12 text-center text-zinc-400"
                    >
                      No reference codes for this category. Click &quot;Add
                      Code&quot; to create one.
                    </td>
                  </tr>
                ) : (
                  codes.map((rc) => (
                    <tr key={rc.id}>
                      <td className="px-4 py-3 font-mono text-zinc-900 dark:text-zinc-100">
                        {rc.code}
                      </td>
                      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                        {rc.description || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                          Active
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDelete(rc.id)}
                          className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Deactivate
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!loading && codes.length > 0 && (
            <p className="mt-2 text-xs text-zinc-400">
              {codes.length} code{codes.length !== 1 ? "s" : ""} loaded
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

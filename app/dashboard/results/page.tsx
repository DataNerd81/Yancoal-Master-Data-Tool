"use client";

import { useState } from "react";

type SeverityFilter = "all" | "error" | "warning";

interface ValidationResultRow {
  id: string;
  rowNumber: number;
  columnName: string;
  originalValue: string | null;
  ruleId: string;
  severity: "error" | "warning";
  message: string;
  suggestedFix: string | null;
}

export default function ResultsPage() {
  const [filter, setFilter] = useState<SeverityFilter>("all");
  const [results] = useState<ValidationResultRow[]>([]);

  const filteredResults =
    filter === "all"
      ? results
      : results.filter((r) => r.severity === filter);

  const errorCount = results.filter((r) => r.severity === "error").length;
  const warningCount = results.filter((r) => r.severity === "warning").length;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Validation Results
        </h1>
        <p className="mt-1 text-zinc-500">
          Review validation errors and warnings
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-sm text-zinc-500">Total Issues</p>
          <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            {results.length}
          </p>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
          <p className="text-sm text-red-600 dark:text-red-400">Errors</p>
          <p className="mt-1 text-2xl font-bold text-red-700 dark:text-red-300">
            {errorCount}
          </p>
        </div>
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-950">
          <p className="text-sm text-yellow-600 dark:text-yellow-400">
            Warnings
          </p>
          <p className="mt-1 text-2xl font-bold text-yellow-700 dark:text-yellow-300">
            {warningCount}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(["all", "error", "warning"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filter === f
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            }`}
          >
            {f === "all" ? "All" : f === "error" ? "Errors" : "Warnings"}
          </button>
        ))}
      </div>

      {/* Results Table */}
      <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-900">
            <tr>
              <th className="px-4 py-3 font-medium text-zinc-500">Row</th>
              <th className="px-4 py-3 font-medium text-zinc-500">Column</th>
              <th className="px-4 py-3 font-medium text-zinc-500">Rule</th>
              <th className="px-4 py-3 font-medium text-zinc-500">Severity</th>
              <th className="px-4 py-3 font-medium text-zinc-500">Message</th>
              <th className="px-4 py-3 font-medium text-zinc-500">
                Suggested Fix
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-950">
            {filteredResults.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-12 text-center text-zinc-400"
                >
                  {results.length === 0
                    ? "No validation results yet. Upload a file to get started."
                    : "No matching results for the selected filter."}
                </td>
              </tr>
            ) : (
              filteredResults.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 font-mono text-zinc-900 dark:text-zinc-100">
                    {r.rowNumber}
                  </td>
                  <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                    {r.columnName}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                      {r.ruleId}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        r.severity === "error"
                          ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                      }`}
                    >
                      {r.severity}
                    </span>
                  </td>
                  <td className="max-w-xs truncate px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {r.message}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-500">
                    {r.suggestedFix || "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Download Button */}
      <button
        disabled={results.length === 0}
        className="max-w-sm rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        Download Annotated Excel
      </button>
    </div>
  );
}

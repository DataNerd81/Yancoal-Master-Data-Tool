"use client";

import { useState } from "react";

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

export default function ReferenceDataPage() {
  const [selectedType, setSelectedType] = useState<string>(CODE_TYPES[0]);

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
                  onClick={() => setSelectedType(ct)}
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
            <button className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300">
              Add Code
            </button>
          </div>

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
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-12 text-center text-zinc-400"
                  >
                    No reference codes loaded yet. Connect to the database and
                    seed initial data.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

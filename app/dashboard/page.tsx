import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          Dashboard
        </h1>
        <p className="mt-1 text-zinc-500">
          Upload and validate SAP Plant Maintenance master data
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Link
          href="/dashboard/upload"
          className="flex flex-col gap-2 rounded-lg border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
        >
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
            Upload File
          </h3>
          <p className="text-sm text-zinc-500">
            Upload an Excel file for validation
          </p>
        </Link>

        <Link
          href="/dashboard/results"
          className="flex flex-col gap-2 rounded-lg border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
        >
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
            View Results
          </h3>
          <p className="text-sm text-zinc-500">
            Review validation results and download reports
          </p>
        </Link>

        <Link
          href="/dashboard/reference-data"
          className="flex flex-col gap-2 rounded-lg border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950"
        >
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
            Reference Data
          </h3>
          <p className="text-sm text-zinc-500">
            Manage code tables and validation masks
          </p>
        </Link>
      </div>

      {/* Stats Placeholder */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "Total Uploads", value: "—" },
          { label: "Errors Found", value: "—" },
          { label: "Warnings", value: "—" },
          { label: "Clean Rows", value: "—" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <p className="text-sm text-zinc-500">{stat.label}</p>
            <p className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

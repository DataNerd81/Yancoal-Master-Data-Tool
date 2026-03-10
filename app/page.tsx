import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <main className="flex max-w-2xl flex-col items-center gap-8 px-6 text-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Yancoal Master Data
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Validation Platform
          </p>
        </div>

        <p className="max-w-md text-zinc-500 dark:text-zinc-400">
          Upload SAP Plant Maintenance master data files and validate them
          against industry naming standards before they enter SAP.
        </p>

        <div className="flex gap-4">
          <Link
            href="/dashboard/upload"
            className="rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Go to Dashboard
          </Link>
        </div>

        <div className="mt-8 grid max-w-lg grid-cols-3 gap-6 text-sm text-zinc-500">
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              30+
            </span>
            <span>Validation Rules</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              6
            </span>
            <span>Data Types</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              50MB
            </span>
            <span>Max Upload</span>
          </div>
        </div>
      </main>
    </div>
  );
}

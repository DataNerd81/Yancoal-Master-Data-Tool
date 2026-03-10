export default function AdminPage() {
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

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* User Management */}
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            User Management
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            View and manage user roles
          </p>
          <div className="mt-4 text-sm text-zinc-400">
            Connect WorkOS to manage users.
          </div>
        </div>

        {/* Audit Log */}
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Audit Log
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            View all system activity
          </p>
          <div className="mt-4 text-sm text-zinc-400">
            No audit entries yet.
          </div>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";

const navItems = [
  { href: "/dashboard/upload", label: "Upload", icon: "📤" },
  { href: "/dashboard/results", label: "Results", icon: "📊" },
  { href: "/dashboard/reference-data", label: "Reference Data", icon: "📋" },
  { href: "/dashboard/admin", label: "Admin", icon: "⚙️" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="border-b border-zinc-200 p-6 dark:border-zinc-800">
          <Link href="/dashboard" className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
            Yancoal MD
          </Link>
          <p className="mt-1 text-xs text-zinc-500">Master Data Validation</p>
        </div>

        <nav className="flex-1 p-4">
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-xs text-zinc-400">v0.1.0</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-zinc-50 dark:bg-zinc-900">
        <div className="mx-auto max-w-6xl p-8">{children}</div>
      </main>
    </div>
  );
}

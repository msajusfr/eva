import type { ReactNode } from "react";
import { FileText } from "lucide-react";
import { EvaLogo } from "../UI/EvaLogo";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <main className="min-h-screen overflow-hidden bg-[#020617] text-slate-50">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_14%_8%,rgba(56,189,248,0.25),transparent_30%),radial-gradient(circle_at_86%_12%,rgba(251,191,36,0.16),transparent_28%),linear-gradient(135deg,#020617_0%,#0f172a_42%,#111827_100%)]" />
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl shadow-lg shadow-blue-950/45 ring-1 ring-white/15">
              <EvaLogo className="h-12 w-12 rounded-2xl" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold tracking-tight sm:text-2xl">
                Club EVA Assistant
              </h1>
              <p className="truncate text-xs text-slate-400 sm:text-sm">
                Questions rapides sur le programme PDF
              </p>
            </div>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-slate-300 sm:flex">
            <FileText size={15} />
            CLUB-EVA-PROGRAMME.pdf
          </div>
        </header>
        {children}
      </div>
    </main>
  );
}

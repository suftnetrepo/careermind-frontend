import Link from "next/link";
import { BarChart3, ShieldCheck, Sparkles } from "lucide-react";

export default function AuthShell({
  children,
  action,
}: {
  children: React.ReactNode;
  action: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_8%_85%,rgba(191,219,254,.25),transparent_25%),radial-gradient(circle_at_92%_10%,rgba(196,181,253,.28),transparent_25%),#f8faff] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto flex max-w-7xl overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_30px_90px_rgba(30,41,59,.12)]">
        <aside className="relative hidden w-[46%] overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 p-12 text-white lg:flex lg:flex-col">
          <div className="absolute -right-28 top-20 h-80 w-80 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
          <Link
            href="/"
            className="relative inline-flex items-center gap-2.5 text-xl font-extrabold tracking-[-.04em]"
          >
            <img src="/interquis-logo.png" alt="" className="h-10 w-10 object-contain" />
            Inter<span className="-ml-2.5 text-indigo-300">quis</span>
          </Link>
          <div className="relative my-auto py-12">
           
            <h2 className="mt-7 max-w-lg text-5xl font-extrabold leading-[1.05] tracking-[-.055em]">
              Build confidence before the conversation matters.
            </h2>
            <p className="mt-6 max-w-md text-base leading-8 text-indigo-100/70">
              Practise realistic interviews, receive focused coaching and turn
              every session into measurable progress.
            </p>
          </div>
          <p className="relative text-xs text-indigo-200/50">
            © 2026 Interquis · Suftnet Ltd
          </p>
        </aside>
        <section className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-20 items-center justify-between px-6 sm:px-10">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-lg font-extrabold tracking-[-.04em] text-slate-950 lg:hidden"
            >
              <img src="/interquis-logo.png" alt="" className="h-9 w-9 object-contain" />
              Inter<span className="-ml-2 text-indigo-600">quis</span>
            </Link>
            <div className="ml-auto hidden sm:block">{action}</div>
          </header>
          <div className="flex justify-center px-6 py-8 sm:px-10 sm:py-10">
            <div className="w-full max-w-md">{children}</div>
          </div>
        </section>
      </div>
    </main>
  );
}

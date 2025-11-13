import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#f6f7fb] text-[#0e2756]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="text-2xl font-extrabold tracking-tight">
          <span className="text-[#0e2756]">pa</span>
          <span className="text-[#ff0f64]">level</span>
        </Link>
      </header>

      <main className="mx-auto max-w-3xl px-6 pb-16 pt-8 text-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#ff0f64]">
          Terms &amp; Conditions
        </p>
        <h1 className="mt-2 text-3xl font-extrabold">Basic usage terms</h1>
        <p className="mt-3 text-[#5f6b85]">
          This is a simple placeholder. For a real launch, replace this with
          proper legal terms.
        </p>
      </main>
    </div>
  );
}

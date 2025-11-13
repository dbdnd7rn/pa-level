import Link from "next/link";

export default function FaqsPage() {
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
          FAQs
        </p>
        <h1 className="mt-2 text-3xl font-extrabold">
          Frequently asked questions
        </h1>

        <div className="mt-4 space-y-4 text-[#5f6b85]">
          <div>
            <p className="font-semibold">
              Do you verify every landlord and property?
            </p>
            <p className="mt-1">
              For the first version, verification is manual and starts with
              landlords you already know or trust.
            </p>
          </div>

          <div>
            <p className="font-semibold">
              How do payments work between students and landlords?
            </p>
            <p className="mt-1">
              Right now, Pa-Level connects people. Payments are handled directly
              between students and landlords.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

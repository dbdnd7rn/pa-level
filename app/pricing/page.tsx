import Link from "next/link";

export default function PricingPage() {
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
          Pricing
        </p>
        <h1 className="mt-2 text-3xl font-extrabold">Early-stage pricing</h1>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-[#5f6b85]">
          <li>Students browse listings for free.</li>
          <li>Landlords list for free during the pilot.</li>
          <li>Later you can add placement fees or featured listings.</li>
        </ul>
      </main>
    </div>
  );
}

import Link from "next/link";

export default function ContactPage() {
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
          Contact
        </p>
        <h1 className="mt-2 text-3xl font-extrabold">
          Talk to the Pa-Level team
        </h1>
        <p className="mt-3 text-[#5f6b85]">
          The easiest way to reach us right now is email.
        </p>

        <div className="mt-6 rounded-3xl bg-white p-6 shadow-[0_18px_40px_rgba(0,0,0,0.08)]">
          <p>
            Email us at{" "}
            <a
              href="mailto:hello@palevel.africa"
              className="font-semibold text-[#ff0f64]"
            >
              hello@palevel.africa
            </a>{" "}
            with:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-[#5f6b85]">
            <li>Your name and campus</li>
            <li>
              A link to the listing you&apos;re asking about (if applicable)
            </li>
            <li>Any questions about pricing, availability or safety</li>
          </ul>
        </div>
      </main>
    </div>
  );
}

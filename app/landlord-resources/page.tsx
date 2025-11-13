// app/landlord-resources/page.tsx
import Link from "next/link";

export default function LandlordResourcesPage() {
  return (
    <div className="min-h-screen bg-[#f6f7fb] text-[#0e2756]">
      {/* TOP NAVBAR */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="text-2xl font-extrabold tracking-tight">
          <span className="text-[#0e2756]">pa</span>
          <span className="text-[#ff0f64]">level</span>
        </Link>

        <nav className="flex items-center gap-6 text-sm font-semibold">
          <Link href="/rooms" className="hidden text-[#0e2756] md:inline">
            Browse rooms
          </Link>
          <Link
            href="/landlord-resources"
            className="hidden text-[#0e2756] md:inline"
          >
            Landlord resources
          </Link>
          <Link
            href="/landlord-signup"
            className="hidden rounded-full bg-[#ff0f64] px-6 py-2 text-sm font-semibold text-white shadow-[0_12px_25px_rgba(255,15,100,0.35)] md:inline"
          >
            Signup
          </Link>
          <Link
            href="/login"
            className="text-sm font-semibold text-[#0e2756]"
          >
            Login
          </Link>
        </nav>
      </header>

      {/* HERO */}
      <section className="bg-gradient-to-b from-[#d1e4ff] to-[#f6f7fb] pb-14 pt-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 md:flex-row md:items-center">
          <div className="md:w-1/2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0e2756]/70">
              Landlord resources
            </p>
            <h1 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">
              90 000+ tenant to landlord connections.
              <br />
              Find your ideal tenant today.
            </h1>
            <p className="mt-3 text-sm text-[#5f6b85]">
              Pa-Level helps you fill your rooms with the right students. Learn
              how pricing works, how to set up a strong listing, and how to
              keep your tenants happy and safe.
            </p>

            {/* THIS is the important button – it goes to /landlord-signup */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/landlord-signup"
                className="rounded-full bg-[#ff0f64] px-8 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(255,15,100,0.45)]"
              >
                + Create your free listing
              </Link>

              <button className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#0e2756] shadow-[0_10px_22px_rgba(0,0,0,0.08)]">
                Hear what other landlords say
              </button>
            </div>
          </div>

          {/* simple “card collage” placeholder for images / stats */}
          <div className="md:w-1/2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="h-40 rounded-3xl bg-[#c8d6ff]" />
              <div className="h-40 rounded-3xl bg-[#f9b4d0]" />
              <div className="h-32 rounded-3xl bg-white px-4 py-3 shadow-[0_18px_35px_rgba(0,0,0,0.12)] sm:col-span-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#a0a6bf]">
                  Snapshot
                </p>
                <p className="mt-2 text-sm font-bold">
                  Average reply time:{" "}
                  <span className="text-[#ff0f64]">under 24 hours</span>
                </p>
                <p className="mt-1 text-xs text-[#5f6b85]">
                  Landlords who respond quickly and keep their listings updated
                  get up to 3× more enquiries.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: COMPREHENSIVE APPLICANT INFO */}
      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="text-2xl font-extrabold">
              Receive comprehensive applicant information
            </h2>
            <p className="mt-3 text-sm text-[#5f6b85]">
              Prefilled applicant information allows you to pre-vet prospective
              tenants before you say yes. You’ll see enough detail to feel
              comfortable, while students keep control of their own data.
            </p>

            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <span className="mr-2 text-[#ff0f64]">✔</span>
                <span className="font-semibold">Personal details</span> – name,
                contact info and basic profile.
              </li>
              <li>
                <span className="mr-2 text-[#ff0f64]">✔</span>
                <span className="font-semibold">Educational information</span> –
                where they study and what they’re studying.
              </li>
              <li>
                <span className="mr-2 text-[#ff0f64]">✔</span>
                <span className="font-semibold">Lease details</span> – preferred
                move-in date, lease length and room type.
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <div className="h-40 rounded-3xl bg-white shadow-[0_18px_35px_rgba(0,0,0,0.08)]" />
            <div className="h-32 rounded-3xl bg-[#e5f0ff]" />
          </div>
        </div>
      </section>

      {/* SECTION: HOW PRICING WORKS */}
      <section className="bg-white py-14">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-2xl font-extrabold">
            How pricing works
          </h2>
          <p className="mt-2 text-center text-sm text-[#5f6b85]">
            Listing is free. You only pay a success fee once Pa-Level helps you
            secure a tenant.
          </p>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl bg-[#f6f7fb] px-5 py-6 text-sm shadow-[0_14px_30px_rgba(0,0,0,0.06)]">
              <h3 className="text-base font-bold">Listing is free</h3>
              <p className="mt-2 text-[#5f6b85]">
                Add as many properties as you like at no cost. Update photos,
                prices and details whenever you need to.
              </p>
            </div>

            <div className="rounded-3xl bg-[#ff0f64] px-5 py-6 text-sm text-white shadow-[0_18px_35px_rgba(255,15,100,0.55)]">
              <h3 className="text-base font-bold">Pay on success</h3>
              <p className="mt-2">
                When a student successfully books through Pa-Level, you pay a
                once-off success fee. No booking, no fee.
              </p>
            </div>

            <div className="rounded-3xl bg-[#f6f7fb] px-5 py-6 text-sm shadow-[0_14px_30px_rgba(0,0,0,0.06)]">
              <h3 className="text-base font-bold">Invoice and fee</h3>
              <p className="mt-2 text-[#5f6b85]">
                We’ll send a clear invoice with all details for your records, so
                you can keep track of every successful placement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: EARNINGS ESTIMATOR (STATIC) */}
      <section className="mx-auto max-w-6xl px-6 py-14">
        <h2 className="text-center text-2xl font-extrabold">
          Estimate how much you could earn
        </h2>
        <p className="mt-2 text-center text-sm text-[#5f6b85]">
          Play around with the numbers to get a feel for what one lease could
          bring in.
        </p>

        <div className="mt-10 grid gap-8 rounded-3xl bg-white px-6 py-6 shadow-[0_18px_35px_rgba(0,0,0,0.08)] md:grid-cols-2">
          <div className="space-y-5 text-sm">
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#5f6b85]">
                Monthly rental (example)
              </label>
              <div className="flex items-center gap-1 rounded-2xl border border-[#d9deef] bg-[#f6f7fb] px-3 py-2">
                <span className="text-xs text-[#5f6b85]">K</span>
                <input
                  className="w-full border-none bg-transparent text-sm outline-none"
                  defaultValue="80,000"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#5f6b85]">
                Lease term
              </label>
              <select className="w-full rounded-2xl border border-[#d9deef] bg-[#f6f7fb] px-3 py-[9px] text-sm outline-none">
                <option>10 months</option>
                <option>12 months</option>
                <option>6 months</option>
              </select>
            </div>
            <div>
              <p className="text-xs text-[#5f6b85]">
                Example: With K80,000 per month over a 10-month lease, you’d
                bring in:
              </p>
              <p className="mt-2 text-2xl font-extrabold text-[#0e2756]">
                K800,000
              </p>
              <p className="text-[11px] text-[#9ba3c4]">
                This is just a rough guide. Use your real prices in your
                listing.
              </p>
            </div>
          </div>

          <div className="space-y-4 rounded-3xl bg-[#f6f7fb] px-5 py-5 text-xs text-[#5f6b85]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#a0a6bf]">
              Pro tips for strong listings
            </p>
            <ul className="space-y-2">
              <li>• Use at least 5 bright, clear photos.</li>
              <li>
                • Be honest about rules and house culture – it attracts the
                right tenants.
              </li>
              <li>
                • Always reply to enquiries quickly; students are often
                comparing a few options.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA SECTION LIKE DIGSCONNECT */}
      <section className="bg-[#eef5f7] py-14">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <h2 className="text-2xl font-extrabold">Landlord resources</h2>
          <p className="mt-3 text-sm text-[#5f6b85]">
            We’ve put together resources and useful tips to help you better
            understand how Pa-Level works. After all, we want your listings to
            do as well as possible: what helps you, helps us.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/landlord-signup"
              className="rounded-full bg-white px-8 py-3 text-sm font-semibold text-[#0e2756] shadow-[0_10px_22px_rgba(0,0,0,0.08)]"
            >
              View landlord resources guide
            </Link>
            <button className="rounded-full bg-[#0e2756] px-10 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(0,0,0,0.4)]">
              Contact us
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#e1e4ef] bg-white py-10 text-xs text-[#7b8199]">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="text-lg font-extrabold text-[#0e2756]">
              pa<span className="text-[#ff0f64]">level</span>
            </div>
            <p className="mt-2 max-w-xs">
              Helping students in Malawi find safe, verified accommodation – and
              making life easier for landlords.
            </p>
          </div>

          <div className="grid flex-1 grid-cols-2 gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#a0a6bf]">
                Find a Pa
              </p>
              <Link href="/rooms" className="block">
                Browse rooms
              </Link>
              <a href="#" className="block">
                Safety on Pa-Level
              </a>
            </div>
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#a0a6bf]">
                Create a listing
              </p>
              <Link href="/landlord-signup" className="block">
                Pricing
              </Link>
              <a href="#" className="block">
                FAQs
              </a>
            </div>
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#a0a6bf]">
                Contact
              </p>
              <a href="#" className="block">
                Terms &amp; Conditions
              </a>
              <a href="#" className="block">
                Privacy policy
              </a>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-[11px] text-[#a0a6bf]">
          © {new Date().getFullYear()} Pa-Level. Inspired by DigsConnect UI.
        </p>
      </footer>
    </div>
  );
}

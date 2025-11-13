// app/landlord-signup/page.tsx
import Link from "next/link";

export default function LandlordSignupPage() {
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
          <button className="hidden rounded-full bg-[#ff0f64] px-6 py-2 text-sm font-semibold text-white shadow-[0_12px_25px_rgba(255,15,100,0.35)] md:inline">
            Signup
          </button>
          <button className="text-sm font-semibold text-[#0e2756]">
            Login
          </button>
        </nav>
      </header>

      {/* HERO STRIP */}
      <section className="bg-gradient-to-b from-[#d1e4ff] to-[#f6f7fb] pb-10 pt-6">
        <div className="mx-auto max-w-4xl px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0e2756]/70">
            For landlords
          </p>
          <h1 className="mt-2 text-3xl font-extrabold leading-tight sm:text-4xl">
            Create your landlord account
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[#5f6b85]">
            We’ll use a few details about you and your property to match you
            with the right students in Malawi. You can finish your listing in
            minutes and update it anytime.
          </p>

          {/* Stepper */}
          <div className="mt-6 flex items-center gap-3 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ff0f64] text-[11px] text-white">
                1
              </div>
              <span>Landlord details</span>
            </div>
            <div className="h-px flex-1 bg-[#c9d0ea]" />
            <div className="flex items-center gap-2 text-[#9ba3c4]">
              <div className="flex h-7 w-7 items-center justify-center rounded-full border border-[#c9d0ea] text-[11px]">
                2
              </div>
              <span>Listing details</span>
            </div>
          </div>
        </div>
      </section>

      {/* FORM CARD */}
      <main className="mx-auto max-w-4xl px-6 pb-16">
        <div className="-mt-10 rounded-3xl bg-white px-6 py-7 shadow-[0_22px_45px_rgba(0,0,0,0.12)] sm:px-8">
          <div className="grid gap-8 md:grid-cols-[1.3fr,1fr]">
            {/* LEFT: FORM FIELDS */}
            <div className="space-y-6 text-sm">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a0a6bf]">
                  Step 1 of 2
                </p>
                <h2 className="mt-1 text-lg font-extrabold">
                  Tell us about you
                </h2>
                <p className="mt-1 text-xs text-[#5f6b85]">
                  These details help students know who they’re talking to and
                  where your rooms are based.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#5f6b85]">
                    First name
                  </label>
                  <input
                    className="w-full rounded-2xl border border-[#d9deef] bg-[#f9fafc] px-3 py-2 text-sm outline-none focus:border-[#ff0f64]"
                    placeholder="e.g. Thoko"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#5f6b85]">
                    Last name
                  </label>
                  <input
                    className="w-full rounded-2xl border border-[#d9deef] bg-[#f9fafc] px-3 py-2 text-sm outline-none focus:border-[#ff0f64]"
                    placeholder="e.g. Banda"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#5f6b85]">
                    Email address
                  </label>
                  <input
                    type="email"
                    className="w-full rounded-2xl border border-[#d9deef] bg-[#f9fafc] px-3 py-2 text-sm outline-none focus:border-[#ff0f64]"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#5f6b85]">
                    WhatsApp / phone number
                  </label>
                  <input
                    className="w-full rounded-2xl border border-[#d9deef] bg-[#f9fafc] px-3 py-2 text-sm outline-none focus:border-[#ff0f64]"
                    placeholder="+265 ..."
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-[#5f6b85]">
                  What best describes you?
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <button className="rounded-2xl border border-[#d9deef] bg-[#f9fafc] px-4 py-3 text-left text-xs hover:border-[#ff0f64]">
                    🏠 I own a single property
                  </button>
                  <button className="rounded-2xl border border-[#d9deef] bg-[#f9fafc] px-4 py-3 text-left text-xs hover:border-[#ff0f64]">
                    🏢 I manage multiple buildings
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-[#5f6b85]">
                  Where is your property located?
                </label>
                <div className="grid gap-3 sm:grid-cols-[1.2fr,1.2fr]">
                  <input
                    className="w-full rounded-2xl border border-[#d9deef] bg-[#f9fafc] px-3 py-2 text-sm outline-none focus:border-[#ff0f64]"
                    placeholder="City / town (e.g. Thyolo)"
                  />
                  <input
                    className="w-full rounded-2xl border border-[#d9deef] bg-[#f9fafc] px-3 py-2 text-sm outline-none focus:border-[#ff0f64]"
                    placeholder="Nearest university (e.g. MUST)"
                  />
                </div>
                <p className="mt-1 text-[11px] text-[#9ba3c4]">
                  We’ll show your listing to students at this campus first.
                </p>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-[#5f6b85]">
                  Password
                </label>
                <input
                  type="password"
                  className="w-full rounded-2xl border border-[#d9deef] bg-[#f9fafc] px-3 py-2 text-sm outline-none focus:border-[#ff0f64]"
                  placeholder="Create a secure password"
                />
                <p className="mt-1 text-[11px] text-[#9ba3c4]">
                  Minimum 8 characters. You’ll use this to sign in and manage
                  your listings.
                </p>
              </div>
            </div>

            {/* RIGHT: SUMMARY / CTA */}
            <aside className="space-y-5 rounded-3xl bg-[#f9fafc] px-5 py-5 text-xs text-[#5f6b85]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#a0a6bf]">
                Why list on Pa-Level?
              </p>
              <ul className="space-y-3">
                <li>
                  <span className="mr-1 text-sm">✅</span>
                  Reach verified students near Malawi universities.
                </li>
                <li>
                  <span className="mr-1 text-sm">✅</span>
                  Manage enquiries in one place and keep your number private.
                </li>
                <li>
                  <span className="mr-1 text-sm">✅</span>
                  Highlight what makes your property unique: Wi-Fi, power
                  backup, security and more.
                </li>
              </ul>

              <div className="mt-4 rounded-2xl bg-white px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#a0a6bf]">
                  Next step
                </p>
                <p className="mt-1 text-xs">
                  After this, you’ll add photos, pricing and room types so your
                  listing looks as good as the examples on DigsConnect.
                </p>
              </div>
            </aside>
          </div>

          {/* FOOT BUTTONS */}
          <div className="mt-7 flex flex-col items-center justify-between gap-3 border-t border-[#e4e7f3] pt-5 text-xs sm:flex-row">
            <p className="text-[11px] text-[#9ba3c4]">
              By continuing you agree to our{" "}
              <span className="font-semibold text-[#0e2756] underline">
                Terms &amp; Conditions
              </span>
              .
            </p>

            <div className="flex gap-3">
              <Link
                href="/landlord-create-listing"
                className="rounded-full bg-[#ff0f64] px-8 py-2.5 text-xs font-semibold text-white shadow-[0_14px_30px_rgba(255,15,100,0.45)]"
              >
                Continue to Step 2
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

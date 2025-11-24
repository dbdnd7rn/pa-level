"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type FeaturedRoom = {
  id: string;
  title: string;
  roomTypesLabel: string;
  availableLabel: string;
  fromLabel: string;
};

const featuredRooms: FeaturedRoom[] = [
  {
    id: "sample-1",
    title: "Pa-Level Sample House 1 | Ndata",
    roomTypesLabel: "2 room types available",
    availableLabel: "Available February 2026",
    fromLabel: "K80,000",
  },
  {
    id: "sample-2",
    title: "Pa-Level Sample House 2 | Ndata",
    roomTypesLabel: "3 room types available",
    availableLabel: "Available February 2026",
    fromLabel: "K80,000",
  },
  {
    id: "sample-3",
    title: "Pa-Level Sample House 3 | Ndata",
    roomTypesLabel: "4 room types available",
    availableLabel: "Available February 2026",
    fromLabel: "K80,000",
  },
];

export default function Home() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const searchHref =
    searchTerm.trim().length > 0
      ? `/rooms?search=${encodeURIComponent(searchTerm.trim())}`
      : "/rooms";

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    router.push(searchHref);
  };

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-[#0e2756]">
      {/* TOP NAVBAR */}
     <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 sm:py-5">
  <Link href="/" className="text-2xl font-extrabold tracking-tight">
    <span className="text-[#0e2756]">pa</span>
    <span className="text-[#ff0f64]">level</span>
  </Link>

  <nav className="flex items-center gap-3 text-xs font-semibold sm:gap-5 sm:text-sm">
    {/* Only show on larger screens to keep mobile clean */}
    <Link
      href="/landlord-resources"
      className="hidden text-[#0e2756] lg:inline"
    >
      Landlord Resources
    </Link>

    <Link
      href="/signup"
      className="rounded-full bg-[#ff0f64] px-4 py-1.5 text-xs font-semibold text-white shadow-[0_12px_25px_rgba(255,15,100,0.35)] sm:px-5 sm:py-2"
    >
      Signup
    </Link>

    <Link
      href="/login"
      className="rounded-full border border-[#d9deef] bg-white px-4 py-1.5 text-xs font-semibold text-[#0e2756] sm:px-5 sm:py-2"
    >
      Login
    </Link>
  </nav>
</header>


      {/* HERO SECTION */}
      <section className="w-full">
        <div className="mx-auto flex min-h-[75vh] max-w-6xl flex-col items-center justify-center rounded-b-[40px] bg-gradient-to-b from-[#c3e5ff] to-[#d9efff] px-6 pb-14 pt-6 text-center">
          <h1 className="max-w-6xl font-extrabold leading-[2.05]">
            <span className="block text-3xl md:text-[4rem]">
              Student Accommodation in
            </span>
            <span className="mt-2 block text-4xl md:text-[5.5rem]">
              Malawi
            </span>
          </h1>

          {/* Search bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="mt-10 flex w-full max-w-3xl items-center justify-between rounded-full bg-white px-8 py-5 text-base shadow-[0_18px_35px_rgba(0,0,0,0.12)]"
          >
            <input
              type="text"
              placeholder="Search by city, suburb or university..."
              className="mr-3 w-full border-none text-sm text-[#5f6b85] outline-none md:text-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              type="submit"
              className="flex items-center gap-1 rounded-full bg-[#ff0f64] px-7 py-2 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(255,15,100,0.45)] md:text-base"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* UNI TABS + CTA BUTTONS */}
      <section className="mx-auto -mt-6 max-w-6xl px-6 pb-12">
        {/* University tabs (visual for now) */}
        <div className="flex w-full max-w-3xl gap-3 overflow-x-auto rounded-[999px] bg-white px-3 py-3 shadow-[0_15px_30px_rgba(0,0,0,0.06)]">
          <button className="rounded-full bg-[#ff0f64] px-6 py-2 text-xs font-semibold text-white shadow-[0_8px_18px_rgba(255,15,100,0.5)]">
            MUST
          </button>
          <button className="rounded-full px-6 py-2 text-xs font-semibold text-[#0e2756]">
            MUBAS
          </button>
          <button className="rounded-full px-6 py-2 text-xs font-semibold text-[#0e2756]">
            MZUNI
          </button>
          <button className="rounded-full px-6 py-2 text-xs font-semibold text-[#0e2756]">
            LUANAR
          </button>
          <button className="rounded-full px-6 py-2 text-xs font-semibold text-[#0e2756]">
            KUHeS
          </button>
        </div>

        {/* CTA buttons */}
        <div className="mt-8 flex flex-wrap justify-center gap-3 md:justify-start">
          <Link
            href="/rooms"
            className="inline-block rounded-full bg-[#ff0f64] px-6 py-2 text-sm font-semibold text-white shadow-[0_12px_25px_rgba(255,15,100,0.35)]"
          >
            Browse available rooms
          </Link>
          <Link
            href="/landlord-signup"
            className="inline-block rounded-full bg-white px-6 py-2 text-sm font-semibold text-[#0e2756] shadow-[0_10px_22px_rgba(0,0,0,0.08)]"
          >
            List my property
          </Link>
        </div>
      </section>

      {/* FEATURED LISTINGS */}
      <section className="mx-auto mt-4 max-w-6xl px-6 pb-10">
        <h2 className="mb-6 text-xl font-bold">Featured rooms near MUST</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {featuredRooms.map((room) => (
            <Link
              key={room.id}
              href={`/room?id=${room.id}`}
              className="overflow-hidden rounded-3xl bg-white shadow-[0_18px_35px_rgba(0,0,0,0.08)] transition-transform hover:-translate-y-1 hover:shadow-[0_22px_40px_rgba(0,0,0,0.14)]"
            >
              <div className="h-40 w-full bg-[#c8d6ff]" />
              <div className="space-y-1 px-5 py-4 text-sm">
                <p className="text-xs font-semibold text-[#ff0f64]">
                  Student Residence • {room.roomTypesLabel}
                </p>
                <p className="text-sm font-bold">{room.title}</p>
                <p className="text-xs text-[#5f6b85]">{room.availableLabel}</p>
                <p className="pt-1 text-xs">
                  From{" "}
                  <span className="text-base font-bold text-[#0e2756]">
                    {room.fromLabel}
                  </span>{" "}
                  / month
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* OTHER UNIVERSITIES STRIP */}
      <section className="mx-auto max-w-6xl px-6 pb-6">
        <div className="rounded-3xl bg-[#0e2756] px-6 py-5 text-white shadow-[0_18px_35px_rgba(0,0,0,0.25)]">
          <p className="text-sm font-extrabold">Other universities</p>
          <p className="mt-1 text-xs text-white/80 md:text-sm">
            We&apos;re starting with verified rooms around MUST. Listings for{" "}
            <span className="font-semibold">
              MUBAS, MZUNI, LUANAR and KUHeS
            </span>{" "}
            are next on our roadmap. If you study there, Pa-Level is{" "}
            <span className="font-semibold">coming soon</span> to your campus.
          </p>
          <p className="mt-2 text-xs text-white/70">
            Want us to prioritise your university?{" "}
            <Link
              href="/contact"
              className="font-semibold underline underline-offset-2"
            >
              Send us a quick message.
            </Link>
          </p>
        </div>
      </section>

      {/* GET IN TOUCH */}
      <section className="bg-[#f9fafc] py-16">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="mb-4 text-2xl font-extrabold text-[#0e2756]">
            Get in touch!
          </h2>
          <p className="mx-auto max-w-xl text-sm text-[#5f6b85]">
            We’d love to hear from you, or answer any questions about Pa-Level.
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-block rounded-full bg-[#ff0f64] px-10 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(255,15,100,0.4)]"
          >
            Contact us
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#e1e4ef] bg-white text-xs text-[#7b8199]">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-10 px-6 py-12">
          {/* Top: logo + link columns */}
          <div className="flex w-full flex-col items-center gap-10 md:flex-row md:items-start md:justify-between">
            {/* Logo on the left */}
            <Link
              href="/"
              className="text-2xl font-extrabold text-[#0e2756]"
            >
              pa<span className="text-[#ff0f64]">level</span>
            </Link>

            {/* Link columns */}
            <div className="grid w-full max-w-3xl gap-10 text-sm md:grid-cols-3">
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#0e2756]">
                  Find a room
                </p>
                <Link href="/about" className="block">
                  About us
                </Link>
                <Link href="/landlord-resources" className="block">
                  Landlord resources
                </Link>
                <Link href="/safety" className="block">
                  Safety on Pa-Level
                </Link>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#0e2756]">
                  Create a listing
                </p>
                <Link href="/pricing" className="block">
                  Pricing
                </Link>
                <Link href="/faqs" className="block">
                  FAQs
                </Link>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#0e2756]">
                  Contact Pa-Level
                </p>
                <Link href="/terms" className="block">
                  Terms &amp; Conditions
                </Link>
                <Link href="/privacy" className="block">
                  Privacy policy
                </Link>
              </div>
            </div>
          </div>

          {/* Social icons centered */}
          <div className="flex items-center justify-center gap-4">
            <a
              href="#"
              aria-label="Pa-Level on X"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f6f7fb] text-[#0e2756] transition hover:bg-[#ff0f64] hover:text-white"
            >
              {/* X / Twitter icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 4L20 20" />
                <path d="M20 4L4 20" />
              </svg>
            </a>

            <a
              href="#"
              aria-label="Pa-Level on Facebook"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f6f7fb] text-[#0e2756] transition hover:bg-[#ff0f64] hover:text-white"
            >
              {/* Facebook icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M13.5 8.25H15V5.25H13.5C10.875 5.25 9.75 6.75 9.75 8.625V10.5H8.25V13.5H9.75V19.5H12.75V13.5H14.625L15 10.5H12.75V8.8125C12.75 8.2125 13.05 8.25 13.5 8.25Z" />
              </svg>
            </a>

            <a
              href="#"
              aria-label="Pa-Level on Instagram"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f6f7fb] text-[#0e2756] transition hover:bg-[#ff0f64] hover:text-white"
            >
              {/* Instagram icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <path d="M17.5 6.5h.01" />
              </svg>
            </a>

            <a
              href="#"
              aria-label="Pa-Level on YouTube"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f6f7fb] text-[#0e2756] transition hover:bg-[#ff0f64] hover:text-white"
            >
              {/* YouTube-style play icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="6" width="18" height="12" rx="3" />
                <path d="M11 9l4 3-4 3V9z" />
              </svg>
            </a>
          </div>

          {/* Copyright */}
          <p className="text-center text-[11px] text-[#a0a6bf]">
            © {new Date().getFullYear()} Pa-Level. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

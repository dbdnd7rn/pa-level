// app/offline/page.tsx
"use client";

import Link from "next/link";

export const dynamic = "force-static"; // keep it static
export const revalidate = false;       // no ISR, just a pure static page

export default function OfflinePage() {
  const handleReload = () => {
    // Try to reload when connection returns
    window.location.reload();
  };

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-2 text-2xl font-bold">You’re offline</h1>
      <p className="text-sm text-[#5f6b85]">
        Please reconnect to the internet to use Pa-Level. Some pages and assets may
        still be available from cache.
      </p>

      <div className="mt-6 flex items-center gap-3 text-sm">
        <button
          onClick={handleReload}
          className="rounded-full bg-[#ff0f64] px-5 py-2 font-semibold text-white shadow-[0_10px_22px_rgba(255,15,100,0.35)]"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-full border border-[#d9deef] bg-white px-5 py-2 font-semibold text-[#0e2756]"
        >
          Go to Home
        </Link>
      </div>
    </div>
  );
}

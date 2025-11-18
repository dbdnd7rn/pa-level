// app/rooms/page.tsx
// Server wrapper only — DO NOT import Firebase here.
// All data fetching happens inside RoomsClient (a client component).

import RoomsClient from "./RoomsClient";

export const dynamic = "force-static"; // static shell; client hydrates and fetches
export const revalidate = 0;

export default function RoomsPage() {
  return (
    <div className="min-h-screen bg-[#f6f7fb] text-[#0e2756]">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="text-2xl font-extrabold mb-4">Browse available rooms</h1>

        {/* RoomsClient reads URL filters with useSearchParams() and talks to Firestore */}
        <RoomsClient />
      </div>
    </div>
  );
}

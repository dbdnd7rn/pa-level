// app/room/page.tsx
import { Suspense } from "react";
import RoomPageClient from "./RoomPageClient";

export default function RoomPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f6f7fb] text-[#0e2756]">
          <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
            <span className="text-2xl font-extrabold tracking-tight">
              <span className="text-[#0e2756]">pa</span>
              <span className="text-[#ff0f64]">level</span>
            </span>
          </header>
          <main className="mx-auto max-w-6xl px-6 py-20">
            <p className="text-sm text-[#5f6b85]">Loading room…</p>
          </main>
        </div>
      }
    >
      <RoomPageClient />
    </Suspense>
  );
}

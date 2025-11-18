"use client";

import { useState } from "react";
import Link from "next/link";
import RequireAuth from "../../_components/RequireAuth";
import RoleGate from "../../_components/RoleGate";
import { useAuth } from "../../_components/AuthProvider";

import {
  addDoc,
  collection,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

// ✅ client-only lazy getter (do NOT create db at module top)
import { getClientDb } from "../../../lib/firebaseClient";

export default function SeedTenantPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSeed = async () => {
    if (!user) {
      setError("You need to be logged in first.");
      return;
    }

    setLoading(true);
    setMsg(null);
    setError(null);

    try {
      // 🔸 Initialize Firestore on the client at the moment we need it
      const db = getClientDb();

      const base = doc(db, "users", user.uid);

      // Make sure user doc exists & has tenant role
      await setDoc(
        base,
        {
          role: "tenant",
          email: user.email ?? null,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      const savedRoomsRef = collection(base, "savedRooms");
      const applicationsRef = collection(base, "applications");
      const depositsRef = collection(base, "deposits");

      // If you already have data, don't duplicate – just show a message.
      const [savedSnap, appSnap, depSnap] = await Promise.all([
        getDocs(savedRoomsRef),
        getDocs(applicationsRef),
        getDocs(depositsRef),
      ]);

      if (!savedSnap.empty || !appSnap.empty || !depSnap.empty) {
        setMsg(
          "Looks like you already have some tenant data in Firestore. Dashboard will read that."
        );
        setLoading(false);
        return;
      }

      // --- Sample saved rooms ---
      await Promise.all([
        addDoc(savedRoomsRef, {
          title: "Pa-Level House 1 | Ndata",
          area: "Ndata",
          campus: "MUST",
          city: "Thyolo",
          priceFrom: "K80,000 / month",
          status: "saved",
          createdAt: serverTimestamp(),
        }),
        addDoc(savedRoomsRef, {
          title: "Skylight Student Residence",
          area: "Ndata",
          campus: "MUST",
          city: "Thyolo",
          priceFrom: "K85,000 / month",
          status: "applied",
          createdAt: serverTimestamp(),
        }),
        addDoc(savedRoomsRef, {
          title: "Campus View Lodge",
          area: "Ndata",
          campus: "MUST",
          city: "Thyolo",
          priceFrom: "K110,000 / month",
          status: "accepted",
          createdAt: serverTimestamp(),
        }),
      ]);

      // --- Sample applications ---
      await Promise.all([
        addDoc(applicationsRef, {
          propertyName: "Skylight Student Residence",
          roomType: "Triple Room",
          status: "pending",
          depositStatus: "not-paid",
          moveInDate: "01 Feb 2026",
          createdAt: serverTimestamp(),
        }),
        addDoc(applicationsRef, {
          propertyName: "Campus View Lodge",
          roomType: "Standard Ensuite",
          status: "accepted",
          depositStatus: "partial",
          moveInDate: "10 Feb 2026",
          createdAt: serverTimestamp(),
        }),
      ]);

      // --- Sample deposits ---
      await Promise.all([
        addDoc(depositsRef, {
          propertyName: "Campus View Lodge",
          amount: "K50,000",
          status: "pending",
          date: "15 Jan 2026",
          createdAt: serverTimestamp(),
        }),
        addDoc(depositsRef, {
          propertyName: "Pa-Level House 1 | Ndata",
          amount: "K80,000",
          status: "paid",
          date: "05 Dec 2025",
          createdAt: serverTimestamp(),
        }),
      ]);

      setMsg(
        "Seeded sample tenant data into Firestore. Go back to the tenant dashboard and refresh 🚀"
      );
    } catch (err: any) {
      console.error("Seed error:", err);
      setError(err?.message ?? "Could not seed tenant data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <RequireAuth>
      <RoleGate allowedRole="tenant">
        <div className="min-h-screen bg-[#0b0c10] text-[#f6f7fb]">
          <header className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
            <Link href="/" className="text-2xl font-extrabold tracking-tight">
              <span className="text-[#f6f7fb]">pa</span>
              <span className="text-[#ff0f64]">level</span>
            </Link>
            <Link
              href="/tenant-dashboard"
              className="text-sm font-semibold text-[#f6f7fb]"
            >
              Back to dashboard
            </Link>
          </header>

          <main className="mx-auto max-w-3xl px-6 pb-16">
            <section className="mt-10 rounded-3xl bg-[#121320] px-6 py-7 shadow-[0_22px_45px_rgba(0,0,0,0.7)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#ff0f64]">
                Dev helper
              </p>
              <h1 className="mt-2 text-2xl font-extrabold">
                Seed tenant Firestore data
              </h1>
              <p className="mt-2 text-sm text-[#a9b1d6]">
                This page is just for testing. It will create sample
                <span className="font-semibold"> saved rooms</span>,
                <span className="font-semibold"> applications</span> and
                <span className="font-semibold"> deposits</span> under your
                Firestore document:
              </p>
              <p className="mt-1 text-[11px] text-[#7e88b4]">
                <code>users/{user?.uid}/savedRooms</code>,{" "}
                <code>users/{user?.uid}/applications</code>,{" "}
                <code>users/{user?.uid}/deposits</code>
              </p>

              <button
                onClick={handleSeed}
                disabled={loading}
                className="mt-5 rounded-full bg-[#ff0f64] px-8 py-2.5 text-xs font-semibold text-white shadow-[0_18px_35px_rgba(255,15,100,0.55)] disabled:opacity-60"
              >
                {loading ? "Seeding data..." : "Seed my tenant data"}
              </button>

              {msg && <p className="mt-3 text-[11px] text-[#4ade80]">{msg}</p>}
              {error && <p className="mt-3 text-[11px] text-[#f87171]">{error}</p>}

              <p className="mt-6 text-[11px] text-[#7e88b4]">
                You can delete or override this data later when you connect real
                flows. It&apos;s just to see how the dashboard looks with live
                Firestore collections.
              </p>
            </section>
          </main>
        </div>
      </RoleGate>
    </RequireAuth>
  );
}

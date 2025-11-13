"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import RequireAuth from "../_components/RequireAuth";
import RoleGate from "../_components/RoleGate";
import { useAuth } from "../_components/AuthProvider";
import {
  collection,
  doc,
  getDocs,
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "../../lib/firebaseClient";

type SavedRoom = {
  id: string;
  title: string;
  area: string;
  campus: string;
  city: string;
  priceFrom: string;
  status: "saved" | "applied" | "accepted";
};

type Application = {
  id: string;
  propertyName: string;
  roomType: string;
  status: "pending" | "accepted" | "rejected";
  depositStatus: "not-paid" | "partial" | "paid";
  moveInDate: string;
};

type Deposit = {
  id: string;
  propertyName: string;
  amount: string;
  status: "paid" | "pending" | "refunded";
  date: string;
};

// Sample data if Firestore is empty
const sampleSavedRooms: SavedRoom[] = [
  {
    id: "1",
    title: "Pa-Level House 1 | Ndata",
    area: "Ndata",
    campus: "MUST",
    city: "Thyolo",
    priceFrom: "K80,000 / month",
    status: "saved",
  },
  {
    id: "2",
    title: "Skylight Student Residence",
    area: "Ndata",
    campus: "MUST",
    city: "Thyolo",
    priceFrom: "K85,000 / month",
    status: "applied",
  },
  {
    id: "3",
    title: "Campus View Lodge",
    area: "Ndata",
    campus: "MUST",
    city: "Thyolo",
    priceFrom: "K110,000 / month",
    status: "accepted",
  },
];

const sampleApplications: Application[] = [
  {
    id: "app-1",
    propertyName: "Skylight Student Residence",
    roomType: "Triple Room",
    status: "pending",
    depositStatus: "not-paid",
    moveInDate: "01 Feb 2026",
  },
  {
    id: "app-2",
    propertyName: "Campus View Lodge",
    roomType: "Standard Ensuite",
    status: "accepted",
    depositStatus: "partial",
    moveInDate: "10 Feb 2026",
  },
];

const sampleDeposits: Deposit[] = [
  {
    id: "dep-1",
    propertyName: "Campus View Lodge",
    amount: "K50,000",
    status: "pending",
    date: "15 Jan 2026",
  },
  {
    id: "dep-2",
    propertyName: "Pa-Level House 1 | Ndata",
    amount: "K80,000",
    status: "paid",
    date: "05 Dec 2025",
  },
];

function mapSavedRoomDoc(
  docSnap: QueryDocumentSnapshot<DocumentData>
): SavedRoom {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    title: data.title || "Saved room",
    area: data.area || "Ndata",
    campus: data.campus || "MUST",
    city: data.city || "Thyolo",
    priceFrom: data.priceFrom || "K— / month",
    status:
      (data.status as SavedRoom["status"]) !== undefined
        ? (data.status as SavedRoom["status"])
        : "saved",
  };
}

function mapApplicationDoc(
  docSnap: QueryDocumentSnapshot<DocumentData>
): Application {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    propertyName: data.propertyName || "Application",
    roomType: data.roomType || "Standard room",
    status:
      (data.status as Application["status"]) !== undefined
        ? (data.status as Application["status"])
        : "pending",
    depositStatus:
      (data.depositStatus as Application["depositStatus"]) !== undefined
        ? (data.depositStatus as Application["depositStatus"])
        : "not-paid",
    moveInDate: data.moveInDate || "TBC",
  };
}

function mapDepositDoc(
  docSnap: QueryDocumentSnapshot<DocumentData>
): Deposit {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    propertyName: data.propertyName || "Deposit",
    amount: data.amount || "K—",
    status:
      (data.status as Deposit["status"]) !== undefined
        ? (data.status as Deposit["status"])
        : "pending",
    date: data.date || "TBC",
  };
}

export default function TenantDashboardPage() {
  const { user, logout } = useAuth();

  const [savedRooms, setSavedRooms] =
    useState<SavedRoom[]>(sampleSavedRooms);
  const [applications, setApplications] =
    useState<Application[]>(sampleApplications);
  const [deposits, setDeposits] = useState<Deposit[]>(sampleDeposits);
  const [usingSamples, setUsingSamples] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setLoading(true);
      try {
        const userDoc = doc(db, "users", user.uid);

        const [savedSnap, appSnap, depSnap] = await Promise.all([
          getDocs(collection(userDoc, "savedRooms")),
          getDocs(collection(userDoc, "applications")),
          getDocs(collection(userDoc, "deposits")),
        ]);

        const hasAny =
          !savedSnap.empty || !appSnap.empty || !depSnap.empty;

        if (!hasAny) {
          setSavedRooms(sampleSavedRooms);
          setApplications(sampleApplications);
          setDeposits(sampleDeposits);
          setUsingSamples(true);
          return;
        }

        setUsingSamples(false);

        if (!savedSnap.empty) {
          setSavedRooms(savedSnap.docs.map(mapSavedRoomDoc));
        } else {
          setSavedRooms([]);
        }

        if (!appSnap.empty) {
          setApplications(appSnap.docs.map(mapApplicationDoc));
        } else {
          setApplications([]);
        }

        if (!depSnap.empty) {
          setDeposits(depSnap.docs.map(mapDepositDoc));
        } else {
          setDeposits([]);
        }
      } catch (err) {
        console.error("Tenant dashboard load error:", err);
        setSavedRooms(sampleSavedRooms);
        setApplications(sampleApplications);
        setDeposits(sampleDeposits);
        setUsingSamples(true);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user]);

  const totalSaved = savedRooms.length;
  const totalApplications = applications.length;
  const paidDeposits = deposits.filter((d) => d.status === "paid").length;

  const { user: authUser } = useAuth();
  const displayName =
    authUser?.displayName?.split(" ")[0] ??
    (authUser?.email ? authUser.email.split("@")[0] : "there");

  const handleLogout = async () => {
    await logout();
  };

  return (
    <RequireAuth>
      <RoleGate allowedRole="tenant">
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
                href="/landlord-dashboard"
                className="hidden text-[#0e2756] md:inline"
              >
                Landlord view
              </Link>
              <Link
                href="/profile"
                className="hidden text-[#0e2756] md:inline"
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-full border border-[#ccd1ea] bg-white px-6 py-2 text-sm font-semibold text-[#0e2756]"
              >
                Logout
              </button>
            </nav>
          </header>

          <main className="mx-auto max-w-6xl px-6 pb-16">
            {/* HEADER */}
            <section className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#ff0f64]">
                  Tenant dashboard
                </p>
                <h1 className="mt-2 text-3xl font-extrabold leading-tight sm:text-4xl">
                  Hey {displayName}, welcome back 👋
                </h1>
                <p className="mt-2 text-sm text-[#5f6b85]">
                  Track your saved rooms, applications and deposit status in
                  one place.
                </p>
                <p className="mt-1 text-[11px] text-[#9ba3c4]">
                  {loading
                    ? "Loading your Firestore data…"
                    : usingSamples
                    ? "Showing sample data so you can see how things will look. Once you save a room or apply, it will show here."
                    : "This view is powered by your real saved rooms, applications and deposits in Firestore."}
                </p>
              </div>
              <div className="flex gap-3 text-xs">
                <Link
                  href="/rooms"
                  className="rounded-full bg-white px-4 py-2 font-semibold text-[#0e2756] shadow-[0_10px_22px_rgba(0,0,0,0.08)]"
                >
                  Browse more rooms
                </Link>
                <button className="rounded-full border border-[#ccd1ea] px-4 py-2 font-semibold text-[#5f6b85]">
                  Download summary
                </button>
              </div>
            </section>

            {/* STATS CARDS */}
            <section className="grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl bg-white px-5 py-4 shadow-[0_16px_30px_rgba(0,0,0,0.06)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#a0a6bf]">
                  Saved rooms
                </p>
                <p className="mt-3 text-2xl font-extrabold">{totalSaved}</p>
                <p className="mt-1 text-xs text-[#5f6b85]">
                  Heart rooms you like to compare easily.
                </p>
              </div>

              <div className="rounded-3xl bg-white px-5 py-4 shadow-[0_16px_30px_rgba(0,0,0,0.06)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#a0a6bf]">
                  Applications
                </p>
                <p className="mt-3 text-2xl font-extrabold">
                  {totalApplications}
                </p>
                <p className="mt-1 text-xs text-[#5f6b85]">
                  Keep an eye on which landlords have replied.
                </p>
              </div>

              <div className="rounded-3xl bg-[#0e2756] px-5 py-4 text-white shadow-[0_18px_35px_rgba(0,0,0,0.5)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">
                  Deposits paid
                </p>
                <p className="mt-3 text-2xl font-extrabold">{paidDeposits}</p>
                <p className="mt-1 text-xs text-white/80">
                  We&apos;ll show deposit timelines here once payments are live.
                </p>
              </div>
            </section>

            {/* MAIN GRID: SAVED ROOMS + SIDE PANEL */}
            <section className="mt-10 grid gap-8 lg:grid-cols-[2fr,1.2fr]">
              {/* SAVED ROOMS */}
              <div className="rounded-3xl bg-white px-5 py-5 shadow-[0_18px_35px_rgba(0,0,0,0.06)]">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-extrabold">
                      Your saved rooms
                    </h2>
                    <p className="text-xs text-[#5f6b85]">
                      Rooms you&apos;re considering or have already applied
                      for.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {savedRooms.map((room) => (
                    <div
                      key={room.id}
                      className="flex flex-col justify-between gap-3 rounded-2xl border border-[#edf0fb] px-4 py-3 text-xs sm:flex-row sm:items-center"
                    >
                      <div>
                        <p className="text-sm font-semibold">{room.title}</p>
                        <p className="text-[11px] text-[#9ba3c4]">
                          {room.area} • {room.campus}, {room.city}
                        </p>
                        <p className="mt-1 text-[11px] text-[#5f6b85]">
                          From{" "}
                          <span className="font-semibold">
                            {room.priceFrom}
                          </span>
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                            room.status === "accepted"
                              ? "bg-[#e6f6ef] text-[#008c3c]"
                              : room.status === "applied"
                              ? "bg-[#fff4d6] text-[#8c5a00]"
                              : "bg-[#eff3ff] text-[#0e2756]"
                          }`}
                        >
                          {room.status === "saved" && "Saved"}
                          {room.status === "applied" && "Applied"}
                          {room.status === "accepted" && "Accepted"}
                        </span>
                        <Link
                          href={`/room?id=${room.id}`}
                          className="text-[11px] font-semibold text-[#ff0f64]"
                        >
                          View details →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT SIDEBAR: APPLICATIONS + DEPOSITS */}
              <div className="space-y-6">
                {/* Applications */}
                <div className="rounded-3xl bg-white px-5 py-5 shadow-[0_18px_35px_rgba(0,0,0,0.06)]">
                  <h2 className="text-sm font-extrabold">Applications</h2>
                  <p className="mt-1 text-[11px] text-[#5f6b85]">
                    Follow up with landlords if you don&apos;t hear back.
                  </p>
                  <ul className="mt-4 space-y-3 text-xs">
                    {applications.map((a) => (
                      <li
                        key={a.id}
                        className="rounded-2xl bg-[#f6f7fb] px-3 py-3 text-xs"
                      >
                        <p className="font-semibold">{a.propertyName}</p>
                        <p className="text-[11px] text-[#5f6b85]">
                          {a.roomType}
                        </p>
                        <div className="mt-2 flex items-center justify-between text-[11px]">
                          <span>
                            Status:{" "}
                            <span className="font-semibold capitalize">
                              {a.status}
                            </span>
                          </span>
                          <span>Move-in: {a.moveInDate}</span>
                        </div>
                        <p className="mt-1 text-[11px] text-[#5f6b85]">
                          Deposit:{" "}
                          <span className="font-semibold capitalize">
                            {a.depositStatus.replace("-", " ")}
                          </span>
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Deposits */}
                <div className="rounded-3xl bg-[#0e2756] px-5 py-5 text-xs text-white shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
                  <h2 className="text-sm font-extrabold">
                    Deposits & payments
                  </h2>
                  <p className="mt-1 text-[11px] text-white/80">
                    Once we add a payment gateway, this will connect to real
                    transactions.
                  </p>
                  <div className="mt-4 space-y-3">
                    {deposits.map((d) => (
                      <div
                        key={d.id}
                        className="rounded-2xl bg-white/5 px-3 py-3 text-xs"
                      >
                        <p className="text-[11px] font-semibold">
                          {d.propertyName}
                        </p>
                        <p className="mt-1 text-base font-extrabold">
                          {d.amount}
                        </p>
                        <p className="text-[11px] text-white/75">
                          Status:{" "}
                          <span className="capitalize">
                            {d.status === "paid"
                              ? "Paid"
                              : d.status === "pending"
                              ? "Pending"
                              : "Refunded"}
                          </span>{" "}
                          • {d.date}
                        </p>
                      </div>
                    ))}
                  </div>
                  <button className="mt-4 flex w-full items-center justify-center rounded-full bg-[#ff0f64] px-4 py-2 text-[11px] font-semibold text-white shadow-[0_12px_25px_rgba(255,15,100,0.6)]">
                    View all transactions
                  </button>
                </div>
              </div>
            </section>
          </main>
        </div>
      </RoleGate>
    </RequireAuth>
  );
}

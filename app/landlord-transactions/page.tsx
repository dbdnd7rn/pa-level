"use client";

import Link from "next/link";
import RequireAuth from "../_components/RequireAuth";
import RoleGate from "../_components/RoleGate";
import { useAuth } from "../_components/AuthProvider";

type Transaction = {
  id: string;
  date: string;
  student: string;
  propertyName: string;
  type: "Deposit" | "Rent";
  amount: string;
  status: "Paid" | "Pending" | "Failed";
  method: "Card" | "Mobile Money" | "Bank Transfer";
};

const transactions: Transaction[] = [
  {
    id: "TX-001",
    date: "10 Jan 2026",
    student: "Thandiwe Banda",
    propertyName: "Pa-Level House 1",
    type: "Deposit",
    amount: "K80,000",
    status: "Paid",
    method: "Mobile Money",
  },
  {
    id: "TX-002",
    date: "12 Jan 2026",
    student: "Brian M.",
    propertyName: "Skylight Residence",
    type: "Deposit",
    amount: "K90,000",
    status: "Pending",
    method: "Card",
  },
  {
    id: "TX-003",
    date: "01 Feb 2026",
    student: "Thandiwe Banda",
    propertyName: "Pa-Level House 1",
    type: "Rent",
    amount: "K80,000",
    status: "Paid",
    method: "Mobile Money",
  },
  {
    id: "TX-004",
    date: "03 Feb 2026",
    student: "Grace T.",
    propertyName: "Skylight Residence",
    type: "Rent",
    amount: "K85,000",
    status: "Paid",
    method: "Card",
  },
  {
    id: "TX-005",
    date: "05 Feb 2026",
    student: "Luka P.",
    propertyName: "Campus View Lodge",
    type: "Deposit",
    amount: "K110,000",
    status: "Failed",
    method: "Bank Transfer",
  },
];

function statusPill(status: Transaction["status"]) {
  if (status === "Paid") {
    return (
      <span className="rounded-full bg-[#e6f8f3] px-3 py-1 text-[10px] font-semibold text-[#047857]">
        Paid
      </span>
    );
  }
  if (status === "Pending") {
    return (
      <span className="rounded-full bg-[#fff7e0] px-3 py-1 text-[10px] font-semibold text-[#9a6a00]">
        Pending
      </span>
    );
  }
  return (
    <span className="rounded-full bg-[#ffe6e6] px-3 py-1 text-[10px] font-semibold text-[#b91c1c]">
      Failed
    </span>
  );
}

function parseAmount(amount: string): number {
  const digits = amount.replace(/[^\d]/g, "");
  return digits ? parseInt(digits, 10) : 0;
}

function formatK(value: number) {
  return `K${value.toLocaleString("en-MW")}`;
}

export default function LandlordTransactionsPage() {
  const { user, logout } = useAuth();

  const displayName =
    user?.displayName?.split(" ")[0] ??
    (user?.email ? user.email.split("@")[0] : "there");

  const handleLogout = async () => {
    await logout();
  };

  const totalPaidTx = transactions.filter((t) => t.status === "Paid");
  const totalPendingTx = transactions.filter((t) => t.status === "Pending");
  const totalFailedTx = transactions.filter((t) => t.status === "Failed");

  const totalPaidAmount = totalPaidTx.reduce(
    (sum, t) => sum + parseAmount(t.amount),
    0
  );

  return (
    <RequireAuth>
      {/* was role="landlord" before */}
      <RoleGate allowedRole="landlord">
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
                Dashboard
              </Link>
              <Link
                href="/landlord-transactions"
                className="hidden text-[#0e2756] md:inline"
              >
                Transactions
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
            <section className="mt-4 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#ff0f64]">
                  Payments
                </p>
                <h1 className="mt-2 text-3xl font-extrabold leading-tight sm:text-4xl">
                  All transactions through Pa-Level
                </h1>
                <p className="mt-1 text-[11px] text-[#9ba3c4]">
                  Hi {displayName},{" "}
                  {user?.email && (
                    <>
                      you&apos;re logged in as{" "}
                      <span className="font-semibold">{user.email}</span>.{" "}
                    </>
                  )}
                  Below is a mock view of how your deposits & rent payments will
                  look once the real gateway is connected.
                </p>
                <p className="mt-2 text-sm text-[#5f6b85]">
                  This is a mock view for now. When the payment gateway is live,
                  you&apos;ll see real-time status and payouts here.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-xs">
                <button className="rounded-full bg-white px-4 py-2 font-semibold text-[#0e2756] shadow-[0_10px_22px_rgba(0,0,0,0.08)]">
                  Download CSV
                </button>
                <button className="rounded-full border border-[#ccd1ea] px-4 py-2 font-semibold text-[#5f6b85]">
                  Connect payment provider (soon)
                </button>
              </div>
            </section>

            {/* SUMMARY STRIP */}
            <section className="mt-6 grid gap-4 text-xs md:grid-cols-4">
              <div className="rounded-3xl bg-white px-4 py-3 shadow-[0_12px_24px_rgba(0,0,0,0.06)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#a0a6bf]">
                  Paid this sample period
                </p>
                <p className="mt-2 text-xl font-extrabold">
                  {formatK(totalPaidAmount)}
                </p>
                <p className="mt-1 text-[11px] text-[#5f6b85]">
                  {totalPaidTx.length} successful payments
                </p>
              </div>
              <div className="rounded-3xl bg-white px-4 py-3 shadow-[0_12px_24px_rgba(0,0,0,0.06)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#a0a6bf]">
                  Pending
                </p>
                <p className="mt-2 text-xl font-extrabold">
                  {totalPendingTx.length}
                </p>
                <p className="mt-1 text-[11px] text-[#5f6b85]">
                  Waiting for student to complete payment
                </p>
              </div>
              <div className="rounded-3xl bg-white px-4 py-3 shadow-[0_12px_24px_rgba(0,0,0,0.06)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#a0a6bf]">
                  Failed
                </p>
                <p className="mt-2 text-xl font-extrabold">
                  {totalFailedTx.length}
                </p>
                <p className="mt-1 text-[11px] text-[#5f6b85]">
                  Card declines / errors to follow up on
                </p>
              </div>
              <div className="rounded-3xl bg-[#0e2756] px-4 py-3 text-white shadow-[0_12px_24px_rgba(0,0,0,0.4)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em]">
                  When live
                </p>
                <p className="mt-2 text-sm font-extrabold">
                  This row will sync with Stripe / Paystack balances
                </p>
                <p className="mt-1 text-[11px] text-white/80">
                  So you can see payouts without leaving Pa-Level.
                </p>
              </div>
            </section>

            <section className="mt-8 rounded-3xl bg-white px-5 py-5 shadow-[0_22px_40px_rgba(0,0,0,0.06)]">
              <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-sm font-extrabold">Recent transactions</h2>
                  <p className="text-[11px] text-[#5f6b85]">
                    Deposits and rent payments grouped by property and student.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-[11px]">
                  <button className="rounded-full bg-[#f6f7fb] px-4 py-1.5 font-semibold text-[#0e2756]">
                    All
                  </button>
                  <button className="rounded-full bg-[#f6f7fb] px-4 py-1.5 font-semibold text-[#5f6b85]">
                    Deposits
                  </button>
                  <button className="rounded-full bg-[#f6f7fb] px-4 py-1.5 font-semibold text-[#5f6b85]">
                    Rent
                  </button>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-[#edf0fb]">
                <table className="min-w-full text-left text-xs">
                  <thead className="bg-[#f6f7fb] text-[11px] uppercase tracking-wide text-[#9ba3c4]">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Student</th>
                      <th className="px-4 py-3">Property</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Method</th>
                      <th className="px-4 py-3 text-right">Ref</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((t) => (
                      <tr key={t.id} className="border-t border-[#edf0fb]">
                        <td className="px-4 py-3 align-top text-[11px]">
                          {t.date}
                        </td>
                        <td className="px-4 py-3 align-top text-[11px]">
                          {t.student}
                        </td>
                        <td className="px-4 py-3 align-top text-[11px]">
                          {t.propertyName}
                        </td>
                        <td className="px-4 py-3 align-top text-[11px]">
                          {t.type}
                        </td>
                        <td className="px-4 py-3 align-top text-[11px]">
                          {t.amount}
                        </td>
                        <td className="px-4 py-3 align-top">
                          {statusPill(t.status)}
                        </td>
                        <td className="px-4 py-3 align-top text-[11px]">
                          {t.method}
                        </td>
                        <td className="px-4 py-3 align-top text-right text-[11px] text-[#9ba3c4]">
                          {t.id}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="mt-4 text-[11px] text-[#9ba3c4]">
                In the future, this page will sync directly with your payment
                provider (Stripe, mobile money, etc.), so you can see payouts,
                failed charges and refunds without leaving Pa-Level.
              </p>
            </section>
          </main>
        </div>
      </RoleGate>
    </RequireAuth>
  );
}

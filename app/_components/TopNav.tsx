// app/_components/TopNav.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAuth, signOut } from "firebase/auth";
import { useAuth } from "./AuthProvider";

export default function TopNav() {
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      // AuthProvider should pick up the auth change and clear `user`
      router.push("/");
    } catch (err) {
      console.error("Error logging out:", err);
    }
  };

  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 sm:py-5">
      <Link href="/" className="text-2xl font-extrabold tracking-tight">
        <span className="text-[#0e2756]">pa</span>
        <span className="text-[#ff0f64]">level</span>
      </Link>

      {/* IF NOT LOGGED IN → show Signup / Login */}
      {!user && (
        <nav className="flex items-center gap-3 text-xs font-semibold sm:gap-5 sm:text-sm">
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
      )}

      {/* IF LOGGED IN → show Dashboard + Logout */}
      {user && (
        <nav className="flex items-center gap-3 text-xs font-semibold sm:gap-4 sm:text-sm">
          <Link href="/rooms" className="hidden text-[#0e2756] sm:inline">
            Browse rooms
          </Link>

          <Link
            href="/tenant-dashboard"
            className="hidden text-[#0e2756] md:inline"
          >
            Dashboard
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-full border border-[#ffd0e2] bg-[#fff3f8] px-4 py-1.5 text-xs font-semibold text-[#ff0f64] sm:px-5 sm:py-2"
          >
            Logout
          </button>
        </nav>
      )}
    </header>
  );
}

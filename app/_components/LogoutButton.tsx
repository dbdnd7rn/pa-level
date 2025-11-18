// app/_components/LogoutButton.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";

type LogoutButtonProps = {
  /** Optional custom classes to tweak styling where used */
  className?: string;
  /** Optional path to navigate to after logout (e.g., "/") */
  redirectTo?: string;
  /** Optional button label (defaults to "Logout") */
  label?: string;
};

export default function LogoutButton({
  className,
  redirectTo,
  label = "Logout",
}: LogoutButtonProps) {
  const { logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
      if (redirectTo) router.push(redirectTo);
    } catch (err) {
      console.error("Logout error:", err);
      // You could surface a toast/UI message here if you add a toast system
    } finally {
      setLoading(false);
    }
  };

  const base =
    "rounded-full border border-[#ccd1ea] bg-white px-6 py-2 text-sm font-semibold text-[#0e2756] disabled:opacity-60";

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className={`${base} ${className ?? ""}`}
    >
      {loading ? "Logging out…" : label}
    </button>
  );
}

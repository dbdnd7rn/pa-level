// app/_components/LogoutButton.tsx
"use client";

import { useAuth } from "./AuthProvider";

export default function LogoutButton() {
  const { logout } = useAuth();

  return (
    <button
      onClick={logout}
      className="rounded-full border border-[#ccd1ea] px-6 py-2 text-sm font-semibold text-[#0e2756]"
    >
      Logout
    </button>
  );
}

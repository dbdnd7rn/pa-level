"use client";

import { ReactNode } from "react";
import { useAuth } from "./AuthProvider";

type RoleGateProps = {
  allowedRole: "tenant" | "landlord" | "admin";
  children: ReactNode;
  fallback?: ReactNode;
};

export default function RoleGate({
  allowedRole,
  children,
  fallback,
}: RoleGateProps) {
  const { user, role, loading, setRole } = useAuth();

  // While Firebase is checking the session
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050816] text-sm text-white">
        Checking your account&hellip;
      </div>
    );
  }

  // Not logged in (RequireAuth usually handles this, but keep it safe)
  if (!user) {
    return (
      fallback ?? (
        <div className="flex min-h-screen items-center justify-center bg-black text-sm text-red-500">
          You need to be logged in to access this area.
        </div>
      )
    );
  }

  // Logged in but wrong / missing role
  if (role !== allowedRole) {
    return (
      fallback ?? (
        <div className="flex min-h-screen items-center justify-center bg-black text-center text-sm text-red-500">
          <div className="space-y-3">
            <p>You don&apos;t have access to this area.</p>
            <p className="text-xs text-gray-300">
              Current role:{" "}
              <span className="font-semibold">
                {role ?? "none set yet"}
              </span>{" "}
              &bull; This page needs:{" "}
              <span className="font-semibold">{allowedRole}</span>
            </p>
            <button
              onClick={() => setRole(allowedRole)}
              className="rounded-full bg-[#ff0f64] px-5 py-2 text-xs font-semibold text-white shadow-[0_12px_25px_rgba(255,15,100,0.6)]"
            >
              Switch my role to &quot;{allowedRole}&quot; for now
            </button>
          </div>
        </div>
      )
    );
  }

  // All good
  return <>{children}</>;
}

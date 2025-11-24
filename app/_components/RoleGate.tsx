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
  const { user, role, loading } = useAuth();

  // 1) Waiting for Firebase to resolve session
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050816] text-sm text-white">
        Checking your account&hellip;
      </div>
    );
  }

  // 2) Not logged in (RequireAuth usually guards this, but keep it safe)
  if (!user) {
    return (
      fallback ?? (
        <div className="flex min-h-screen items-center justify-center bg-black text-sm text-red-500">
          You need to be logged in to access this area.
        </div>
      )
    );
  }

  // 3) Logged in but wrong / missing role
  if (role !== allowedRole) {
    return (
      fallback ?? (
        <div className="flex min-h-screen items-center justify-center bg-black text-center text-sm text-red-500">
          <div className="space-y-3">
            <p>You don&apos;t have access to this area.</p>
            <p className="text-xs text-gray-300">
              Current role:{" "}
              <span className="font-semibold">{role ?? "none set yet"}</span>{" "}
              &bull; This page needs:{" "}
              <span className="font-semibold">{allowedRole}</span>
            </p>
          </div>
        </div>
      )
    );
  }

  // 4) All good
  return <>{children}</>;
}

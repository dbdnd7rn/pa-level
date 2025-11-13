// app/_components/RequireAuth.tsx
"use client";

import { ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";

type Props = {
  children: ReactNode;
};

export default function RequireAuth({ children }: Props) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      // send them to login if not authenticated
      router.push(`/login?next=${encodeURIComponent(pathname || "/")}`);
    }
  }, [loading, user, router, pathname]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f7fb] text-[#0e2756]">
        <p className="text-sm font-semibold">Checking your session…</p>
      </div>
    );
  }

  if (!user) {
    // momentarily blank while redirecting
    return null;
  }

  return <>{children}</>;
}

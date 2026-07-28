"use client";

import { usePathname } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/protected-route";

export function AppAuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/login") {
    return <>{children}</>;
  }

  return <ProtectedRoute>{children}</ProtectedRoute>;
}

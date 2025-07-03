"use client";

import { ProjectProvider } from "@/context/ProjectContext";
import { AuthProvider } from "@/context/AuthContext";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
        <ProjectProvider>{children}</ProjectProvider>
    </AuthProvider>
  );
}

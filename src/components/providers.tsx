
"use client";

import { ProjectProvider } from "@/context/ProjectContext";
import { AuthProvider } from "@/context/AuthContext";
import { EquipmentProvider } from "@/context/EquipmentContext";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ProjectProvider>
        <EquipmentProvider>{children}</EquipmentProvider>
      </ProjectProvider>
    </AuthProvider>
  );
}

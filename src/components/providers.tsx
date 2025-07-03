"use client";

import { ProjectProvider } from "@/context/ProjectContext";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return <ProjectProvider>{children}</ProjectProvider>;
}


"use client";

import { ProjectProvider } from "@/context/ProjectContext";
import { AuthProvider } from "@/context/AuthContext";
import { EquipmentProvider } from "@/context/EquipmentContext";
import { InspectorProvider } from "@/context/InspectorContext";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ColorThemeProvider } from "@/context/ThemeContext";
import { ReportProvider } from "@/context/ReportContext";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      <ColorThemeProvider>
        <AuthProvider>
          <ProjectProvider>
            <EquipmentProvider>
              <InspectorProvider>
                <ReportProvider>{children}</ReportProvider>
              </InspectorProvider>
            </EquipmentProvider>
          </ProjectProvider>
        </AuthProvider>
      </ColorThemeProvider>
    </NextThemesProvider>
  );
}

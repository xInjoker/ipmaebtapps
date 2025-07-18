
"use client";

import { ProjectProvider } from "@/context/ProjectContext";
import { AuthProvider } from "@/context/AuthContext";
import { EquipmentProvider } from "@/context/EquipmentContext";
import { InspectorProvider } from "@/context/InspectorContext";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ColorThemeProvider } from "@/context/ThemeContext";
import { ReportProvider } from "@/context/ReportContext";
import { EmployeeProvider } from "@/context/EmployeeContext";
import { TripProvider } from "@/context/TripContext";
import { TenderProvider } from "@/context/TenderContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      <ColorThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <EmployeeProvider>
              <ProjectProvider>
                <EquipmentProvider>
                  <InspectorProvider>
                    <ReportProvider>
                      <TripProvider>
                        <TenderProvider>{children}</TenderProvider>
                      </TripProvider>
                    </ReportProvider>
                  </InspectorProvider>
                </EquipmentProvider>
              </ProjectProvider>
            </EmployeeProvider>
          </NotificationProvider>
        </AuthProvider>
      </ColorThemeProvider>
    </NextThemesProvider>
  );
}

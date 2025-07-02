import type { Metadata } from 'next';
import './globals.css';
import { SidebarProvider, Sidebar, SidebarInset, SidebarHeader, SidebarContent } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';
import { SidebarNav } from '@/components/sidebar-nav';
import { SiteHeader } from '@/components/site-header';
import Link from 'next/link';
import { GanttChart } from 'lucide-react';
import { UserNav } from '@/components/user-nav';

export const metadata: Metadata = {
  title: 'ProTrack',
  description: 'Visualize and manage your project\'s progress and financials.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <div className="relative flex min-h-screen flex-col">
            <SidebarProvider>
              <Sidebar>
                <SidebarHeader>
                  <Link href="/" className="flex items-center gap-2.5 px-2">
                    <GanttChart className="h-6 w-6 text-primary" />
                    <h1 className="text-xl font-headline font-semibold text-primary">
                      ProTrack
                    </h1>
                  </Link>
                </SidebarHeader>
                <SidebarContent>
                  <SidebarNav />
                </SidebarContent>
              </Sidebar>
              <SidebarInset>
                <SiteHeader />
                <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
              </SidebarInset>
            </SidebarProvider>
        </div>
        <Toaster />
      </body>
    </html>
  );
}

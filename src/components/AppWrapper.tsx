
'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/sidebar-nav';
import { SiteHeader } from '@/components/site-header';
import Link from 'next/link';
import { GanttChart, Loader } from 'lucide-react';
import { UserNav } from '@/components/user-nav';


export function AppWrapper({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isInitializing, user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isPublicPath = pathname === '/login' || pathname === '/register' || pathname === '/pending-approval';

  useEffect(() => {
    if (isInitializing) {
      return;
    }
    if (!isAuthenticated && !isPublicPath) {
      router.push('/login');
    }
  }, [isAuthenticated, isInitializing, isPublicPath, user, router]);

  if (isInitializing || (!isAuthenticated && !isPublicPath)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isPublicPath) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        {children}
      </div>
    );
  }
  
  return (
    <div className="relative flex min-h-screen flex-col">
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <Link
              href="/"
              className="flex items-center justify-center gap-2.5 px-2"
            >
              <GanttChart className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-headline font-semibold text-primary group-data-[state=collapsed]/sidebar-wrapper:hidden">
                ProTrack
              </h1>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarNav />
          </SidebarContent>
          <SidebarFooter>
            <UserNav isSidebarFooter={true}/>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <SiteHeader />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
          <footer className="border-t bg-card py-4 text-center text-sm text-muted-foreground">
            Copyright © 2025 IAPPM
          </footer>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

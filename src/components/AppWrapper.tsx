
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
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { getInitials, getAvatarColor } from '@/lib/utils';
import { cn } from '@/lib/utils';


export function AppWrapper({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isInitializing, user, roles } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isPublicPath = pathname === '/login' || pathname === '/register';

  useEffect(() => {
    if (isInitializing) {
      return;
    }
    if (!isAuthenticated && !isPublicPath) {
      router.push('/login');
    }
  }, [isAuthenticated, isInitializing, isPublicPath, router]);

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
  
  const userRole = user ? roles.find((r) => r.id === user.roleId) : null;
  const avatarColor = user ? getAvatarColor(user.name) : { background: '', color: ''};

  return (
    <div className="relative flex min-h-screen flex-col">
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <Link href="/" className="flex items-center gap-2.5 px-2">
              <GanttChart className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-headline font-semibold text-primary group-data-[state=collapsed]/sidebar-wrapper:hidden">
                ProTrack
              </h1>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarNav />
          </SidebarContent>
          <SidebarFooter>
            <Card className="overflow-hidden bg-sidebar-accent group-data-[state=collapsed]/sidebar-wrapper:hidden">
                <CardContent className="flex items-center gap-3 p-3">
                    <Avatar className="h-10 w-10">
                        {user?.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
                        <AvatarFallback style={{
                            backgroundColor: avatarColor.background,
                            color: avatarColor.color,
                          }}
                        >
                            {user && getInitials(user.name)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{user?.name}</p>
                        <p className="truncate text-xs text-sidebar-foreground/80">{userRole?.name || 'Staff'}</p>
                    </div>
                </CardContent>
            </Card>
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

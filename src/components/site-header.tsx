
'use client';

import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserNav } from '@/components/user-nav';
import { NotificationNav } from './notification-nav';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-card px-4 sm:px-6 lg:px-8">
      <SidebarTrigger />
      <div className="flex flex-1 items-center justify-end space-x-2">
        <div className="relative hidden sm:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="pl-8 md:w-[200px] lg:w-[300px]"
          />
        </div>
        <NotificationNav />
        <ThemeToggle />
        <UserNav isSidebarFooter={false} />
      </div>
    </header>
  );
}

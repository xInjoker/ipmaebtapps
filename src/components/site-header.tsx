'use client';

import { usePathname } from 'next/navigation';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserNav } from '@/components/user-nav';
import { NotificationNav } from './notification-nav';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const getPageTitle = (pathname: string) => {
  if (pathname.startsWith('/projects')) return 'Projects';
  if (pathname.startsWith('/sanity-checker')) return 'AI Report Sanity Checker';
  if (pathname.startsWith('/profile')) return 'Profile';
  if (pathname === '/') return 'Dashboard';
  return 'ProTrack';
};

export function SiteHeader() {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur-sm sm:px-6 lg:px-8">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="md:hidden" />
        <h1 className="text-xl font-headline font-semibold md:text-2xl">
          {title}
        </h1>
      </div>
      <div className="flex flex-1 items-center justify-end space-x-2">
        <form className="hidden sm:block">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-8 md:w-[200px] lg:w-[300px]"
            />
          </div>
        </form>
        <NotificationNav />
        <UserNav />
      </div>
    </header>
  );
}

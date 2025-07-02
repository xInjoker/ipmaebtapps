'use client';

import { usePathname } from 'next/navigation';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserNav } from '@/components/user-nav';

const getPageTitle = (pathname: string) => {
  if (pathname.startsWith('/projects')) return 'Project Details';
  if (pathname.startsWith('/finances')) return 'Financial Management';
  if (pathname.startsWith('/sanity-checker')) return 'AI Report Sanity Checker';
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
      <div className="flex flex-1 items-center justify-end space-x-4">
        <UserNav />
      </div>
    </header>
  );
}

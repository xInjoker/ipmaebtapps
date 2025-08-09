
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Briefcase,
  ClipboardEdit,
  LayoutDashboard,
  Plane,
  Settings,
  User,
  UserCog,
  Users,
  Users2,
  Wrench,
  FileText,
  ChevronRight,
  ClipboardCheck,
  DatabaseZap,
} from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  useSidebar,
} from '@/components/ui/sidebar';
import { useProjects } from '@/context/ProjectContext';
import { useAuth } from '@/context/AuthContext';
import { type Permission } from '@/lib/users';
import { useMemo } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './ui/collapsible';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface MenuItem {
  href: string;
  label: string;
  icon: React.ElementType;
  permission: Permission;
  subItems?: { href: string; label: string }[];
  isCollapsible?: boolean;
}

export function SidebarNav() {
  const pathname = usePathname();
  const { projects } = useProjects();
  const { user, isHqUser, userHasPermission } = useAuth();

  const visibleProjects = useMemo(() => {
    if (!user) return [];
    if (user.roleId === 'project-admin') {
      return projects.filter(p => user.assignedProjectIds?.includes(p.id));
    }
    if (isHqUser) return projects;
    return projects.filter(p => p.branchId === user.branchId);
  }, [projects, user, isHqUser]);

  const menuItems: MenuItem[] = [
    {
      href: '/',
      label: 'Dashboard',
      icon: LayoutDashboard,
      permission: 'view-dashboard',
    },
    {
      href: '/approvals',
      label: 'My Approvals',
      icon: ClipboardCheck,
      permission: 'view-approvals',
    },
    {
      href: '/tenders',
      label: 'Tenders',
      icon: FileText,
      permission: 'view-tenders',
    },
    {
      href: '/projects',
      label: 'Projects',
      icon: Briefcase,
      permission: 'manage-projects',
      subItems: visibleProjects.map((project) => ({
        href: `/projects/${project.id}`,
        label: project.contractNumber,
      })),
      isCollapsible: true,
    },
    {
      href: '/trips',
      label: 'Business Trips',
      icon: Plane,
      permission: 'manage-trips',
    },
    {
      href: '/employees',
      label: 'Employees',
      icon: Users,
      permission: 'manage-employees',
    },
    {
      href: '/reports',
      label: 'Reporting',
      icon: ClipboardEdit,
      permission: 'manage-reports',
      subItems: [
        { href: '/reports/penetrant', label: 'Penetrant Test' },
        { href: '/reports/magnetic', label: 'Magnetic Particle' },
        { href: '/reports/ultrasonic', label: 'Ultrasonic Test' },
        { href: '/reports/radiographic', label: 'Radiographic Test' },
        { href: '/reports/flash', label: 'Flash Report' },
        { href: '/reports/inspection', label: 'Inspection Report' },
      ],
      isCollapsible: true,
    },
    {
      href: '/equipment',
      label: 'Equipment',
      icon: Wrench,
      permission: 'view-equipment',
    },
    {
      href: '/inspectors',
      label: 'Inspectors',
      icon: Users2,
      permission: 'view-inspector',
    },
    {
      href: '/user-management',
      label: 'User Management',
      icon: UserCog,
      permission: 'manage-users',
    },
    {
      href: '/settings',
      label: 'Settings',
      icon: Settings,
      permission: 'view-settings',
    },
    {
      href: '/seed-database',
      label: 'Seed Database',
      icon: DatabaseZap,
      permission: 'super-admin', // Only for super-admin
    },
    { href: '/profile', label: 'Profile', icon: User, permission: 'view-profile' },
  ];

  const accessibleMenuItems = menuItems.filter((item) =>
    userHasPermission(item.permission)
  );

  return (
    <SidebarMenu>
      {accessibleMenuItems.map((item) => {
        const isMainActive =
          item.href === '/'
            ? pathname === '/'
            : pathname.startsWith(item.href);

        const isActive = isMainActive;
        
        const Icon = item.icon;

        if (item.isCollapsible && item.subItems && item.subItems.length > 0) {
          return (
            <Collapsible key={item.href} asChild>
              <SidebarMenuItem>
                <div className="relative">
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.label}
                  >
                    <Link href={item.href}>
                      <Icon />
                      <span className="min-w-0 flex-1 whitespace-nowrap group-data-[state=collapsed]/sidebar-wrapper:hidden">
                        {item.label}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 group-data-[state=collapsed]/sidebar-wrapper:hidden"
                    >
                      <ChevronRight className="h-4 w-4 transition-transform [&[data-state=open]]:rotate-90" />
                      <span className="sr-only">Toggle</span>
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent asChild>
                  <SidebarMenuSub>
                    {item.subItems.map((subItem) => (
                      <SidebarMenuItem key={subItem.href}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={pathname.startsWith(subItem.href)}
                        >
                          <Link href={subItem.href}>
                            <span>{subItem.label}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        }

        return (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              isActive={isActive}
              tooltip={item.label}
            >
              <Link href={item.href}>
                <Icon />
                <span className="min-w-0 flex-1 whitespace-nowrap group-data-[state=collapsed]/sidebar-wrapper:hidden">{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}

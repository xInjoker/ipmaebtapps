
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BrainCircuit,
  Briefcase,
  LayoutDashboard,
  Settings,
  User,
  UserCog,
  Users,
  Users2,
  Wrench,
  ClipboardEdit,
  Plane,
} from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import { useProjects } from '@/context/ProjectContext';
import { useAuth } from '@/context/AuthContext';
import { type Permission } from '@/lib/users';
import { useMemo } from 'react';

interface MenuItem {
    href: string;
    label: string;
    icon: React.ElementType;
    permission: Permission;
    subItems?: { href: string; label: string; }[];
}

export function SidebarNav() {
  const pathname = usePathname();
  const { projects } = useProjects();
  const { user, isHqUser, userHasPermission } = useAuth();

  const visibleProjects = useMemo(() => {
    if (isHqUser) return projects;
    if (!user) return [];
    return projects.filter(p => p.branchId === user.branchId);
  }, [projects, user, isHqUser]);

  const menuItems: MenuItem[] = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard, permission: 'view-dashboard' },
    {
      href: '/projects',
      label: 'Projects',
      icon: Briefcase,
      permission: 'manage-projects',
      subItems: visibleProjects.map((project) => ({
        href: `/projects/${project.id}`,
        label: project.contractNumber,
      })),
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
        { href: '/reports/other', label: 'Other Methods' },
      ]
    },
    { href: '/equipment', label: 'Equipment', icon: Wrench, permission: 'view-equipment' },
    { href: '/inspectors', label: 'Inspectors', icon: Users2, permission: 'view-inspector' },
    {
      href: '/user-management',
      label: 'User Management',
      icon: UserCog,
      permission: 'manage-users',
    },
    { href: '/settings', label: 'Settings', icon: Settings, permission: 'view-settings' },
    { href: '/profile', label: 'Profile', icon: User, permission: 'view-profile' }
  ];

  const accessibleMenuItems = menuItems.filter(item => userHasPermission(item.permission));


  return (
    <SidebarMenu>
      {accessibleMenuItems.map((item) => {
        const isMainActive =
          item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
        const areSubItemsActive =
          item.subItems?.some((sub: { href: string; }) => pathname === sub.href) ?? false;
        const isActive = isMainActive || areSubItemsActive;

        return (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              isActive={isActive}
              tooltip={item.label}
            >
              <Link href={item.href}>
                <item.icon />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>

            {item.subItems && item.subItems.length > 0 && (
              <SidebarMenuSub>
                {item.subItems.map((subItem) => (
                  <SidebarMenuSubItem key={subItem.href}>
                    <SidebarMenuSubButton
                      asChild
                      isActive={pathname === subItem.href}
                    >
                      <Link href={subItem.href}>
                        <span>{subItem.label}</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            )}
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}

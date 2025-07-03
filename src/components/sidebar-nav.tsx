'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BrainCircuit,
  Briefcase,
  LayoutDashboard,
  Settings,
  User,
  Users,
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
    { href: '/sanity-checker', label: 'AI Sanity Check', icon: BrainCircuit, permission: 'view-ai-sanity-check' },
    {
      href: '/user-management',
      label: 'User Management',
      icon: Users,
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
              tooltip={{ children: item.label, side: 'right' }}
            >
              <Link href={item.href}>
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>

            {item.subItems && item.subItems.length > 0 && (
              <SidebarMenuSub>
                {item.subItems.map((subItem: { href: string, label: string }) => (
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

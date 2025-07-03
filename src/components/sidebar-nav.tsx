'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BrainCircuit,
  Briefcase,
  LayoutDashboard,
  Settings,
  User,
  Users, // Import Users icon
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
import { useAuth } from '@/context/AuthContext'; // Import useAuth

export function SidebarNav() {
  const pathname = usePathname();
  const { projects } = useProjects();
  const { user } = useAuth(); // Get user from auth context

  const menuItems: any[] = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    {
      href: '/projects',
      label: 'Projects',
      icon: Briefcase,
      subItems: projects.map((project) => ({
        href: `/projects/${project.id}`,
        label: project.contractNumber,
      })),
    },
    { href: '/sanity-checker', label: 'AI Sanity Check', icon: BrainCircuit },
  ];

  // Conditionally add User Management link
  if (user?.role === 'super-user') {
    menuItems.push({
      href: '/user-management',
      label: 'User Management',
      icon: Users,
    });
  }

  // Add settings and profile at the end
  menuItems.push(
    { href: '/settings', label: 'Settings', icon: Settings },
    { href: '/profile', label: 'Profile', icon: User }
  );

  return (
    <SidebarMenu>
      {menuItems.map((item) => {
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

            {item.subItems && (
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

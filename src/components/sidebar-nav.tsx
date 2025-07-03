'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrainCircuit, Briefcase, DollarSign, LayoutDashboard } from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import { initialProjects } from '@/lib/data';

export function SidebarNav() {
  const pathname = usePathname();

  const menuItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    {
      href: '/projects',
      label: 'Projects',
      icon: Briefcase,
      subItems: initialProjects.map((project) => ({
        href: `/projects/${project.id}`,
        label: project.contractNumber,
      })),
    },
    { href: '/finances', label: 'Finances', icon: DollarSign },
    { href: '/sanity-checker', label: 'AI Sanity Check', icon: BrainCircuit },
  ];

  return (
    <SidebarMenu>
      {menuItems.map((item) => {
        const isMainActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
        const areSubItemsActive = item.subItems?.some((sub) => pathname === sub.href) ?? false;
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

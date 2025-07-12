
'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { getInitials, getAvatarColor } from '@/lib/utils';
import type { Role } from '@/lib/users';

type UserNavProps = {
  isSidebarFooter?: boolean;
};

export function UserNav({ isSidebarFooter = false }: UserNavProps) {
  const { user, logout, roles } = useAuth();

  if (!user) {
    return null;
  }

  const userRole = roles.find((r: Role) => r.id === user.roleId);
  const avatarColor = getAvatarColor(user.name);

  if (isSidebarFooter) {
    return (
       <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-auto w-full justify-start gap-3 p-3 overflow-hidden group-data-[state=collapsed]/sidebar-wrapper:w-12 group-data-[state=collapsed]/sidebar-wrapper:h-12 group-data-[state=collapsed]/sidebar-wrapper:p-0 group-data-[state=collapsed]/sidebar-wrapper:justify-center">
                    <Avatar className="h-10 w-10">
                        {user?.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
                        <AvatarFallback style={{ backgroundColor: avatarColor.background, color: avatarColor.color }}>
                            {getInitials(user.name)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 text-left group-data-[state=collapsed]/sidebar-wrapper:hidden">
                        <p className="truncate text-sm font-semibold">{user.name}</p>
                        <p className="truncate text-xs text-sidebar-foreground/80">{userRole?.name || 'Staff'}</p>
                    </div>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-[var(--sidebar-width)] mb-2 ml-2">
                <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                    Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative flex h-auto items-center gap-2 rounded-md px-2 py-1.5"
        >
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {userRole?.name || 'Staff'}
            </p>
          </div>
          <Avatar className="h-9 w-9">
            {user.avatarUrl ? (
              <AvatarImage src={user.avatarUrl} alt={user.name} />
            ) : null}
            <AvatarFallback
              style={{
                backgroundColor: avatarColor.background,
                color: avatarColor.color,
              }}
            >
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/profile">Profile</Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

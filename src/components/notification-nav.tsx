
'use client';

import { Bell } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

export function NotificationNav() {
  const { notifications, unreadCount, markAsRead } = useNotifications();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
            )}
            <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 md:w-96" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex items-center justify-between p-1">
            <p className="text-sm font-medium leading-none">Notifications</p>
            {unreadCount > 0 && <Badge variant="secondary" className="text-xs">{unreadCount} new</Badge>}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="space-y-1 p-1 max-h-[400px] overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <DropdownMenuItem 
                    key={notification.id} 
                    className="flex flex-col items-start gap-1 whitespace-normal p-2 rounded-lg cursor-pointer data-[disabled]:opacity-100"
                    asChild
                    onSelect={() => markAsRead(notification.id)}
                    disabled={notification.isRead}
                >
                  <Link href={notification.link || '#'}>
                    <p className="font-medium text-sm">{notification.title}</p>
                    <p className="text-xs text-muted-foreground">{notification.description}</p>
                    <p className="text-xs text-muted-foreground self-end">
                      {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                    </p>
                  </Link>
                </DropdownMenuItem>
            ))) : (
              <div className="text-center text-sm text-muted-foreground p-4">
                No notifications yet.
              </div>
            )}
        </div>
        {notifications.length > 0 && (
            <>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="justify-center text-sm text-primary hover:!text-primary focus:text-primary cursor-pointer">
                    View all notifications
                </DropdownMenuItem>
            </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

'use client';

import { Bell } from 'lucide-react';
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

const notifications = [
    { title: "New Invoice Paid", description: "Invoice #INV-007 for Project Alpha has been paid.", time: "15m ago" },
    { title: "Task Due Soon", description: "Q3 Financial Report is due tomorrow.", time: "1h ago" },
    { title: "Expenditure Approved", description: "Expenditure for 'Tenaga Ahli' has been approved.", time: "2h ago" },
    { title: "New Comment", description: "John Doe commented on Project Gamma.", time: "1d ago" },
];

export function NotificationNav() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 md:w-96" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex items-center justify-between p-1">
            <p className="text-sm font-medium leading-none">Notifications</p>
            <Badge variant="secondary" className="text-xs">{notifications.length} new</Badge>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="space-y-1 p-1">
            {notifications.map((notification, index) => (
                <DropdownMenuItem key={index} className="flex flex-col items-start gap-1 whitespace-normal p-2 rounded-lg cursor-pointer">
                    <p className="font-medium text-sm">{notification.title}</p>
                    <p className="text-xs text-muted-foreground">{notification.description}</p>
                    <p className="text-xs text-muted-foreground self-end">{notification.time}</p>
                </DropdownMenuItem>
            ))}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="justify-center text-sm text-primary hover:!text-primary focus:text-primary cursor-pointer">
            View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

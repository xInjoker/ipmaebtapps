'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { type User, type UserRole } from '@/lib/users';

export default function UserManagementPage() {
  const { user, users, updateUserRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Protect this route for super-users only
    if (user && user.role !== 'super-user') {
      router.push('/');
    }
  }, [user, router]);
  
  if (!user || user.role !== 'super-user') {
    // Render nothing or a loading state while redirecting
    return null;
  }
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">User Management</CardTitle>
        <CardDescription>
          Assign roles and manage user permissions. Changes are saved automatically.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Change Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((managedUser: User) => (
                <TableRow key={managedUser.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                       <Avatar className="h-9 w-9">
                          <AvatarImage src={managedUser.avatarUrl} alt={managedUser.name} />
                          <AvatarFallback>{getInitials(managedUser.name)}</AvatarFallback>
                       </Avatar>
                       <span className="font-medium">{managedUser.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{managedUser.email}</TableCell>
                  <TableCell>
                    <Badge variant={managedUser.role === 'super-user' ? 'destructive' : 'secondary'}>
                      {managedUser.role.replace('-', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Select
                      value={managedUser.role}
                      onValueChange={(value: UserRole) => updateUserRole(managedUser.id, value)}
                      disabled={managedUser.id === user.id} // Super user can't change their own role
                    >
                      <SelectTrigger className="w-[180px] ml-auto">
                        <SelectValue placeholder="Change role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="super-user">Super User</SelectItem>
                        <SelectItem value="project-manager">Project Manager</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

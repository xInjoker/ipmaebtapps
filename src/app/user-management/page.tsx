'use client';

import { useState, useEffect } from 'react';
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type UserRole = 'super-user' | 'project-manager';

type ManagedUser = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
};

const initialUsers: ManagedUser[] = [
  { id: 1, name: 'Super User', email: 'superuser@example.com', role: 'super-user', avatarUrl: 'https://placehold.co/40x40.png' },
  { id: 2, name: 'Project Manager', email: 'pm@example.com', role: 'project-manager', avatarUrl: 'https://placehold.co/40x40.png' },
  { id: 3, name: 'Jane Doe', email: 'jane.doe@example.com', role: 'project-manager', avatarUrl: 'https://placehold.co/40x40.png' },
  { id: 4, name: 'John Smith', email: 'john.smith@example.com', role: 'project-manager', avatarUrl: 'https://placehold.co/40x40.png' },
];

export default function UserManagementPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<ManagedUser[]>(initialUsers);

  useEffect(() => {
    // Protect this route for super-users only
    if (user && user.role !== 'super-user') {
      router.push('/');
    }
  }, [user, router]);
  
  const handleRoleChange = (userId: number, newRole: UserRole) => {
    setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
  };

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
          Assign roles and manage user permissions.
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
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((managedUser) => (
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
                      onValueChange={(value: UserRole) => handleRoleChange(managedUser.id, value)}
                      disabled={managedUser.email === user.email} // Super user can't change their own role
                    >
                      <SelectTrigger className="w-[180px]">
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
        <div className="flex justify-end mt-6">
            <Button>Save Changes</Button>
        </div>
      </CardContent>
    </Card>
  );
}

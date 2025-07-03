'use client';

import { useEffect, useState } from 'react';
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
import { type User, type Role, type Permission, permissions, formatPermissionName } from '@/lib/users';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

function RoleFormDialog({
  isOpen,
  onOpenChange,
  role,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role | null;
}) {
  const { addRole, updateRole, permissions } = useAuth();
  const [name, setName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<Set<Permission>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    if (role) {
      setName(role.name);
      setSelectedPermissions(new Set(role.permissions));
    } else {
      setName('');
      setSelectedPermissions(new Set());
    }
  }, [role, isOpen]);

  const handlePermissionChange = (permission: Permission, checked: boolean) => {
    const newPermissions = new Set(selectedPermissions);
    if (checked) {
      newPermissions.add(permission);
    } else {
      newPermissions.delete(permission);
    }
    setSelectedPermissions(newPermissions);
  };

  const handleSubmit = () => {
    if (!name) {
      toast({ variant: 'destructive', title: 'Role name cannot be empty.' });
      return;
    }
    const roleData = { name, permissions: Array.from(selectedPermissions) };
    if (role) {
      updateRole(role.id, roleData);
      toast({ title: 'Role Updated', description: `The "${name}" role has been updated.` });
    } else {
      addRole(roleData);
      toast({ title: 'Role Created', description: `The "${name}" role has been created.` });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{role ? 'Edit Role' : 'Add New Role'}</DialogTitle>
          <DialogDescription>
            {role ? `Update the details for the "${role.name}" role.` : 'Create a new role and assign permissions.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="roleName">Role Name</Label>
            <Input id="roleName" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Accountant" />
          </div>
          <div className="space-y-2">
            <Label>Permissions</Label>
            <div className="grid grid-cols-2 gap-4 rounded-md border p-4">
              {permissions.map((p) => (
                <div key={p} className="flex items-center gap-2">
                  <Checkbox
                    id={`perm-${p}`}
                    checked={selectedPermissions.has(p)}
                    onCheckedChange={(checked) => handlePermissionChange(p, !!checked)}
                  />
                  <Label htmlFor={`perm-${p}`} className="font-normal">
                    {formatPermissionName(p)}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Save Role</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


export default function UserManagementPage() {
  const { user, users, roles, updateUser, branches, deleteRole, userHasPermission } = useAuth();
  const router = useRouter();

  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [roleToEdit, setRoleToEdit] = useState<Role | null>(null);

  useEffect(() => {
    if (!userHasPermission('manage-users')) {
      router.push('/');
    }
  }, [user, userHasPermission, router]);

  if (!user || !userHasPermission('manage-users')) {
    return null;
  }
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const handleEditRole = (role: Role) => {
    setRoleToEdit(role);
    setIsRoleDialogOpen(true);
  }

  const handleAddNewRole = () => {
    setRoleToEdit(null);
    setIsRoleDialogOpen(true);
  }

  return (
    <>
    <Tabs defaultValue="users" className="space-y-4">
      <TabsList>
        <TabsTrigger value="users">User Assignments</TabsTrigger>
        <TabsTrigger value="roles">Role Management</TabsTrigger>
      </TabsList>
      <TabsContent value="users">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">User Assignments</CardTitle>
            <CardDescription>
              Assign roles and branches to users. Changes are saved automatically.
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
                    <TableHead>Branch</TableHead>
                    <TableHead className="text-right w-[190px]">Change Role</TableHead>
                    <TableHead className="text-right w-[190px]">Change Branch</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((managedUser: User) => {
                    const userRole = roles.find(r => r.id === managedUser.roleId);
                    const userBranch = branches.find(b => b.id === managedUser.branchId);
                    return (
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
                        <Badge variant={managedUser.roleId === 'super-admin' ? 'destructive' : 'secondary'}>
                          {userRole?.name || 'Unknown Role'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {userBranch?.name || 'Unknown Branch'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Select
                          value={managedUser.roleId}
                          onValueChange={(value: string) => updateUser(managedUser.id, { roleId: value })}
                          disabled={managedUser.id === user.id}
                        >
                          <SelectTrigger className="w-[180px] ml-auto">
                            <SelectValue placeholder="Change role" />
                          </SelectTrigger>
                          <SelectContent>
                            {roles.map(role => (
                              <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                       <TableCell className="text-right">
                        <Select
                          value={managedUser.branchId}
                          onValueChange={(value: string) => updateUser(managedUser.id, { branchId: value })}
                          disabled={managedUser.id === user.id}
                        >
                          <SelectTrigger className="w-[180px] ml-auto">
                            <SelectValue placeholder="Change branch" />
                          </SelectTrigger>
                          <SelectContent>
                            {branches.map(branch => (
                              <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  )})}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="roles">
        <Card>
          <CardHeader>
            <CardTitle>Role Management</CardTitle>
            <CardDescription>
              Define custom roles and their permissions for the application.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex justify-end">
              <Button onClick={handleAddNewRole}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Role
              </Button>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role Name</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">{role.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {role.permissions.length > 0 ? role.permissions.map(p => (
                            <Badge variant="outline" key={p}>{formatPermissionName(p as Permission)}</Badge>
                          )) : <span className="text-muted-foreground">No permissions</span>}
                           {role.id === 'super-admin' && <Badge variant="outline">All</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" disabled={!role.isEditable} onClick={() => handleEditRole(role)}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit Role</span>
                        </Button>
                        <Button variant="ghost" size="icon" disabled={!role.isEditable} onClick={() => deleteRole(role.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                           <span className="sr-only">Delete Role</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
    <RoleFormDialog isOpen={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen} role={roleToEdit} />
    </>
  );
}

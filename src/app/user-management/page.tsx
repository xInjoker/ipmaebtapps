

'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import {
  type User,
  type Role,
  type Permission,
  permissions,
  formatPermissionName,
} from '@/lib/users';
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
import { getInitials, getAvatarColor } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useProjects } from '@/context/ProjectContext';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  const [selectedPermissions, setSelectedPermissions] = useState<
    Set<Permission>
  >(new Set());
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

  const handlePermissionChange = useCallback((permission: Permission, checked: boolean) => {
    const newPermissions = new Set(selectedPermissions);
    if (checked) {
      newPermissions.add(permission);
    } else {
      newPermissions.delete(permission);
    }
    setSelectedPermissions(newPermissions);
  }, [selectedPermissions]);

  const handleSubmit = useCallback(() => {
    if (!name) {
      toast({ variant: 'destructive', title: 'Role name cannot be empty.' });
      return;
    }
    const roleData = { name, permissions: Array.from(selectedPermissions) };
    if (role) {
      updateRole(role.id, roleData);
      toast({
        title: 'Role Updated',
        description: `The "${name}" role has been updated.`,
      });
    } else {
      addRole(roleData);
      toast({
        title: 'Role Created',
        description: `The "${name}" role has been created.`,
      });
    }
    onOpenChange(false);
  }, [name, selectedPermissions, role, addRole, updateRole, onOpenChange, toast]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{role ? 'Edit Role' : 'Add New Role'}</DialogTitle>
          <DialogDescription>
            {role
              ? `Update the details for the "${role.name}" role.`
              : 'Create a new role and assign permissions.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="roleName">Role Name</Label>
            <Input
              id="roleName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Accountant"
            />
          </div>
          <div className="space-y-2">
            <Label>Permissions</Label>
            <div className="grid grid-cols-2 gap-4 rounded-md border p-4">
              {permissions.map((p) => (
                <div key={p} className="flex items-center gap-2">
                  <Checkbox
                    id={`perm-${p}`}
                    checked={selectedPermissions.has(p)}
                    onCheckedChange={(checked) =>
                      handlePermissionChange(p, !!checked)
                    }
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save Role</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ProjectAssignmentDialog({
    userToAssign,
    onOpenChange,
    onSave,
}: {
    userToAssign: User | null;
    onOpenChange: (open: boolean) => void;
    onSave: (userId: string, projectIds: string[]) => void;
}) {
    const { projects } = useProjects();
    const [assignedProjects, setAssignedProjects] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (userToAssign) {
            setAssignedProjects(new Set(userToAssign.assignedProjectIds || []));
        }
    }, [userToAssign]);

    const handleProjectToggle = useCallback((projectId: string) => {
        setAssignedProjects(prev => {
            const newSet = new Set(prev);
            if (newSet.has(projectId)) {
                newSet.delete(projectId);
            } else {
                newSet.add(projectId);
            }
            return newSet;
        });
    }, []);

    const handleSave = useCallback(() => {
        if (userToAssign) {
            onSave(userToAssign.uid, Array.from(assignedProjects));
            onOpenChange(false);
        }
    }, [userToAssign, onSave, onOpenChange, assignedProjects]);
    
    if (!userToAssign) return null;

    return (
        <Dialog open={!!userToAssign} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Assign Projects to {userToAssign.name}</DialogTitle>
                    <DialogDescription>
                        Select the projects this user should have access to.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-72 my-4">
                    <div className="space-y-2 p-1">
                        {projects.map(project => (
                            <div key={project.id} className="flex items-center justify-between rounded-md border p-3">
                                <Label htmlFor={`proj-${project.id}`} className="font-normal">
                                    {project.name}
                                </Label>
                                <Checkbox
                                    id={`proj-${project.id}`}
                                    checked={assignedProjects.has(project.id)}
                                    onCheckedChange={() => handleProjectToggle(project.id)}
                                />
                            </div>
                        ))}
                    </div>
                </ScrollArea>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSave}>Save Assignments</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function UserManagementPage() {
  const {
    user,
    users,
    roles,
    updateUser,
    branches,
    deleteRole,
    userHasPermission,
  } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [managedUsers, setManagedUsers] = useState<User[]>([]);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [roleToEdit, setRoleToEdit] = useState<Role | null>(null);
  const [assignmentUser, setAssignmentUser] = useState<User | null>(null);

  useEffect(() => {
    setManagedUsers(users);
  }, [users]);

  const hasChanges = useMemo(() => {
    if (!users || !managedUsers || users.length !== managedUsers.length) return false;
    return JSON.stringify(users) !== JSON.stringify(managedUsers);
  }, [users, managedUsers]);

  const handleUserChange = useCallback((
    userId: string,
    field: keyof User,
    value: any
  ) => {
    setManagedUsers((currentUsers) =>
      currentUsers.map((u) => (u.uid === userId ? { ...u, [field]: value } : u))
    );
  }, []);

  const handleSaveChanges = useCallback(() => {
    managedUsers.forEach((mu) => {
      const originalUser = users.find((u) => u.uid === mu.uid);
      if (
        originalUser &&
        JSON.stringify(originalUser) !== JSON.stringify(mu)
      ) {
        updateUser(mu.uid, mu);
      }
    });
    toast({
      title: 'Changes Saved',
      description: 'User assignments have been successfully updated.',
    });
  }, [managedUsers, users, updateUser, toast]);

  const handleDiscardChanges = useCallback(() => {
    setManagedUsers(users);
  }, [users]);

  const handleEditRole = useCallback((role: Role) => {
    setRoleToEdit(role);
    setIsRoleDialogOpen(true);
  }, []);

  const handleAddNewRole = useCallback(() => {
    setRoleToEdit(null);
    setIsRoleDialogOpen(true);
  }, []);

  useEffect(() => {
    if (!userHasPermission('manage-users')) {
      router.push('/');
    }
  }, [user, userHasPermission, router]);

  if (!user || !userHasPermission('manage-users')) {
    return null;
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
              <CardTitle>User Assignments</CardTitle>
              <CardDescription>
                Assign roles, branches, and projects to users. Click "Save Changes" to
                apply your modifications.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Branch</TableHead>
                      <TableHead>Assigned Projects</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {managedUsers.map((managedUser: User) => {
                      const userRole = roles.find(
                        (r) => r.id === managedUser.roleId
                      );
                      const userBranch = branches.find(
                        (b) => b.id === managedUser.branchId
                      );
                      const avatarColor = getAvatarColor(managedUser.name);
                      return (
                        <TableRow key={managedUser.uid}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                {managedUser.avatarUrl ? (
                                  <AvatarImage
                                    src={managedUser.avatarUrl}
                                    alt={managedUser.name}
                                  />
                                ) : null}
                                <AvatarFallback
                                  style={{
                                    backgroundColor: avatarColor.background,
                                    color: avatarColor.color,
                                  }}
                                >
                                  {getInitials(managedUser.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{managedUser.name}</p>
                                <p className="text-xs text-muted-foreground">{managedUser.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={managedUser.roleId}
                              onValueChange={(value: string) =>
                                handleUserChange(
                                  managedUser.uid,
                                  'roleId',
                                  value
                                )
                              }
                              disabled={managedUser.uid === user.uid}
                            >
                              <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Change role" />
                              </SelectTrigger>
                              <SelectContent>
                                {roles.map((role) => (
                                  <SelectItem key={role.id} value={role.id}>
                                    {role.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                             <Select
                              value={managedUser.branchId}
                              onValueChange={(value: string) =>
                                handleUserChange(
                                  managedUser.uid,
                                  'branchId',
                                  value
                                )
                              }
                              disabled={managedUser.uid === user.uid}
                            >
                              <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Change branch" />
                              </SelectTrigger>
                              <SelectContent>
                                {branches.map((branch) => (
                                  <SelectItem key={branch.id} value={branch.id}>
                                    {branch.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            {userRole?.id === 'project-admin' ? (
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary">{managedUser.assignedProjectIds?.length || 0} projects</Badge>
                                    <Button variant="outline" size="sm" onClick={() => setAssignmentUser(managedUser)}>
                                        Manage
                                    </Button>
                                </div>
                            ) : (
                                <span className="text-muted-foreground text-sm">N/A</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            {hasChanges && (
              <CardFooter className="flex justify-end gap-2 border-t bg-muted/50 px-6 py-4">
                <Button variant="outline" onClick={handleDiscardChanges}>
                  Discard
                </Button>
                <Button onClick={handleSaveChanges}>Save Changes</Button>
              </CardFooter>
            )}
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
                {userHasPermission('manage-users') && (
                  <Button onClick={handleAddNewRole}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add New Role
                  </Button>
                )}
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
                      <TableRow key={`${role.id}-${role.name}`}>
                        <TableCell className="font-medium">
                          {role.name}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {role.permissions.length > 0 ? (
                              role.permissions.map((p) => (
                                <Badge variant="outline" key={p}>
                                  {formatPermissionName(p as Permission)}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-muted-foreground">
                                No permissions
                              </span>
                            )}
                            {role.id === 'super-admin' && (
                              <Badge variant="outline">All</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={!role.isEditable}
                            onClick={() => handleEditRole(role)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit Role</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={!role.isEditable}
                            onClick={() => deleteRole(role.id)}
                          >
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
      <RoleFormDialog
        isOpen={isRoleDialogOpen}
        onOpenChange={setIsRoleDialogOpen}
        role={roleToEdit}
      />
      <ProjectAssignmentDialog
        userToAssign={assignmentUser}
        onOpenChange={() => setAssignmentUser(null)}
        onSave={(userId, projectIds) => handleUserChange(userId, 'assignedProjectIds', projectIds)}
      />
    </>
  );
}

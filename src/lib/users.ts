
export const permissions = [
  'view-dashboard',
  'manage-projects',
  'view-ai-sanity-check',
  'manage-users',
  'view-settings',
  'view-profile',
] as const;

export type Permission = (typeof permissions)[number];

export function formatPermissionName(permission: Permission): string {
  return permission
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}


export type Role = {
  id: string; 
  name: string; 
  permissions: Permission[];
  isEditable: boolean;
};

export type User = {
  id: number;
  name: string;
  email: string;
  roleId: string;
  branchId: string;
  avatarUrl: string;
};

export type Branch = {
  id: string;
  name: string;
};

export const initialBranches: Branch[] = [
  { id: 'hq', name: 'Headquarters' },
  { id: 'branch-1', name: 'Branch Office 1' },
  { id: 'branch-2', name: 'Branch Office 2' },
];

export const initialRoles: Role[] = [
  { 
    id: 'super-user', 
    name: 'Super User', 
    permissions: [...permissions],
    isEditable: false 
  },
  { 
    id: 'project-manager', 
    name: 'Project Manager', 
    permissions: [
      'view-dashboard',
      'manage-projects',
      'view-ai-sanity-check',
      'view-settings',
      'view-profile',
    ],
    isEditable: true,
  },
];

export const initialUsers: User[] = [
  { id: 1, name: 'Super User', email: 'superuser@example.com', roleId: 'super-user', branchId: 'hq', avatarUrl: 'https://placehold.co/40x40.png' },
  { id: 2, name: 'Project Manager', email: 'pm@example.com', roleId: 'project-manager', branchId: 'branch-1', avatarUrl: 'https://placehold.co/40x40.png' },
  { id: 3, name: 'Jane Doe', email: 'jane.doe@example.com', roleId: 'project-manager', branchId: 'branch-1', avatarUrl: 'https://placehold.co/40x40.png' },
  { id: 4, name: 'John Smith', email: 'john.smith@example.com', roleId: 'project-manager', branchId: 'branch-2', avatarUrl: 'https://placehold.co/40x40.png' },
];


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
  { id: 'samarinda', name: 'Cabang Samarinda' },
  { id: 'balikpapan', name: 'Cabang Balikpapan' },
  { id: 'jakarta', name: 'Cabang Jakarta' },
  { id: 'surabaya', name: 'Cabang Surabaya' },
  { id: 'pekanbaru', name: 'Cabang Pekanbaru' },
];

export const initialRoles: Role[] = [
  { 
    id: 'super-admin', 
    name: 'Super Admin', 
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
  { id: 1, name: 'Super Admin', email: 'superuser@example.com', roleId: 'super-admin', branchId: 'hq', avatarUrl: '' },
  { id: 2, name: 'Project Manager', email: 'pm@example.com', roleId: 'project-manager', branchId: 'jakarta', avatarUrl: '' },
  { id: 3, name: 'Jane Doe', email: 'jane.doe@example.com', roleId: 'project-manager', branchId: 'jakarta', avatarUrl: '' },
  { id: 4, name: 'John Smith', email: 'john.smith@example.com', roleId: 'project-manager', branchId: 'surabaya', avatarUrl: '' },
];

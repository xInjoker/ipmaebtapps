
export const permissions = [
  'view-dashboard',
  'manage-projects',
  'view-equipment',
  'manage-equipment',
  'view-inspector',
  'manage-inspectors',
  'manage-reports',
  'manage-users',
  'view-settings',
  'view-profile',
  'view-approvals',
  'review-reports',
  'approve-reports',
  'manage-employees',
  'manage-trips',
  'super-admin', // Special permission for super-admin only checks
] as const;

export type Permission = (typeof permissions)[number];

export function formatPermissionName(permission: Permission): string {
  if (permission === 'super-admin') return 'Super Admin';
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
      'view-equipment',
      'manage-equipment',
      'view-inspector',
      'manage-inspectors',
      'manage-reports',
      'view-settings',
      'view-profile',
      'manage-employees',
      'manage-trips',
    ],
    isEditable: true,
  },
  {
    id: 'project-admin',
    name: 'Project Admin',
    permissions: [
      'view-dashboard',
      'manage-projects',
      'view-equipment',
      'manage-equipment',
      'view-inspector',
      'manage-inspectors',
      'manage-reports',
      'view-settings',
      'view-profile',
    ],
    isEditable: true,
  },
  { 
    id: 'inspector', 
    name: 'Inspector', 
    permissions: [
      'view-dashboard',
      'manage-reports',
      'view-equipment',
      'view-inspector',
      'view-approvals',
      'view-profile'
    ],
    isEditable: true,
  },
  {
    id: 'staff',
    name: 'Staff Cabang',
    permissions: ['view-dashboard', 'view-profile', 'view-equipment', 'view-inspector', 'manage-trips'],
    isEditable: true,
  },
  {
    id: 'employee',
    name: 'Employee',
    permissions: [
      'view-dashboard',
      'view-profile',
      'manage-employees',
      'manage-trips',
    ],
    isEditable: true,
  },
  {
    id: 'client-qaqc',
    name: 'Client QAQC',
    permissions: [
      'view-dashboard',
      'manage-reports',
      'view-approvals',
      'review-reports',
      'view-profile',
    ],
    isEditable: true,
  },
  {
    id: 'client-rep',
    name: 'Client Representative',
    permissions: [
      'view-dashboard',
      'manage-reports',
      'view-approvals',
      'approve-reports',
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
  { id: 5, name: 'QAQC Client', email: 'qaqc.client@example.com', roleId: 'client-qaqc', branchId: 'hq', avatarUrl: '' },
  { id: 6, name: 'Rep Client', email: 'rep.client@example.com', roleId: 'client-rep', branchId: 'hq', avatarUrl: '' },
  { id: 7, name: 'Project Admin User', email: 'pa@example.com', roleId: 'project-admin', branchId: 'jakarta', avatarUrl: '' },
  { id: 8, name: 'Inspector User', email: 'inspector@example.com', roleId: 'inspector', branchId: 'jakarta', avatarUrl: '' },
  { id: 9, name: 'Inspector1', email: 'inspector1@example.com', roleId: 'inspector', branchId: 'hq', avatarUrl: '' },
  { id: 10, name: 'Employee User', email: 'employee@example.com', roleId: 'employee', branchId: 'jakarta', avatarUrl: '' },
];

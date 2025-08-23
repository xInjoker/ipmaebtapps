

export const permissions = [
  'view-dashboard',
  'manage-projects',
  'create-projects',
  'edit-projects',
  'delete-projects',
  'view-project-financials',
  'manage-budget',
  'manage-invoices',
  'view-equipment',
  'manage-equipment',
  'view-inspector',
  'manage-inspectors',
  'manage-reports',
  'create-reports',
  'approve-reports',
  'delete-reports',
  'manage-users',
  'assign-user-roles',
  'activate-users',
  'view-settings',
  'view-profile',
  'manage-employees',
  'manage-trips',
  'view-approvals',
  'super-admin',
  'view-tenders',
  'manage-tenders',
  'create-tenders',
  'edit-tenders',
  'delete-tenders',
  'view-projects',
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

export type UserStatus = 'Active' | 'Pending Approval';

export type User = {
  uid: string;
  name: string;
  email: string;
  roleId: string;
  branchId: string;
  avatarUrl: string;
  signatureUrl?: string;
  assignedProjectIds?: string[];
  status: UserStatus;
};

export type Branch = {
  id: string;
  name: string;
  region: 'Kantor Pusat' | 'Regional Barat' | 'Regional Timur';
};

export const initialBranches: Branch[] = [
  { id: 'kantor-pusat', name: 'Kantor Pusat', region: 'Kantor Pusat' },
  { id: 'bandar-lampung', name: 'Cabang Bandar Lampung', region: 'Regional Barat' },
  { id: 'bandung', name: 'Cabang Bandung', region: 'Regional Barat' },
  { id: 'batam', name: 'Cabang Batam', region: 'Regional Barat' },
  { id: 'bekasi', name: 'Cabang Bekasi', region: 'Regional Barat' },
  { id: 'bengkulu', name: 'Cabang Bengkulu', region: 'Regional Barat' },
  { id: 'cilacap', name: 'Cabang Cilacap', region: 'Regional Barat' },
  { id: 'cilegon', name: 'Cabang Cilegon', region: 'Regional Barat' },
  { id: 'cirebon', name: 'Cabang Cirebon', region: 'Regional Barat' },
  { id: 'dumai', name: 'Cabang Dumai', region: 'Regional Barat' },
  { id: 'jakarta', name: 'Cabang Jakarta', region: 'Regional Barat' },
  { id: 'jambi', name: 'Cabang Jambi', region: 'Regional Barat' },
  { id: 'medan', name: 'Cabang Medan', region: 'Regional Barat' },
  { id: 'padang', name: 'Cabang Padang', region: 'Regional Barat' },
  { id: 'pekanbaru', name: 'Cabang Pekanbaru', region: 'Regional Barat' },
  { id: 'palembang', name: 'Cabang Palembang', region: 'Regional Barat' },
  { id: 'semarang', name: 'Cabang Semarang', region: 'Regional Barat' },
  { id: 'balikpapan', name: 'Cabang Balikpapan', region: 'Regional Timur' },
  { id: 'banjarmasin', name: 'Cabang Banjarmasin', region: 'Regional Timur' },
  { id: 'batu-licin', name: 'Cabang Batu Licin', region: 'Regional Timur' },
  { id: 'bontang', name: 'Cabang Bontang', region: 'Regional Timur' },
  { id: 'denpasar', name: 'Cabang Denpasar', region: 'Regional Timur' },
  { id: 'makassar', name: 'Cabang Makassar', region: 'Regional Timur' },
  { id: 'kendari', name: 'Cabang Kendari', region: 'Regional Timur' },
  { id: 'pontianak', name: 'Cabang Pontianak', region: 'Regional Timur' },
  { id: 'samarinda', name: 'Cabang Samarinda', region: 'Regional Timur' },
  { id: 'sangatta', name: 'Cabang Sangatta', region: 'Regional Timur' },
  { id: 'surabaya', name: 'Cabang Surabaya', region: 'Regional Timur' },
  { id: 'tarakan', name: 'Cabang Tarakan', region: 'Regional Timur' },
  { id: 'timika', name: 'Cabang Timika', region: 'Regional Timur' },
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
      'view-projects',
      'view-equipment',
      'manage-equipment',
      'view-inspector',
      'manage-inspectors',
      'manage-reports',
      'view-settings',
      'view-profile',
      'manage-employees',
      'manage-trips',
      'view-approvals',
      'view-tenders',
      'manage-tenders',
    ],
    isEditable: true,
  },
  {
    id: 'project-admin',
    name: 'Project Admin',
    permissions: [
      'view-dashboard',
      'manage-projects',
      'view-projects',
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
      'view-profile',
      'view-approvals',
    ],
    isEditable: true,
  },
  {
    id: 'client-rep',
    name: 'Client Representative',
    permissions: [
      'view-dashboard',
      'manage-reports',
      'view-profile',
      'view-approvals',
    ],
    isEditable: true,
  },
  {
    id: 'tender-admin',
    name: 'Tender Admin',
    permissions: [
      'view-dashboard',
      'view-tenders',
      'manage-tenders',
      'view-profile',
    ],
    isEditable: true,
  }
];

// This is no longer used for seeding, as users are created via the registration page.
export const initialUsers: User[] = [];

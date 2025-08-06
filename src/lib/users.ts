

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
  'manage-employees',
  'manage-trips',
  'view-approvals',
  'super-admin', // Special permission for super-admin only checks
  'view-tenders',
  'manage-tenders',
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
  password?: string; // Added password field
  roleId: string;
  branchId: string;
  avatarUrl: string;
  signatureUrl?: string;
  assignedProjectIds?: number[];
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

export const initialUsers: User[] = [
  { id: 1, name: 'Super Admin', email: 'superuser@example.com', password: 'password123', roleId: 'super-admin', branchId: 'kantor-pusat', avatarUrl: '', signatureUrl: '' },
  { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', password: 'password123', roleId: 'project-manager', branchId: 'surabaya', avatarUrl: '', signatureUrl: '' },
  { id: 3, name: 'Budi Santoso', email: 'budi.s@example.com', password: 'password123', roleId: 'inspector', branchId: 'jakarta', avatarUrl: '', signatureUrl: '' },
  { id: 4, name: 'Citra Dewi', email: 'citra.d@example.com', password: 'password123', roleId: 'inspector', branchId: 'surabaya', avatarUrl: '', signatureUrl: '' },
  { id: 5, name: 'QAQC Client', email: 'qaqc.client@example.com', password: 'password123', roleId: 'client-qaqc', branchId: 'kantor-pusat', avatarUrl: '', signatureUrl: '' },
  { id: 6, name: 'Rep Client', email: 'rep.client@example.com', password: 'password123', roleId: 'client-rep', branchId: 'kantor-pusat', avatarUrl: '', signatureUrl: '' },
  { id: 7, name: 'Project Admin User', email: 'pa@example.com', password: 'password123', roleId: 'project-admin', branchId: 'jakarta', avatarUrl: '', signatureUrl: '', assignedProjectIds: [1, 3] },
  { id: 8, name: 'Inspector User', email: 'inspector@example.com', password: 'password123', roleId: 'inspector', branchId: 'kantor-pusat', avatarUrl: '', signatureUrl: '' },
  { id: 9, name: 'Eko Wahyudi', email: 'eko.w@example.com', password: 'password123', roleId: 'inspector', branchId: 'pekanbaru', avatarUrl: '', signatureUrl: '' },
  { id: 10, name: 'Employee User', email: 'employee@example.com', password: 'password123', roleId: 'employee', branchId: 'jakarta', avatarUrl: '', signatureUrl: '' },
  { id: 11, name: 'Tender Admin', email: 'tender@example.com', password: 'password123', roleId: 'tender-admin', branchId: 'kantor-pusat', avatarUrl: '', signatureUrl: '' },
  { id: 12, name: 'John Doe', email: 'john.doe@example.com', password: 'password123', roleId: 'employee', branchId: 'jakarta', avatarUrl: '', signatureUrl: '' },
  { id: 13, name: 'Michael Johnson', email: 'michael.johnson@example.com', password: 'password123', roleId: 'employee', branchId: 'pekanbaru', avatarUrl: '', signatureUrl: '' },
  { id: 14, name: 'Emily Davis', email: 'emily.davis@example.com', password: 'password123', roleId: 'employee', branchId: 'jakarta', avatarUrl: '', signatureUrl: '' },
];

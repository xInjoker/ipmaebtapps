

export type InspectorDocument = {
  name: string;
  url: string;
  expirationDate?: string; // ISO 8601 format 'YYYY-MM-DD'
};

export type Inspector = {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  employmentStatus?: 'Organik' | 'Freelance';
  yearsOfExperience?: number;
  avatarUrl: string;
  cvUrl: string; // URL for a single CV file
  qualifications: InspectorDocument[];
  otherDocuments: InspectorDocument[];
  branchId: string;
};

export const inspectorPositions: string[] = ['Lead Inspector', 'Inspector', 'Trainee Inspector', 'Senior Inspector', 'QA/QC Coordinator'];
export const employmentStatuses: Exclude<Inspector['employmentStatus'], undefined>[] = ['Organik', 'Freelance'];


// This data is now only used for one-time database seeding.
export const initialInspectors: Omit<Inspector, 'id'>[] = [
  {
    name: 'Budi Santoso',
    email: 'budi.s@example.com',
    phone: '0812-3456-7890',
    position: 'Lead Inspector',
    employmentStatus: 'Organik',
    yearsOfExperience: 15,
    avatarUrl: '',
    cvUrl: 'Budi_Santoso_CV.pdf',
    qualifications: [
      { name: 'ASNT_Level_III.pdf', url: 'ASNT_Level_III.pdf', expirationDate: '2027-05-20' },
      { name: 'CSWIP_3.1.pdf', url: 'CSWIP_3.1.pdf', expirationDate: '2025-11-10' },
    ],
    otherDocuments: [
      { name: 'Safety_Training_Cert.pdf', url: 'Safety_Training_Cert.pdf', expirationDate: '2024-08-01' },
    ],
    branchId: 'jakarta',
  },
  {
    name: 'Citra Dewi',
    email: 'citra.d@example.com',
    phone: '0823-4567-8901',
    position: 'Inspector',
    employmentStatus: 'Freelance',
    yearsOfExperience: 8,
    avatarUrl: '',
    cvUrl: 'Citra_Dewi_CV.pdf',
    qualifications: [
      { name: 'ASNT_Level_II_UT.pdf', url: 'ASNT_Level_II_UT.pdf', expirationDate: '2026-02-15' },
      { name: 'ASNT_Level_II_MT.pdf', url: 'ASNT_Level_II_MT.pdf', expirationDate: '2026-02-15' },
    ],
    otherDocuments: [],
    branchId: 'surabaya',
  },
  {
    name: 'Eko Wahyudi',
    email: 'eko.w@example.com',
    phone: '0834-5678-9012',
    position: 'Trainee Inspector',
    employmentStatus: 'Organik',
    yearsOfExperience: 1,
    avatarUrl: '',
    cvUrl: 'Eko_Wahyudi_CV.pdf',
    qualifications: [],
    otherDocuments: [
      { name: 'First_Aid_Cert.pdf', url: 'First_Aid_Cert.pdf' }, // No expiration date
    ],
    branchId: 'pekanbaru',
  },
  {
    name: 'Inspector User',
    email: 'inspector@example.com',
    phone: '0811-1111-2222',
    position: 'Senior Inspector',
    employmentStatus: 'Organik',
    yearsOfExperience: 12,
    avatarUrl: '',
    cvUrl: 'Inspector_User_CV.pdf',
    qualifications: [
       { name: 'API_570.pdf', url: 'API_570.pdf', expirationDate: '2029-01-01' },
    ],
    otherDocuments: [],
    branchId: 'kantor-pusat',
  },
];


export type Inspector = {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: 'Lead Inspector' | 'Inspector' | 'Trainee Inspector';
  avatarUrl: string;
  cvUrl: string; // URL for a single CV file
  qualificationUrls: string[]; // URLs for multiple qualification certificates
  otherDocumentUrls: string[]; // URLs for other supporting documents
};

export const inspectorPositions: Inspector['position'][] = ['Lead Inspector', 'Inspector', 'Trainee Inspector'];

export const initialInspectors: Inspector[] = [
  {
    id: 'INSP-001',
    name: 'Budi Santoso',
    email: 'budi.s@example.com',
    phone: '0812-3456-7890',
    position: 'Lead Inspector',
    avatarUrl: '',
    cvUrl: 'Budi_Santoso_CV.pdf',
    qualificationUrls: ['ASNT_Level_III.pdf', 'CSWIP_3.1.pdf'],
    otherDocumentUrls: ['Safety_Training_Cert.pdf'],
  },
  {
    id: 'INSP-002',
    name: 'Citra Dewi',
    email: 'citra.d@example.com',
    phone: '0823-4567-8901',
    position: 'Inspector',
    avatarUrl: '',
    cvUrl: 'Citra_Dewi_CV.pdf',
    qualificationUrls: ['ASNT_Level_II_UT.pdf', 'ASNT_Level_II_MT.pdf'],
    otherDocumentUrls: [],
  },
  {
    id: 'INSP-003',
    name: 'Eko Wahyudi',
    email: 'eko.w@example.com',
    phone: '0834-5678-9012',
    position: 'Trainee Inspector',
    avatarUrl: '',
    cvUrl: 'Eko_Wahyudi_CV.pdf',
    qualificationUrls: [],
    otherDocumentUrls: ['First_Aid_Cert.pdf'],
  },
];

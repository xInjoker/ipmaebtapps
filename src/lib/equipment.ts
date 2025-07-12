

export type EquipmentStatus = 'Normal' | 'Broken' | 'In Maintenance';
export type EquipmentType = 'LRUT' | 'PEC' | 'MFL' | 'UT' | 'RT' | 'Drone' | 'Other';

export type EquipmentItem = {
  id: string;
  name: string;
  serialNumber: string;
  type: EquipmentType;
  owningBranchId: string;
  currentLocation: string;
  calibrationDueDate: string;
  status: EquipmentStatus;
  imageUrls: string[];
  documentUrls: string[];
  assignedPersonnelIds: string[];
  personnelCertificationUrls: string[];
};

export const equipmentTypes: EquipmentType[] = ['LRUT', 'PEC', 'MFL', 'UT', 'RT', 'Drone', 'Other'];
export const equipmentStatuses: EquipmentStatus[] = ['Normal', 'Broken', 'In Maintenance'];


export const initialEquipment: EquipmentItem[] = [
  { id: 'EQ-001', name: 'GUL Wavemaker G4', serialNumber: 'G4-2021-001', type: 'LRUT', owningBranchId: 'jakarta', currentLocation: 'On-site Project Alpha', calibrationDueDate: '2025-01-15', status: 'Normal', imageUrls: ['https://placehold.co/400x225.png'], documentUrls: ['calibration-cert-G4.pdf'], assignedPersonnelIds: ['INSP-001', 'INSP-002'], personnelCertificationUrls: ['john-doe-lurt-cert.pdf'] },
  { id: 'EQ-002', name: 'Lyft PEC System', serialNumber: 'LYFT-2022-012', type: 'PEC', owningBranchId: 'surabaya', currentLocation: 'Cabang Surabaya', calibrationDueDate: '2024-08-20', status: 'Normal', imageUrls: [], documentUrls: [], assignedPersonnelIds: [], personnelCertificationUrls: [] },
  { id: 'EQ-003', name: 'MFL 2000 Pipe Scanner', serialNumber: 'MFL-2020-005', type: 'MFL', owningBranchId: 'jakarta', currentLocation: 'Cabang Jakarta', calibrationDueDate: '2024-07-30', status: 'In Maintenance', imageUrls: [], documentUrls: [], assignedPersonnelIds: [], personnelCertificationUrls: [] },
  { id: 'EQ-004', name: 'Olympus EPOCH 650', serialNumber: 'OLY-E650-2023-088', type: 'UT', owningBranchId: 'pekanbaru', currentLocation: 'On-site Project Gamma', calibrationDueDate: '2024-09-01', status: 'Normal', imageUrls: [], documentUrls: [], assignedPersonnelIds: [], personnelCertificationUrls: [] },
  { id: 'EQ-005', name: 'AGFA D7 X-ray Film', serialNumber: 'AGFA-D7-2024-1050', type: 'RT', owningBranchId: 'balikpapan', currentLocation: 'Cabang Balikpapan', calibrationDueDate: '2025-03-22', status: 'Normal', imageUrls: [], documentUrls: [], assignedPersonnelIds: [], personnelCertificationUrls: [] },
  { id: 'EQ-006', name: 'DJI Matrice 300 RTK', serialNumber: 'DJI-M300-2023-031', type: 'Drone', owningBranchId: 'hq', currentLocation: 'On loan to Cabang Jakarta', calibrationDueDate: '2024-11-10', status: 'Normal', imageUrls: [], documentUrls: [], assignedPersonnelIds: [], personnelCertificationUrls: [] },
  { id: 'EQ-007', name: 'In-house UT probe', serialNumber: 'IHP-UT-2022-002', type: 'UT', owningBranchId: 'samarinda', currentLocation: 'Cabang Samarinda', calibrationDueDate: '2024-06-25', status: 'Broken', imageUrls: [], documentUrls: [], assignedPersonnelIds: [], personnelCertificationUrls: [] },
];

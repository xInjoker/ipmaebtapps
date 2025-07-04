
export type EquipmentStatus = 'Normal' | 'Broken' | 'In Maintenance';
export type EquipmentType = 'LRUT' | 'PEC' | 'MFL' | 'UT' | 'RT' | 'Drone' | 'Other';

export type EquipmentItem = {
  id: string;
  name: string;
  type: EquipmentType;
  owningBranchId: string;
  currentLocation: string;
  calibrationDueDate: Date;
  status: EquipmentStatus;
};

export const equipmentTypes: EquipmentType[] = ['LRUT', 'PEC', 'MFL', 'UT', 'RT', 'Drone', 'Other'];
export const equipmentStatuses: EquipmentStatus[] = ['Normal', 'Broken', 'In Maintenance'];


export const initialEquipment: EquipmentItem[] = [
  { id: 'EQ-001', name: 'GUL Wavemaker G4', type: 'LRUT', owningBranchId: 'jakarta', currentLocation: 'On-site Project Alpha', calibrationDueDate: new Date('2025-01-15'), status: 'Normal' },
  { id: 'EQ-002', name: 'Lyft PEC System', type: 'PEC', owningBranchId: 'surabaya', currentLocation: 'Cabang Surabaya', calibrationDueDate: new Date('2024-08-20'), status: 'Normal' },
  { id: 'EQ-003', name: 'MFL 2000 Pipe Scanner', type: 'MFL', owningBranchId: 'jakarta', currentLocation: 'Cabang Jakarta', calibrationDueDate: new Date('2024-07-30'), status: 'In Maintenance' },
  { id: 'EQ-004', name: 'Olympus EPOCH 650', type: 'UT', owningBranchId: 'pekanbaru', currentLocation: 'On-site Project Gamma', calibrationDueDate: new Date(), status: 'Normal' },
  { id: 'EQ-005', name: 'AGFA D7 X-ray Film', type: 'RT', owningBranchId: 'balikpapan', currentLocation: 'Cabang Balikpapan', calibrationDueDate: new Date('2025-03-22'), status: 'Normal' },
  { id: 'EQ-006', name: 'DJI Matrice 300 RTK', type: 'Drone', owningBranchId: 'hq', currentLocation: 'On loan to Cabang Jakarta', calibrationDueDate: new Date('2024-11-10'), status: 'Normal' },
  { id: 'EQ-007', name: 'In-house UT probe', type: 'UT', owningBranchId: 'samarinda', currentLocation: 'Cabang Samarinda', calibrationDueDate: new Date('2024-06-25'), status: 'Broken' },
];

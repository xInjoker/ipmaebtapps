

export type EquipmentStatus = 'Normal' | 'Broken' | 'In Maintenance';
export type EquipmentType = 'LRUT' | 'PEC' | 'MFL' | 'UT' | 'RT' | 'Drone' | 'Other';

export type EquipmentDocument = {
  name: string;
  url: string;
};

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
  documentUrls: EquipmentDocument[];
  assignedPersonnelIds: string[];
};

export const equipmentTypes: EquipmentType[] = ['LRUT', 'PEC', 'MFL', 'UT', 'RT', 'Drone', 'Other'];
export const equipmentStatuses: EquipmentStatus[] = ['Normal', 'Broken', 'In Maintenance'];


// This data is now only used for one-time database seeding.
export const initialEquipment: Omit<EquipmentItem, 'id'>[] = [];

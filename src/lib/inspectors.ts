

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
export const initialInspectors: Omit<Inspector, 'id'>[] = [];

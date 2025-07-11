
export type TenderStatus = 'Aanwijzing' | 'Bidding' | 'Evaluation' | 'Awarded' | 'Lost' | 'Cancelled';

export type Tender = {
  id: string;
  tenderNumber: string;
  title: string;
  client: string;
  status: TenderStatus;
  submissionDate: string; // 'YYYY-MM-DD'
  value: number;
  personInCharge: string;
};

export const tenderStatuses: TenderStatus[] = ['Aanwijzing', 'Bidding', 'Evaluation', 'Awarded', 'Lost', 'Cancelled'];

export const initialTenders: Tender[] = [
    { id: 'TND-001', tenderNumber: 'TND-2024-001', title: 'Pipeline Integrity Management', client: 'PT Elnusa Petrofin', status: 'Bidding', submissionDate: '2024-08-15', value: 15000000000, personInCharge: 'Budi Santoso' },
    { id: 'TND-002', tenderNumber: 'TND-2024-002', title: 'Offshore Platform Inspection', client: 'PT Pertamina Hulu Mahakam', status: 'Aanwijzing', submissionDate: '2024-09-01', value: 25000000000, personInCharge: 'Citra Dewi' },
    { id: 'TND-003', tenderNumber: 'TND-2024-003', title: 'Storage Tank Maintenance', client: 'PT Badak NGL', status: 'Evaluation', submissionDate: '2024-07-30', value: 8000000000, personInCharge: 'Budi Santoso' },
    { id: 'TND-004', tenderNumber: 'TND-2023-105', title: 'Drill Pipe Inspection Services', client: 'ExxonMobil Cepu Limited', status: 'Awarded', submissionDate: '2023-12-20', value: 12000000000, personInCharge: 'Eko Wahyudi' },
    { id: 'TND-005', tenderNumber: 'TND-2024-005', title: 'NDT for New Facility', client: 'PT Chevron Pacific Indonesia', status: 'Lost', submissionDate: '2024-06-10', value: 18000000000, personInCharge: 'Citra Dewi' },
];



export type TenderStatus = 'Aanwijzing' | 'Bidding' | 'Evaluation' | 'Awarded' | 'Lost' | 'Cancelled' | 'Prequalification';
export type Regional = 'West Region' | 'East Region' | 'Headquarter';
export type SubPortfolio = 'IAPPM' | 'EBT';

export type Tender = {
  id: string;
  tenderNumber: string;
  title: string;
  client: string;
  principal?: string;
  description?: string;
  services?: string;
  status: TenderStatus;
  submissionDate: string; // 'YYYY-MM-DD'
  value: number;
  personInCharge: string;
  branchId?: string;
  regional?: Regional;
  subPortfolio?: SubPortfolio;
};

export const tenderStatuses: TenderStatus[] = ['Aanwijzing', 'Bidding', 'Evaluation', 'Awarded', 'Lost', 'Cancelled', 'Prequalification'];
export const regionalOptions: Regional[] = ['West Region', 'East Region', 'Headquarter'];
export const subPortfolioOptions: SubPortfolio[] = ['IAPPM', 'EBT'];
export const serviceOptions: string[] = ['NDT Services', 'Professional Services', 'Certification Services'];

export const initialTenders: Tender[] = [
    { id: 'TND-001', tenderNumber: 'TND-2024-001', title: 'Pipeline Integrity Management', client: 'PT Elnusa Petrofin', principal: 'PT Elnusa Petrofin', description: 'Comprehensive pipeline integrity management services.', services: 'NDT Services', status: 'Bidding', submissionDate: '2024-08-15', value: 15000000000, personInCharge: 'Budi Santoso', branchId: 'jakarta', regional: 'West Region', subPortfolio: 'IAPPM' },
    { id: 'TND-002', tenderNumber: 'TND-2024-002', title: 'Offshore Platform Inspection', client: 'PT Pertamina Hulu Mahakam', principal: 'PT Pertamina Hulu Mahakam', description: 'Annual inspection of offshore platforms.', services: 'NDT Services', status: 'Aanwijzing', submissionDate: '2024-09-01', value: 25000000000, personInCharge: 'Citra Dewi', branchId: 'surabaya', regional: 'East Region', subPortfolio: 'EBT' },
    { id: 'TND-003', tenderNumber: 'TND-2024-003', title: 'Storage Tank Maintenance', client: 'PT Badak NGL', principal: 'PT Badak NGL', description: 'Maintenance and repair of storage tanks.', services: 'Professional Services', status: 'Evaluation', submissionDate: '2024-07-30', value: 8000000000, personInCharge: 'Budi Santoso', branchId: 'jakarta', regional: 'West Region', subPortfolio: 'IAPPM' },
    { id: 'TND-004', tenderNumber: 'TND-2023-105', title: 'Drill Pipe Inspection Services', client: 'ExxonMobil Cepu Limited', principal: 'ExxonMobil', description: 'Inspection services for drill pipes.', services: 'Certification Services', status: 'Awarded', submissionDate: '2023-12-20', value: 12000000000, personInCharge: 'Eko Wahyudi', branchId: 'pekanbaru', regional: 'West Region', subPortfolio: 'IAPPM' },
    { id: 'TND-005', tenderNumber: 'TND-2024-005', title: 'NDT for New Facility', client: 'PT Chevron Pacific Indonesia', principal: 'Chevron', description: 'Non-destructive testing for a new facility.', services: 'NDT Services', status: 'Lost', submissionDate: '2024-06-10', value: 18000000000, personInCharge: 'Citra Dewi', branchId: 'balikpapan', regional: 'East Region', subPortfolio: 'EBT' },
];



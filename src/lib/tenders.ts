

import { type Project, portfolios, subPortfolios, servicesBySubPortfolio, type Service } from '@/lib/projects';

export type TenderStatus = 'Aanwijzing' | 'Bidding' | 'Evaluation' | 'Awarded' | 'Lost' | 'Cancelled' | 'Prequalification';
export type Regional = 'Kantor Pusat' | 'Regional Barat' | 'Regional Timur';


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
  bidPrice: number;
  ownerEstimatePrice?: number;
  personInCharge: string;
  branchId?: string;
  regional?: Regional;
  subPortfolio?: (typeof subPortfolios)[number];
  portfolio?: (typeof portfolios)[number];
  serviceCode?: string;
  serviceName?: string;
};

export const tenderStatuses: TenderStatus[] = ['Aanwijzing', 'Bidding', 'Evaluation', 'Awarded', 'Lost', 'Cancelled', 'Prequalification'];
export const regionalOptions: Regional[] = ['Kantor Pusat', 'Regional Barat', 'Regional Timur'];
export const subPortfolioOptions: (typeof subPortfolios)[number][] = [...subPortfolios];
export const serviceOptions: string[] = ['NDT Services', 'Professional Services', 'Certification Services'];

export const tenderFieldLabels: Record<keyof Tender, string> = {
    id: 'Tender ID',
    tenderNumber: 'Tender Number',
    title: 'Tender Title',
    client: 'Client',
    principal: 'Principal',
    description: 'Description',
    services: 'Services (Legacy)',
    status: 'Status',
    submissionDate: 'Submission Date',
    bidPrice: 'Bid Price',
    ownerEstimatePrice: 'Owner Estimate Price',
    personInCharge: 'Person In Charge',
    branchId: 'Branch',
    regional: 'Regional',
    portfolio: 'Portfolio',
    subPortfolio: 'Sub-Portfolio',
    serviceCode: 'Service Code',
    serviceName: 'Service Name',
};

// This data is now only used for one-time database seeding.
export const initialTenders: Omit<Tender, 'id'>[] = [
    { tenderNumber: 'TND-2024-001', title: 'Pipeline Integrity Management', client: 'PT Elnusa Petrofin', principal: 'PT Elnusa Petrofin', description: 'Comprehensive pipeline integrity management services.', services: 'NDT Services', status: 'Bidding', submissionDate: '2024-08-15', bidPrice: 15000000000, ownerEstimatePrice: 16000000000, personInCharge: 'Budi Santoso', branchId: 'jakarta', regional: 'Regional Barat', subPortfolio: 'IAPPM', portfolio: 'AEBT', serviceCode: 'AEB-2A', serviceName: 'Inspeksi Peralatan dan Instalasi Industri Minyak dan Gas Bumi' },
    { tenderNumber: 'TND-2024-002', title: 'Offshore Platform Inspection', client: 'PT Pertamina Hulu Mahakam', principal: 'PT Pertamina Hulu Mahakam', description: 'Annual inspection of offshore platforms.', services: 'NDT Services', status: 'Aanwijzing', submissionDate: '2024-09-01', bidPrice: 25000000000, ownerEstimatePrice: 24000000000, personInCharge: 'Citra Dewi', branchId: 'surabaya', regional: 'Regional Timur', subPortfolio: 'EBT', portfolio: 'others', serviceCode: 'AEB-1B', serviceName: 'EBT Service B (Placeholder)' },
    { tenderNumber: 'TND-2024-003', title: 'Storage Tank Maintenance', client: 'PT Badak NGL', principal: 'PT Badak NGL', description: 'Maintenance and repair of storage tanks.', services: 'Professional Services', status: 'Evaluation', submissionDate: '2024-07-30', bidPrice: 8000000000, personInCharge: 'Budi Santoso', branchId: 'jakarta', regional: 'Regional Barat', subPortfolio: 'IAPPM', portfolio: 'AEBT', serviceCode: 'AEB-2C', serviceName: 'QA/QC untuk Fasilitas Industri, Minyak dan Gas, Pertambangan dan Pembangkit Listrik' },
    { tenderNumber: 'TND-2023-105', title: 'Drill Pipe Inspection Services', client: 'ExxonMobil Cepu Limited', principal: 'ExxonMobil', description: 'Inspection services for drill pipes.', services: 'Certification Services', status: 'Awarded', submissionDate: '2023-12-20', bidPrice: 12000000000, ownerEstimatePrice: 11500000000, personInCharge: 'Eko Wahyudi', branchId: 'pekanbaru', regional: 'Regional Barat', subPortfolio: 'IAPPM', portfolio: 'AEBT', serviceCode: 'AEB-2D', serviceName: 'Verifikasi dan Pemeriksaan Mesin Pada Saat Beroprasi' },
    { tenderNumber: 'TND-2024-005', title: 'NDT for New Facility', client: 'PT Chevron Pacific Indonesia', principal: 'Chevron', description: 'Non-destructive testing for a new facility.', services: 'NDT Services', status: 'Lost', submissionDate: '2024-06-10', bidPrice: 18000000000, ownerEstimatePrice: 20000000000, personInCharge: 'Citra Dewi', branchId: 'balikpapan', regional: 'Regional Timur', subPortfolio: 'EBT', portfolio: 'others', serviceCode: 'AEB-1A', serviceName: 'Analisa Energi Gas Metana Batu Bara Dan "Shale Gas"' },
];

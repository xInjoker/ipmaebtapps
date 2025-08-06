

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
  documentUrls?: string[];
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
    documentUrls: 'Documents',
};

// This data is now only used for one-time database seeding.
export const initialTenders: Omit<Tender, 'id'>[] = [];

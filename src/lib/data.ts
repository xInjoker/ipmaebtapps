
export type ServiceOrderItem = {
  id: number;
  soNumber: string;
  description: string;
  date: string;
  value: number;
  status: 'Open' | 'In Progress' | 'Closed';
};

export type InvoiceItem = {
  id: number;
  spkNumber: string;
  serviceCategory: string;
  description: string;
  status: 'Paid' | 'Invoiced' | 'Cancel' | 'Re-invoiced' | 'PAD' | 'Document Preparation';
  period: string;
  value: number;
};

export type ExpenditureItem = {
  id: string;
  category: string;
  coa: string;
  description: string;
  period: string;
  amount: number;
  status: 'Approved' | 'Pending' | 'Rejected';
};

export type Project = {
  id: number;
  contractNumber: string;
  rabNumber: string;
  name: string;
  client: string;
  description: string;
  value: number;
  cost: number;
  invoiced: number;
  period: string;
  duration: string;
  progress: number;
  serviceOrders: ServiceOrderItem[];
  invoices: InvoiceItem[];
  budgets: { [category: string]: number };
  expenditures: ExpenditureItem[];
  branchId: string;
  contractExecutor: string;
};

export const initialProjects: Project[] = [
  {
    id: 1,
    contractNumber: 'CN-001',
    rabNumber: 'RAB-24-001',
    name: 'Corporate Website Revamp',
    client: 'Acme Inc.',
    description:
      'A complete overhaul of the corporate website to improve user experience and modernize the design.',
    value: 2500000000,
    cost: 1800000000,
    invoiced: 2000000000,
    period: '2024-2025',
    duration: '12 Months',
    progress: 75,
    serviceOrders: [
      { id: 1, soNumber: 'SO-001-A', description: 'Initial design consultation and mockups', date: '2024-01-10', value: 500000000, status: 'Closed' },
      { id: 2, soNumber: 'SO-001-B', description: 'Development and deployment sprints', date: '2024-03-15', value: 1500000000, status: 'In Progress' },
    ],
    invoices: [
      {
        id: 1,
        spkNumber: 'SPK-001',
        serviceCategory: 'Design Phase',
        description: 'Initial design mockups and wireframes.',
        status: 'Paid',
        period: 'January 2024',
        value: 500000000,
      },
      {
        id: 2,
        spkNumber: 'SPK-002',
        serviceCategory: 'Development - Sprint 1',
        description: 'Development work for the first sprint.',
        status: 'Paid',
        period: 'April 2024',
        value: 750000000,
      },
      {
        id: 3,
        spkNumber: 'SPK-003',
        serviceCategory: 'Development - Sprint 2',
        description: 'Development work for the second sprint.',
        status: 'Invoiced',
        period: 'July 2024',
        value: 750000000,
      },
      {
        id: 4,
        spkNumber: 'SPK-004',
        serviceCategory: 'Final Deployment',
        description: 'Final deployment and server setup.',
        status: 'Invoiced',
        period: 'October 2024',
        value: 500000000,
      },
    ],
    budgets: {
      'PT dan PTT': 0,
      'PTT Project': 0,
      'Tenaga Ahli dan Labour Supply': 200000000,
      'Perjalanan Dinas': 75000000,
      'Operasional': 150000000,
      'Fasilitas dan Interen': 0,
      'Amortisasi': 0,
      'Kantor dan Diklat': 0,
      'Promosi': 100000000,
      'Umum': 0,
    },
    expenditures: [
      { id: 'EXP-PROJ1-001', category: 'Tenaga Ahli dan Labour Supply', coa: '4200', description: 'Monthly salary for consultant.', period: 'July 2024', amount: 15000000, status: 'Approved' },
      { id: 'EXP-PROJ1-002', category: 'Promosi', coa: '4800', description: 'Social media campaign.', period: 'July 2024', amount: 50000000, status: 'Approved' },
    ],
    branchId: 'jakarta',
    contractExecutor: 'Cabang Jakarta',
  },
  {
    id: 2,
    contractNumber: 'CN-002',
    rabNumber: 'RAB-24-002',
    name: 'Mobile App Development',
    client: 'Stark Industries',
    description:
      'Development of a new cross-platform mobile application for internal use.',
    value: 5000000000,
    cost: 3500000000,
    invoiced: 2500000000,
    period: '2024-2026',
    duration: '24 Months',
    progress: 40,
    serviceOrders: [
      { id: 1, soNumber: 'SO-002-A', description: 'Full-stack mobile app development cycle', date: '2024-02-01', value: 5000000000, status: 'Open' },
    ],
    invoices: [
      {
        id: 1,
        spkNumber: 'SPK-005',
        serviceCategory: 'Discovery & Planning',
        description: 'Discovery and project planning phase.',
        status: 'Paid',
        period: 'February 2024',
        value: 1000000000,
      },
      {
        id: 2,
        spkNumber: 'SPK-006',
        serviceCategory: 'UI/UX Design',
        description: 'UI/UX design for the mobile application.',
        status: 'Invoiced',
        period: 'May 2024',
        value: 1500000000,
      },
       {
        id: 3,
        spkNumber: 'SPK-007',
        serviceCategory: 'Backend Development',
        description: 'Backend development for core features.',
        status: 'Invoiced',
        period: 'August 2024',
        value: 1500000000,
      },
      {
        id: 4,
        spkNumber: 'SPK-008',
        serviceCategory: 'Frontend Development',
        description: 'Frontend development for the user interface.',
        status: 'Cancel',
        period: 'November 2024',
        value: 1000000000,
      },
    ],
    budgets: {
      'PT dan PTT': 0,
      'PTT Project': 0,
      'Tenaga Ahli dan Labour Supply': 500000000,
      'Perjalanan Dinas': 0,
      'Operasional': 250000000,
      'Fasilitas dan Interen': 100000000,
      'Amortisasi': 0,
      'Kantor dan Diklat': 0,
      'Promosi': 0,
      'Umum': 0,
    },
    expenditures: [
        { id: 'EXP-PROJ2-001', category: 'Operasional', coa: '4400', description: 'Server hosting fees.', period: 'July 2024', amount: 35000000, status: 'Approved' },
        { id: 'EXP-PROJ2-002', category: 'Fasilitas dan Interen', coa: '4500', description: 'Office supplies.', period: 'July 2024', amount: 25000000, status: 'Rejected' },
    ],
    branchId: 'surabaya',
    contractExecutor: 'Cabang Surabaya',
  },
  {
    id: 3,
    contractNumber: 'CN-003',
    rabNumber: 'RAB-23-015',
    name: 'Data Analytics Platform',
    client: 'Wayne Enterprises',
    description:
      'Building a scalable data platform to provide business intelligence insights.',
    value: 3200000000,
    cost: 2800000000,
    invoiced: 3000000000,
    period: '2023-2024',
    duration: '18 Months',
    progress: 90,
    serviceOrders: [
      { id: 1, soNumber: 'SO-003-A', description: 'Cloud infrastructure setup and data pipeline implementation', date: '2023-11-20', value: 2500000000, status: 'Closed' },
      { id: 2, soNumber: 'SO-003-B', description: 'Dashboard development and user training', date: '2024-05-10', value: 700000000, status: 'In Progress' },
    ],
    invoices: [
      {
        id: 1,
        spkNumber: 'SPK-009',
        serviceCategory: 'Infrastructure Setup',
        description: 'Setup of cloud infrastructure.',
        status: 'Paid',
        period: 'December 2023',
        value: 1000000000,
      },
      {
        id: 2,
        spkNumber: 'SPK-010',
        serviceCategory: 'Data Pipeline',
        description: 'Implementation of data ingestion pipelines.',
        status: 'Paid',
        period: 'March 2024',
        value: 1500000000,
      },
      {
        id: 3,
        spkNumber: 'SPK-011',
        serviceCategory: 'Dashboard Development',
        description: 'Development of user-facing dashboards.',
        status: 'Re-invoiced',
        period: 'June 2024',
        value: 500000000,
      },
      {
        id: 4,
        spkNumber: 'SPK-012',
        serviceCategory: 'User Training',
        description: 'Training sessions for end-users.',
        status: 'Cancel',
        period: 'June 2024',
        value: 200000000,
      },
    ],
    budgets: {
       'PT dan PTT': 0,
       'PTT Project': 0,
       'Tenaga Ahli dan Labour Supply': 0,
       'Perjalanan Dinas': 50000000,
       'Operasional': 0,
       'Fasilitas dan Interen': 0,
       'Amortisasi': 0,
       'Kantor dan Diklat': 0,
       'Promosi': 0,
       'Umum': 0,
    },
    expenditures: [
      { id: 'EXP-PROJ3-001', category: 'Perjalanan Dinas', coa: '4300', description: 'Flight tickets for meeting.', period: 'July 2024', amount: 7500000, status: 'Pending' },
    ],
    branchId: 'jakarta',
    contractExecutor: 'Cabang Jakarta',
  },
];

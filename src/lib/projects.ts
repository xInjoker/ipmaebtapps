

export type ServiceOrderItem = {
  id: string;
  soNumber: string;
  description: string;
  date: string;
  value: number;
};

export type InvoiceItem = {
  id: string;
  soNumber: string;
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

export const portfolios = ['AEBT', 'others'] as const;
export const subPortfolios = ['IAPPM', 'EBT'] as const;

export type Service = {
  code: string;
  name: string;
};

export const servicesBySubPortfolio: Record<(typeof subPortfolios)[number], Service[]> = {
  'IAPPM': [
    { code: 'AEB-2A', name: 'Inspeksi Peralatan dan Instalasi Industri Minyak dan Gas Bumi' },
    { code: 'AEB-2B', name: 'Konsultasi Terhadap Kehandalan dan Keamanan Peralatan dan Instalasi Industri Minyak dan Gas Bumi' },
    { code: 'AEB-2C', name: 'QA/QC untuk Fasilitas Industri, Minyak dan Gas, Pertambangan dan Pembangkit Listrik' },
    { code: 'AEB-2D', name: 'Verifikasi dan Pemeriksaan Mesin Pada Saat Beroprasi' },
    { code: 'AEB-2E', name: 'Verifikasi dan Inspeksi Peralatan dan Instalasi Industri Minyak dan Gas Bumi serta Peralatan Pendukung Lainnya' },
    { code: 'AEB-2F', name: 'Non Destructive Test (Conventional and Advanced)' },
  ],
  'EBT': [
    { code: 'AEB-1A', name: 'Analisa Energi Gas Metana Batu Bara Dan "Shale Gas"' },
    { code: 'AEB-1B', name: 'EBT Service B (Placeholder)' },
    { code: 'AEB-1C', name: 'EBT Service C (Placeholder)' },
  ],
};

export type ApprovalStage = {
  stage: number;
  roleName: string;
  approverId: string | null;
};

export type Project = {
  id: string; 
  contractNumber: string;
  rabNumber: string;
  name: string;
  client: string;
  description: string;
  value: number;
  period: string;
  duration: string;
  serviceOrders: ServiceOrderItem[];
  invoices: InvoiceItem[];
  budgets: { [category: string]: number };
  costs: ExpenditureItem[];
  branchId: string;
  contractExecutor: string;
  portfolio?: (typeof portfolios)[number];
  subPortfolio?: (typeof subPortfolios)[number];
  serviceCode?: string;
  serviceName?: string;
  tripApprovalWorkflow: ApprovalStage[];
  reportApprovalWorkflow: ApprovalStage[];
};


export const initialProjects: Project[] = [
  {
    id: '1',
    contractNumber: 'PHR-001/2024',
    rabNumber: 'RAB-24-001',
    name: 'Pipeline Integrity Assessment',
    client: 'PT Pertamina Hulu Rokan',
    description: 'Comprehensive integrity assessment for the Duri-Dumai pipeline, including NDT and risk analysis.',
    value: 2500000000,
    period: '2024-2025',
    duration: '12 Months',
    serviceOrders: [
      { id: 'SO-1', soNumber: 'SO-PHR-001-A', description: 'Initial Survey and Data Collection', date: '2024-01-10', value: 500000000 },
      { id: 'SO-2', soNumber: 'SO-PHR-001-B', description: 'NDT Inspection Services (UT, MT, PT)', date: '2024-03-15', value: 1500000000 },
      { id: 'SO-3', soNumber: 'SO-PHR-001-C', description: 'Final Report and Recommendations', date: '2024-10-01', value: 500000000 },
    ],
    invoices: [
      {
        id: 'INV-1',
        soNumber: 'SO-PHR-001-A',
        serviceCategory: 'Survey',
        description: 'Initial site survey and data collection.',
        status: 'Paid',
        period: 'January 2024',
        value: 500000000,
      },
      {
        id: 'INV-2',
        soNumber: 'SO-PHR-001-B',
        serviceCategory: 'NDT Services',
        description: 'First phase of NDT inspection.',
        status: 'Paid',
        period: 'April 2024',
        value: 750000000,
      },
      {
        id: 'INV-3',
        soNumber: 'SO-PHR-001-B',
        serviceCategory: 'NDT Services',
        description: 'Second phase of NDT inspection.',
        status: 'Invoiced',
        period: 'July 2024',
        value: 750000000,
      },
      {
        id: 'INV-4',
        soNumber: 'SO-PHR-001-C',
        serviceCategory: 'Reporting',
        description: 'Final analysis and report submission.',
        status: 'Document Preparation',
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
    costs: [
      { id: 'EXP-PROJ1-001', category: 'Tenaga Ahli dan Labour Supply', coa: '4200', description: 'Monthly salary for lead inspector.', period: 'July 2024', amount: 25000000, status: 'Approved' },
      { id: 'EXP-PROJ1-002', category: 'Perjalanan Dinas', coa: '4300', description: 'Mobilization to Dumai site.', period: 'July 2024', amount: 45000000, status: 'Approved' },
    ],
    branchId: 'jakarta',
    contractExecutor: 'Cabang Jakarta',
    portfolio: 'AEBT',
    subPortfolio: 'IAPPM',
    serviceCode: 'AEB-2A',
    serviceName: 'Inspeksi Peralatan dan Instalasi Industri Minyak dan Gas Bumi',
    tripApprovalWorkflow: [
      { stage: 1, roleName: 'Verified by', approverId: '2' },
      { stage: 2, roleName: 'Approved by', approverId: '1' }
    ],
    reportApprovalWorkflow: [
      { stage: 1, roleName: 'Reviewed by Client QA/QC', approverId: '5' },
      { stage: 2, roleName: 'Approved by Client Rep', approverId: '6' }
    ]
  },
  {
    id: '2',
    contractNumber: 'MEP-005/2024',
    rabNumber: 'RAB-24-002',
    name: 'Offshore Platform Structural Inspection',
    client: 'PT Medco E&P Natuna',
    description: 'Annual structural integrity inspection for the Belida offshore platform.',
    value: 5000000000,
    period: '2024-2026',
    duration: '24 Months',
    serviceOrders: [
      { id: 'SO-4', soNumber: 'SO-MEP-002-A', description: 'Project Kick-off & Mobilization', date: '2024-02-01', value: 1000000000 },
      { id: 'SO-5', soNumber: 'SO-MEP-002-B', description: 'Rope Access Inspection & NDT', date: '2024-04-15', value: 3000000000 },
      { id: 'SO-6', soNumber: 'SO-MEP-002-C', description: 'Demobilization and Final Reporting', date: '2024-10-01', value: 1000000000 },
    ],
    invoices: [
      {
        id: 'INV-5',
        soNumber: 'SO-MEP-002-A',
        serviceCategory: 'Mobilization',
        description: 'Personnel and equipment mobilization.',
        status: 'Paid',
        period: 'February 2024',
        value: 1000000000,
      },
      {
        id: 'INV-6',
        soNumber: 'SO-MEP-002-B',
        serviceCategory: 'Inspection Services',
        description: 'Rope access inspection services.',
        status: 'Invoiced',
        period: 'May 2024',
        value: 1500000000,
      },
       {
        id: 'INV-7',
        soNumber: 'SO-MEP-002-B',
        serviceCategory: 'NDT Services',
        description: 'Advanced NDT for critical joints.',
        status: 'PAD',
        period: 'August 2024',
        value: 1500000000,
      },
      {
        id: 'INV-8',
        soNumber: 'SO-MEP-002-C',
        serviceCategory: 'Reporting',
        description: 'Submission of final report.',
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
    costs: [
        { id: 'EXP-PROJ2-001', category: 'Operasional', coa: '4400', description: 'Vessel charter fees.', period: 'July 2024', amount: 150000000, status: 'Approved' },
        { id: 'EXP-PROJ2-002', category: 'Tenaga Ahli dan Labour Supply', coa: '4200', description: 'Rope access technician salaries.', period: 'July 2024', amount: 80000000, status: 'Approved' },
    ],
    branchId: 'surabaya',
    contractExecutor: 'Cabang Surabaya',
    portfolio: 'others',
    subPortfolio: 'EBT',
    serviceCode: 'AEB-1A',
    serviceName: 'Analisa Energi Gas Metana Batu Bara Dan "Shale Gas"',
    tripApprovalWorkflow: [],
    reportApprovalWorkflow: []
  },
  {
    id: '3',
    contractNumber: 'CPI-015/2023',
    rabNumber: 'RAB-23-015',
    name: 'Storage Tank Inspection',
    client: 'PT Chevron Pacific Indonesia',
    description: 'API 653 compliant inspection of crude oil storage tanks.',
    value: 3200000000,
    period: '2023-2024',
    duration: '18 Months',
    serviceOrders: [
      { id: 'SO-7', soNumber: 'SO-CPI-003-A', description: 'Tank Floor MFL Scanning', date: '2023-11-20', value: 2500000000 },
      { id: 'SO-8', soNumber: 'SO-CPI-003-B', description: 'Shell and Roof Inspection', date: '2024-05-10', value: 700000000 },
    ],
    invoices: [
      {
        id: 'INV-9',
        soNumber: 'SO-CPI-003-A',
        serviceCategory: 'MFL Services',
        description: 'MFL scanning of tank floor.',
        status: 'Paid',
        period: 'December 2023',
        value: 1000000000,
      },
      {
        id: 'INV-10',
        soNumber: 'SO-CPI-003-A',
        serviceCategory: 'MFL Services',
        description: 'Data analysis and reporting for MFL.',
        status: 'Paid',
        period: 'March 2024',
        value: 1500000000,
      },
      {
        id: 'INV-11',
        soNumber: 'SO-CPI-003-B',
        serviceCategory: 'UT & Drone Inspection',
        description: 'UT thickness gauging on shell plates.',
        status: 'Re-invoiced',
        period: 'June 2024',
        value: 500000000,
      },
      {
        id: 'INV-12',
        soNumber: 'SO-CPI-003-B',
        serviceCategory: 'Reporting',
        description: 'Final API 653 report.',
        status: 'Document Preparation',
        period: 'July 2024',
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
    costs: [
      { id: 'EXP-PROJ3-001', category: 'Perjalanan Dinas', coa: '4300', description: 'Flight tickets for team mobilization.', period: 'July 2024', amount: 25000000, status: 'Approved' },
    ],
    branchId: 'pekanbaru',
    contractExecutor: 'Cabang Pekanbaru',
    portfolio: 'AEBT',
    subPortfolio: 'IAPPM',
    serviceCode: 'AEB-2F',
    serviceName: 'Non Destructive Test (Conventional and Advanced)',
    tripApprovalWorkflow: [],
    reportApprovalWorkflow: []
  },
];

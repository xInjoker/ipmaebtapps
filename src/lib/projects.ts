
export type Service = {
  code: string;
  name: string;
};

export const portfolios = ['AEBT', 'others'] as const;
export const subPortfolios = ['IAPPM', 'EBT'] as const;

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
}


export type ProjectDocument = {
  name: string;
  url: string;
};

export type ApprovalStage = {
  stage: number;
  roleName: string;
  approverId: string;
};

export type ServiceOrderItem = {
    id: string;
    soNumber: string;
    description: string;
    date: string; // YYYY-MM-DD
    value: number;
};

export type InvoiceItem = {
    id: string;
    soNumber: string;
    serviceCategory: string;
    description: string;
    status: 'Document Preparation' | 'PAD' | 'Invoiced' | 'Paid' | 'Re-invoiced' | 'Cancel';
    period: string; // "Month Year" e.g., "January 2024"
    value: number;
    originalValue?: number; // For PAD adjustments
    adjustmentReason?: string;
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
  id: string;
  name: string;
  description: string;
  client: string;
  contractExecutor: string; // Branch ID
  contractNumber: string;
  rabNumber: string;
  period: string;
  duration: string;
  contractStartDate: string; // 'YYYY-MM-DD'
  contractEndDate: string; // 'YYYY-MM-DD'
  value: number;
  branchId?: string; // Branch ID
  serviceOrders: ServiceOrderItem[];
  invoices: InvoiceItem[];
  budgets: Record<string, number>;
  costs: ExpenditureItem[];
  portfolio?: (typeof portfolios)[number];
  subPortfolio?: (typeof subPortfolios)[number];
  serviceCode?: string;
  serviceName?: string;
  tripApprovalWorkflow: ApprovalStage[];
  reportApprovalWorkflow: ApprovalStage[];
  projectManagerId?: string | null;
  contractUrl?: string;
  rabUrl?: string;
  otherDocumentUrls?: ProjectDocument[];
};

// This data is now only used for one-time database seeding.
export const initialProjects: Omit<Project, 'id'>[] = [];

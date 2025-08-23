

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
  originalValue?: number;
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

export type ProjectDocument = {
    name: string;
    url: string;
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
  contractStartDate?: string; // 'YYYY-MM-DD'
  contractEndDate?: string; // 'YYYY-MM-DD'
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
  contractUrl?: string;
  rabUrl?: string;
  otherDocumentUrls?: ProjectDocument[];
};


export const initialProjects: Project[] = [];

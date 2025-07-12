

export const genders = ['Male', 'Female'] as const;
export const employmentStatuses = ['Active', 'Inactive', 'On Leave'] as const;
export const contractTypes = ['Monthly', 'Daily', 'Hourly'] as const;
export const portfolios = ['AEBT', 'others'] as const;
export const subPortfolios = ['IAPPM', 'EBT'] as const;

export type Employee = {
    id: string;
    nationalId?: string;
    name?: string;
    placeOfBirth?: string;
    dateOfBirth?: string; // 'YYYY-MM-DD'
    gender?: (typeof genders)[number];
    religion?: string;
    address?: string;
    email?: string;
    phoneNumber?: string;
    npwp?: string;
    ptkpStatus?: string;
    employmentStatus?: (typeof employmentStatuses)[number];
    contractType?: (typeof contractTypes)[number];
    contractNumber?: string;
    contractStartDate?: string; // 'YYYY-MM-DD'
    contractEndDate?: string; // 'YYYY-MM-DD'
    position?: string;
    salary?: number;
    workUnit?: string;
    workUnitName?: string;
    portfolio?: (typeof portfolios)[number];
    subPortfolio?: (typeof subPortfolios)[number];
    projectName?: string;
    rabNumber?: string;
    bankName?: string;
    bankAccountNumber?: string;
    bpjsHealth?: string;
    bpjsEmployment?: string;
    competency?: string;
};

export const initialEmployees: Employee[] = [
    {
        id: 'EMP-001',
        name: 'John Doe',
        position: 'Senior Engineer',
        projectName: 'Corporate Website Revamp',
        workUnit: 'jakarta',
        workUnitName: 'Cabang Jakarta',
        salary: 15000000,
        contractEndDate: '2025-12-31',
        employmentStatus: 'Active',
    },
    {
        id: 'EMP-002',
        name: 'Jane Smith',
        position: 'Project Manager',
        projectName: 'Mobile App Development',
        workUnit: 'surabaya',
        workUnitName: 'Cabang Surabaya',
        salary: 25000000,
        contractEndDate: '2024-08-31',
        employmentStatus: 'On Leave',
    },
    {
        id: 'EMP-003',
        name: 'Michael Johnson',
        position: 'Junior Developer',
        projectName: 'Data Analytics Platform',
        workUnit: 'jakarta',
        workUnitName: 'Cabang Jakarta',
        salary: 8000000,
        contractEndDate: '2024-10-31',
        employmentStatus: 'Inactive',
    },
    {
        id: 'EMP-004',
        name: 'Emily Davis',
        position: 'UI/UX Designer',
        projectName: 'Corporate Website Revamp',
        workUnit: 'jakarta',
        workUnitName: 'Cabang Jakarta',
        salary: 12000000,
        contractEndDate: '2026-06-30',
        employmentStatus: 'Active',
    },
    {
        id: 'EMP-005',
        name: 'Employee User',
        position: 'Field Technician',
        projectName: 'Corporate Website Revamp',
        workUnit: 'jakarta',
        workUnitName: 'Cabang Jakarta',
        salary: 9500000,
        contractEndDate: '2025-07-31',
        employmentStatus: 'Active',
    },
];

export const employeeFieldLabels: Record<keyof Employee | 'id', string> = {
    id: 'Employee ID',
    nationalId: 'National ID',
    name: 'Name',
    placeOfBirth: 'Place of Birth',
    dateOfBirth: 'Date of Birth',
    gender: 'Gender',
    religion: 'Religion',
    address: 'Address',
    email: 'Email',
    phoneNumber: 'Phone Number',
    npwp: 'NPWP',
    ptkpStatus: 'PTKP Status',
    employmentStatus: 'Employment Status',
    contractType: 'Contract Type',
    contractNumber: 'Contract Number',
    contractStartDate: 'Contract Start Date',
    contractEndDate: 'Contract End Date',
    position: 'Position',
    salary: 'Salary',
    workUnit: 'Branch ID',
    workUnitName: 'Branch Name',
    portfolio: 'Portfolio',
    subPortfolio: 'Sub-Portfolio',
    projectName: 'Project Name',
    rabNumber: 'RAB Number',
    bankName: 'Bank Name',
    bankAccountNumber: 'Bank Account Number',
    bpjsHealth: 'BPJS Health',
    bpjsEmployment: 'BPJS Employment',
    competency: 'Competency',
};

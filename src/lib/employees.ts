

import { type InspectorDocument } from './inspectors';

export const genders = ['Male', 'Female'] as const;
export const employmentStatuses = ['Active', 'Inactive', 'On Leave'] as const;
export const contractTypes = ['Monthly', 'Daily', 'Hourly'] as const;
export const portfolios = ['AEBT', 'others'] as const;
export const subPortfolios = ['IAPPM', 'EBT'] as const;
export const religions = ['Islam', 'Christianity', 'Catholicism', 'Hinduism', 'Buddhism', 'Confucianism', 'Other'] as const;

export type Employee = {
    id: string;
    reportingManagerId?: string; 
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
    cvUrl?: string;
    qualifications?: InspectorDocument[];
    otherDocuments?: InspectorDocument[];
    isPromotedToInspector?: boolean;
};

export const employeeFieldLabels: Record<keyof Employee | 'id', string> = {
    id: 'Employee ID',
    reportingManagerId: 'Reporting Manager',
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
    cvUrl: 'CV',
    qualifications: 'Qualification Certificates',
    otherDocuments: 'Other Documents',
    isPromotedToInspector: 'Promoted to Inspector',
};

// This data is now only used for one-time database seeding.
export const initialEmployees: Omit<Employee, 'id'>[] = [];



import type { ApprovalStage } from './data';

export type TripStatus = 'Draft' | 'Pending' | 'Approved' | 'Rejected' | 'Booked' | 'Completed' | 'Closed';

type AllowanceDetail = {
    enabled: boolean;
    qty: number;
};

export type Allowance = {
    meals: {
        breakfast: AllowanceDetail;
        lunch: AllowanceDetail;
        dinner: AllowanceDetail;
    };
    daily: AllowanceDetail;
    transport: {
        localTransport: AllowanceDetail;
        jabodetabekAirport: AllowanceDetail;
        jabodetabekStation: AllowanceDetail;
        otherAirportStation: AllowanceDetail;
        mileage: AllowanceDetail; // qty will be km
    };
};

export type TripApprovalAction = {
    actorId: number;
    actorName: string;
    status: TripStatus;
    comments?: string;
    timestamp: string; // ISO Date String
}

export type TripRequest = {
    id: string;
    employeeId: number;
    employeeName: string;
    destination: string;
    destinationCompany?: string;
    purpose: string;
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
    estimatedBudget: number;
    status: TripStatus;
    approvalHistory: TripApprovalAction[];
    project?: string;
    position?: string;
    division?: string;
    allowance?: Allowance;
    // This will be superseded by the workflow on the project
    approvers?: {
        managerId: string;
        financeId: string;
    }
};

// This data is now only used for one-time database seeding.
export const initialTrips: Omit<TripRequest, 'id'>[] = [
    {
        employeeId: 2,
        employeeName: 'Project Manager',
        position: 'Project Manager',
        division: 'Cabang Jakarta',
        project: 'Corporate Website Revamp',
        destination: 'Surabaya',
        destinationCompany: 'PHR',
        purpose: 'Client Meeting with Stark Industries',
        startDate: '2024-08-05',
        endDate: '2024-08-07',
        estimatedBudget: 5000000,
        status: 'Approved',
        approvalHistory: [
            { actorId: 2, actorName: 'Project Manager', status: 'Pending', timestamp: new Date().toISOString() },
            { actorId: 1, actorName: 'Super Admin', status: 'Approved', comments: 'Approved. Please proceed with booking.', timestamp: new Date().toISOString() }
        ]
    },
    {
        employeeId: 3,
        employeeName: 'Jane Doe',
        position: 'Project Manager',
        division: 'Cabang Jakarta',
        project: 'Data Analytics Platform',
        destination: 'Balikpapan',
        destinationCompany: 'Pertamina EP',
        purpose: 'Site Inspection at Project Gamma',
        startDate: '2024-08-12',
        endDate: '2024-08-15',
        estimatedBudget: 7500000,
        status: 'Pending',
        approvalHistory: [
            { actorId: 3, actorName: 'Jane Doe', status: 'Pending', timestamp: new Date().toISOString() }
        ]
    },
    {
        employeeId: 4,
        employeeName: 'John Smith',
        position: 'Project Manager',
        division: 'Cabang Surabaya',
        project: 'Mobile App Development',
        destination: 'Pekanbaru',
        destinationCompany: 'PHM',
        purpose: 'Equipment Calibration and Maintenance',
        startDate: '2024-07-29',
        endDate: '2024-08-02',
        estimatedBudget: 6000000,
        status: 'Rejected',
        approvalHistory: [
            { actorId: 4, actorName: 'John Smith', status: 'Pending', timestamp: new Date().toISOString() },
            { actorId: 1, actorName: 'Super Admin', status: 'Rejected', comments: 'Budget too high. Please revise.', timestamp: new Date().toISOString() }
        ]
    }
];

export const tripStatuses: TripStatus[] = ['Draft', 'Pending', 'Approved', 'Rejected', 'Booked', 'Completed', 'Closed'];

export const destinationCompanies = [
    { value: 'Pertamina EP', label: 'Pertamina EP' },
    { value: 'PHR', label: 'PHR' },
    { value: 'PHM', label: 'PHM' },
    { value: 'PHSS', label: 'PHSS' },
    { value: 'PHKT', label: 'PHKT' },
];

export const allowanceRates = {
    breakfast: 75000,
    lunch: 100000,
    dinner: 100000,
    daily: 150000,
    localTransport: 100000,
    jabodetabekAirport: 350000,
    jabodetabekStation: 250000,
    otherAirportStation: 150000,
    mileage: 3500,
};

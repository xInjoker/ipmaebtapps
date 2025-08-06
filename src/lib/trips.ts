

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
export const initialTrips: Omit<TripRequest, 'id'>[] = [];

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

export type ReportStatus = 'Draft' | 'Submitted' | 'Approved' | 'Rejected';

export type ReportItem = {
    id: string;
    reportNumber: string;
    jobLocation: string;
    lineType: string;
    jobType: 'Penetrant Test' | 'Magnetic Particle Test' | 'Ultrasonic Test' | 'Radiographic Test' | 'Other';
    qtyJoint: number;
    status: ReportStatus;
};

export const reportStatuses: ReportStatus[] = ['Draft', 'Submitted', 'Approved', 'Rejected'];

export const initialReports: ReportItem[] = [
    { id: 'REP-001', reportNumber: 'PT-2024-001', jobLocation: 'Project Alpha Site', lineType: 'Pipeline', jobType: 'Penetrant Test', qtyJoint: 15, status: 'Approved' },
    { id: 'REP-002', reportNumber: 'MT-2024-001', jobLocation: 'Project Gamma Workshop', lineType: 'Structural Weld', jobType: 'Magnetic Particle Test', qtyJoint: 8, status: 'Submitted' },
    { id: 'REP-003', reportNumber: 'UT-2024-001', jobLocation: 'Project Alpha Site', lineType: 'Pressure Vessel', jobType: 'Ultrasonic Test', qtyJoint: 22, status: 'Draft' },
    { id: 'REP-004', reportNumber: 'RT-2024-001', jobLocation: 'Project Beta Facility', lineType: 'Pipeline', jobType: 'Radiographic Test', qtyJoint: 30, status: 'Rejected' },
    { id: 'REP-005', reportNumber: 'PT-2024-002', jobLocation: 'Project Gamma Workshop', lineType: 'Structural Weld', jobType: 'Penetrant Test', qtyJoint: 12, status: 'Submitted' },
];

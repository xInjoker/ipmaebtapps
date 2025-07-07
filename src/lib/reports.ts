export type ReportStatus = 'Draft' | 'Submitted' | 'Approved' | 'Rejected';

export type PenetrantTestResult = {
    jointNo: string;
    weldId: string;
    diameter: string;
    thickness: string;
    indication: string;
    result: 'Accept' | 'Reject';
    imageUrls: string[];
};

export type PenetrantTestReportDetails = {
    client: string;
    mainContractor: string;
    project: string;
    dateOfTest?: string; // Storing as ISO string
    procedureNo: string;
    acceptanceCriteria: string;
    visualInspection: string;
    surfaceCondition: string;
    material: string;
    weldingProcess: string;
    drawingNumber: string;
    testExtent: string;
    testTemperature: string;
    penetrantType: string;
    penetrantBrand: string;
    penetrantBatch: string;
    removerType: string;
    removerBrand: string;
    removerBatch: string;
    developerType: string;
    developerBrand: string;
    developerBatch: string;
    testEquipment: string;
    testResults: PenetrantTestResult[];
};

export type ReportItem = {
    id: string;
    reportNumber: string;
    jobLocation: string;
    lineType: string;
    jobType: 'Penetrant Test' | 'Magnetic Particle Test' | 'Ultrasonic Test' | 'Radiographic Test' | 'Other';
    qtyJoint: number;
    status: ReportStatus;
    details: PenetrantTestReportDetails | null;
};

export const reportStatuses: ReportStatus[] = ['Draft', 'Submitted', 'Approved', 'Rejected'];

export const initialReports: ReportItem[] = [
    { id: 'REP-001', reportNumber: 'PT-2024-001', jobLocation: 'Project Alpha Site', lineType: 'Pipeline', jobType: 'Penetrant Test', qtyJoint: 15, status: 'Approved', details: null },
    { id: 'REP-002', reportNumber: 'MT-2024-001', jobLocation: 'Project Gamma Workshop', lineType: 'Structural Weld', jobType: 'Magnetic Particle Test', qtyJoint: 8, status: 'Submitted', details: null },
    { id: 'REP-003', reportNumber: 'UT-2024-001', jobLocation: 'Project Alpha Site', lineType: 'Pressure Vessel', jobType: 'Ultrasonic Test', qtyJoint: 22, status: 'Draft', details: null },
    { id: 'REP-004', reportNumber: 'RT-2024-001', jobLocation: 'Project Beta Facility', lineType: 'Pipeline', jobType: 'Radiographic Test', qtyJoint: 30, status: 'Rejected', details: null },
    { id: 'REP-005', reportNumber: 'PT-2024-002', jobLocation: 'Project Gamma Workshop', lineType: 'Structural Weld', jobType: 'Penetrant Test', qtyJoint: 12, status: 'Submitted', details: null },
];

export type ReportStatus = 'Draft' | 'Submitted' | 'Approved' | 'Rejected';

export type PenetrantTestResult = {
    jointNo: string;
    weldId: string;
    diameter: string;
    thickness: string;
    linearIndication: string;
    roundIndication: string;
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
    examinationStage: string;
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

const mockPenetrantDetails: PenetrantTestReportDetails = {
    client: 'Acme Inc.',
    mainContractor: 'Cabang Jakarta',
    project: 'Corporate Website Revamp',
    dateOfTest: '2024-07-20',
    procedureNo: 'P-123-PT',
    acceptanceCriteria: 'ASME B31.3',
    visualInspection: 'Acceptable',
    surfaceCondition: 'As Welded',
    examinationStage: 'Before PWHT',
    material: 'Carbon Steel',
    weldingProcess: 'SMAW',
    drawingNumber: 'DWG-001-rev2',
    testExtent: '100%',
    testTemperature: '28°C',
    penetrantType: 'Visible, Solvent Removable',
    penetrantBrand: 'Magnaflux',
    penetrantBatch: 'SKL-SP2-12345',
    removerType: 'Solvent',
    removerBrand: 'Magnaflux',
    removerBatch: 'SKC-S-67890',
    developerType: 'Non-aqueous',
    developerBrand: 'Magnaflux',
    developerBatch: 'SKD-S2-24680',
    testEquipment: 'PT Kit, Cleaning Cloth, Calipers',
    testResults: [
        {
            jointNo: 'J-01',
            weldId: 'W-A-01',
            diameter: '6"',
            thickness: '12mm',
            linearIndication: 'N/A',
            roundIndication: 'N/A',
            result: 'Accept',
            imageUrls: ['https://placehold.co/400x225.png'],
        },
        {
            jointNo: 'J-02',
            weldId: 'W-A-02',
            diameter: '6"',
            thickness: '12mm',
            linearIndication: '5mm',
            roundIndication: 'N/A',
            result: 'Reject',
            imageUrls: ['https://placehold.co/400x225.png', 'https://placehold.co/400x225.png'],
        },
    ],
};


export const initialReports: ReportItem[] = [
    { id: 'REP-001', reportNumber: 'PT-2024-001', jobLocation: 'Project Alpha Site', lineType: 'Pipeline', jobType: 'Penetrant Test', qtyJoint: 2, status: 'Approved', details: mockPenetrantDetails },
    { id: 'REP-002', reportNumber: 'MT-2024-001', jobLocation: 'Project Gamma Workshop', lineType: 'Structural Weld', jobType: 'Magnetic Particle Test', qtyJoint: 8, status: 'Submitted', details: null },
    { id: 'REP-003', reportNumber: 'UT-2024-001', jobLocation: 'Project Alpha Site', lineType: 'Pressure Vessel', jobType: 'Ultrasonic Test', qtyJoint: 22, status: 'Draft', details: null },
    { id: 'REP-004', reportNumber: 'RT-2024-001', jobLocation: 'Project Beta Facility', lineType: 'Pipeline', jobType: 'Radiographic Test', qtyJoint: 30, status: 'Rejected', details: null },
    { id: 'REP-005', reportNumber: 'PT-2024-002', jobLocation: 'Project Gamma Workshop', lineType: 'Structural Weld', jobType: 'Penetrant Test', qtyJoint: 2, status: 'Submitted', details: { ...mockPenetrantDetails, client: 'Wayne Enterprises', project: 'Data Analytics Platform', mainContractor: 'Cabang Jakarta' } },
];

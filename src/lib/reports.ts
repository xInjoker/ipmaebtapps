
export type ReportStatus = 'Draft' | 'Submitted' | 'Approved' | 'Rejected' | 'Reviewed';

export type ApprovalAction = {
    actorName: string;
    actorRole: string;
    status: ReportStatus;
    timestamp: string; // ISO Date string
    comments?: string;
};

export type PenetrantTestResult = {
    subjectIdentification: string;
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
    projectExecutor: string;
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
    creationDate: string;
    reviewerId?: string | null;
    approverId?: string | null;
    approvalHistory?: ApprovalAction[];
};

export const reportStatuses: ReportStatus[] = ['Draft', 'Submitted', 'Approved', 'Rejected', 'Reviewed'];

const mockPenetrantDetails: PenetrantTestReportDetails = {
    client: 'Acme Inc.',
    projectExecutor: 'Cabang Jakarta',
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
            subjectIdentification: 'Pipe Weld A-1',
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
            subjectIdentification: 'Pipe Weld A-2',
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
    { 
        id: 'REP-001', 
        reportNumber: 'PT-2024-001', 
        jobLocation: 'Project Alpha Site', 
        lineType: 'Pipeline', 
        jobType: 'Penetrant Test', 
        qtyJoint: 2, 
        status: 'Approved', 
        details: mockPenetrantDetails, 
        creationDate: '2024-07-20', 
        reviewerId: '5', 
        approverId: '6', 
        approvalHistory: [{
            actorName: 'Budi Santoso',
            actorRole: 'Lead Inspector',
            status: 'Submitted',
            timestamp: new Date('2024-07-20T09:00:00Z').toISOString(),
            comments: 'Report created.'
        }, {
            actorName: 'QAQC Client',
            actorRole: 'Client QAQC',
            status: 'Reviewed',
            timestamp: new Date('2024-07-21T10:00:00Z').toISOString(),
            comments: 'Reviewed and looks good.'
        }, {
            actorName: 'Rep Client',
            actorRole: 'Client Representative',
            status: 'Approved',
            timestamp: new Date('2024-07-21T14:00:00Z').toISOString(),
            comments: 'Approved for processing.'
        }] 
    },
    { 
        id: 'REP-002', 
        reportNumber: 'MT-2024-001', 
        jobLocation: 'Project Gamma Workshop', 
        lineType: 'Structural Weld', 
        jobType: 'Magnetic Particle Test', 
        qtyJoint: 8, 
        status: 'Submitted', 
        details: null, 
        creationDate: '2024-07-18', 
        reviewerId: null, 
        approverId: null, 
        approvalHistory: [{
            actorName: 'Citra Dewi',
            actorRole: 'Inspector',
            status: 'Submitted',
            timestamp: new Date('2024-07-18T11:00:00Z').toISOString(),
            comments: 'Report created.'
        }] 
    },
    { 
        id: 'REP-003', 
        reportNumber: 'UT-2024-001', 
        jobLocation: 'Project Alpha Site', 
        lineType: 'Pressure Vessel', 
        jobType: 'Ultrasonic Test', 
        qtyJoint: 22, 
        status: 'Draft', 
        details: null, 
        creationDate: '2024-07-15', 
        reviewerId: null, 
        approverId: null, 
        approvalHistory: [{
            actorName: 'Budi Santoso',
            actorRole: 'Lead Inspector',
            status: 'Draft',
            timestamp: new Date('2024-07-15T16:00:00Z').toISOString(),
            comments: 'Initial draft created.'
        }] 
    },
    { 
        id: 'REP-004', 
        reportNumber: 'RT-2024-001', 
        jobLocation: 'Project Beta Facility', 
        lineType: 'Pipeline', 
        jobType: 'Radiographic Test', 
        qtyJoint: 30, 
        status: 'Rejected', 
        details: null, 
        creationDate: '2024-07-12', 
        reviewerId: '5', 
        approverId: '6', 
        approvalHistory: [{
            actorName: 'Eko Wahyudi',
            actorRole: 'Trainee Inspector',
            status: 'Submitted',
            timestamp: new Date('2024-07-12T08:00:00Z').toISOString(),
            comments: 'Report created.'
        }, {
            actorName: 'QAQC Client',
            actorRole: 'Client QAQC',
            status: 'Rejected',
            timestamp: new Date('2024-07-13T11:30:00Z').toISOString(),
            comments: 'Insufficient evidence provided. Please re-test joint RT-B-05.'
        }]
    },
    { 
        id: 'REP-005', 
        reportNumber: 'PT-2024-002', 
        jobLocation: 'Project Gamma Workshop', 
        lineType: 'Structural Weld', 
        jobType: 'Penetrant Test', 
        qtyJoint: 2, 
        status: 'Submitted', 
        details: { ...mockPenetrantDetails, client: 'Wayne Enterprises', project: 'Data Analytics Platform', projectExecutor: 'Cabang Jakarta' }, 
        creationDate: '2024-07-21', 
        reviewerId: null, 
        approverId: null, 
        approvalHistory: [{
            actorName: 'Budi Santoso',
            actorRole: 'Lead Inspector',
            status: 'Submitted',
            timestamp: new Date('2024-07-21T15:00:00Z').toISOString(),
            comments: 'Report created.'
        }] 
    },
    {
        id: 'REP-006',
        reportNumber: 'PT-2024-003',
        jobLocation: 'HQ Test Facility',
        lineType: 'R&D Weld',
        jobType: 'Penetrant Test',
        qtyJoint: 1,
        status: 'Submitted',
        details: { ...mockPenetrantDetails, client: 'Internal', project: 'Procedure Verification', projectExecutor: 'Headquarters' },
        creationDate: '2024-07-22',
        reviewerId: null,
        approverId: null,
        approvalHistory: [{
            actorName: 'Inspector1',
            actorRole: 'Inspector',
            status: 'Submitted',
            timestamp: new Date('2024-07-22T10:00:00Z').toISOString(),
            comments: 'Report created.'
        }]
    },
    {
        id: 'REP-007',
        reportNumber: 'UT-2024-002',
        jobLocation: 'Project Alpha Site',
        lineType: 'Pipeline',
        jobType: 'Ultrasonic Test',
        qtyJoint: 15,
        status: 'Draft',
        details: null,
        creationDate: '2024-07-23',
        reviewerId: null,
        approverId: null,
        approvalHistory: [{
            actorName: 'Budi Santoso',
            actorRole: 'Lead Inspector',
            status: 'Draft',
            timestamp: new Date('2024-07-23T14:30:00Z').toISOString(),
            comments: 'Initial draft.'
        }]
    },
    {
        id: 'REP-008',
        reportNumber: 'MT-2024-002',
        jobLocation: 'Project Mobile App Site',
        lineType: 'Structural',
        jobType: 'Magnetic Particle Test',
        qtyJoint: 12,
        status: 'Submitted',
        details: null,
        creationDate: '2024-07-24',
        reviewerId: null,
        approverId: null,
        approvalHistory: [{
            actorName: 'Citra Dewi',
            actorRole: 'Inspector',
            status: 'Submitted',
            timestamp: new Date('2024-07-24T09:00:00Z').toISOString(),
            comments: 'Report created.'
        }]
    }
];

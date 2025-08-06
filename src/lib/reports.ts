

export type ReportStatus = 'Draft' | 'Submitted' | 'Approved' | 'Rejected' | 'Reviewed';

export type ApprovalAction = {
    actorName: string;
    actorRole: string;
    status: ReportStatus;
    timestamp: string; // ISO Date string
    comments?: string;
};

// --- Common Report Constants ---
export const reportStatuses: ReportStatus[] = ['Draft', 'Submitted', 'Approved', 'Rejected', 'Reviewed'];

export const acceptanceCriteriaOptions = ['ASME B31.3', 'API 1104', 'ASME Section V', 'AWS D1.1', 'ASME Sec VIII Div 1'];


// --- Cost Categories & COA Mapping ---
export const costCategories = [
    'PT dan PTT',
    'PTT Project',
    'Tenaga Ahli dan Labour Supply',
    'Perjalanan Dinas',
    'Operasional',
    'Fasilitas dan Interen',
    'Amortisasi',
    'Kantor dan Diklat',
    'Promosi',
    'Umum',
    'Other'
];

export const categoryToCoaMap: Record<string, string> = {
    'PT dan PTT': '4100',
    'PTT Project': '4150',
    'Tenaga Ahli dan Labour Supply': '4200',
    'Perjalanan Dinas': '4300',
    'Operasional': '4400',
    'Fasilitas dan Interen': '4500',
    'Amortisasi': '4600',
    'Kantor dan Diklat': '4700',
    'Promosi': '4800',
    'Umum': '4900',
};

export const coaToCategoryMap: Record<number, string> = {
    4100: 'PT dan PTT',
    4150: 'PTT Project',
    4200: 'Tenaga Ahli dan Labour Supply',
    4300: 'Perjalanan Dinas',
    4400: 'Operasional',
    4500: 'Fasilitas dan Interen',
    4600: 'Amortisasi',
    4700: 'Kantor dan Diklat',
    4800: 'Promosi',
    4900: 'Umum',
};

// --- Flash Report (QMS) ---
export type FlashReportDetails = {
    jobType: 'Flash Report';
    project?: string;
    client: string;
    reportNumber: string;
    inspectionDate: string;
    inspectionItem: string;
    quantity: number;
    itemDescription: string;
    vendorName: string;
    inspectorName: string;
    locationCity: string;
    locationProvince: string;
    documentUrls?: string[];
};

// --- Inspection Report (QMS) ---
export type InspectionReportDetails = {
    jobType: 'Inspection Report';
    project?: string;
    vendor: string;
    reportNumber: string;
    startDate?: string;
    endDate?: string;
    equipmentMaterial: string;
    inspector: string;
    travelType: 'Local' | 'Overseas';
    locationType: 'Onshore' | 'Offshore';
    subVendor: string;
    locationCity: string;
    locationProvince: string;
    result: 'Accept' | 'Reject';
    documentUrls?: string[];
};


// --- Penetrant Test (PT) ---
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
    jobType: 'Penetrant Test';
    client: string;
    soNumber: string;
    projectExecutor: string;
    project: string;
    dateOfTest?: string;
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
export const ptProcedureNoOptions = ['PO/AE.MIG-OPS/35-PT'];

// --- Magnetic Particle Test (MT) ---
export type MagneticTestResult = {
    subjectIdentification: string;
    jointNo: string;
    weldId: string;
    indicationDetails: string;
    result: 'Accept' | 'Reject';
    imageUrls: string[];
};

export type MagneticParticleTestReportDetails = {
    jobType: 'Magnetic Particle Test';
    client: string;
    soNumber: string;
    projectExecutor: string;
    project: string;
    dateOfTest?: string;
    procedureNo: string;
    acceptanceCriteria: string;
    surfaceCondition: string;
    examinationStage: string;
    drawingNumber: string;
    magnetizationTechnique: string;
    magneticParticlesType: string;
    particleBrand: string;
    particleBatch: string;
    equipment: string;
    currentType: string;
    amperage: string;
    testResults: MagneticTestResult[];
};

// --- Ultrasonic Test (UT) ---
export type UltrasonicTestResult = {
    subjectIdentification: string;
    jointNo: string;
    weldId: string;
    probeAngle: string;
    frequency: string;
    thickness: string;
    referenceLevelDb: string;
    indicationLevelDb: string;
    attenuationFactorDb: string;
    indicationRating: string;
    scanningLevel: string;
    length: string;
    angularDistance: string;
    surfaceDistance: string;
    discontinuityType: string;
    depth: string;
    remarks: string;
    result: 'Accept' | 'Reject';
    imageUrls: string[];
};

export type UltrasonicTestReportDetails = {
    jobType: 'Ultrasonic Test';
    client: string;
    soNumber: string;
    projectExecutor: string;
    project: string;
    dateOfTest?: string;
    procedureNo: string;
    acceptanceCriteria: string;
    examinationStage: string;
    drawingNumber: string;
    material: string;
    surfaceCondition: string;
    weldingProcess: string;
    scanningTechnique: string;
    equipment: string;
    transducer: string;
    calibrationBlock: string;
    couplant: string;
    scanningSensitivity: string;
    testResults: UltrasonicTestResult[];
};
export const utDiscontinuityTypeOptions = [
    'No Recordable Indication',
    'Porosity',
    'Slag Inclusion',
    'Lack of Fusion',
    'Lack of Penetration',
    'Crack',
    'Other'
];

// --- Radiographic Test (RT) ---
export type RadiographicFinding = {
    filmLocation: string;
    weldIndication: string[];
    remarks: string;
    result: 'Accept' | 'Reject';
};

export type RadiographicTestResult = {
    subjectIdentification: string;
    jointNo: string;
    weldId: string;
    diameter: string;
    thickness: string;
    filmSize: string;
    imageUrls: string[];
    findings: RadiographicFinding[];
};

export type RadiographicTestReportDetails = {
    jobType: 'Radiographic Test';
    client: string;
    soNumber: string;
    projectExecutor: string;
    project: string;
    dateOfTest?: string;
    procedureNo: string;
    acceptanceCriteria: string;
    examinationStage: string;
    drawingNumber: string;
    source: string;
    sourceSize: string;
    sfd: string;
    screens: string;
    density: string;
    material: string;
    technique: string;
    penetrameter: string;
    curries: string;
    kvp: string;
    mA: string;
    cameraSerialNumber: string;
    surveyMeterSerialNumber: string;
    surveyMeterCertExpDate?: string;
    testResults: RadiographicTestResult[];
};
export const rtFilmLocationOptions = ['0 - 4', '4 - 8', '8 - 0', '0', '90', '0 - 5', '5 - 10', '10 - 0'];
export const rtWeldIndicationOptions = [
    'NRI - No Recordable Indication',
    'IP - Incomplete Penetration',
    'IF - Incomplete Fusion',
    'P - Porosity',
    'CP - Cluster Porosity',
    'LP - Linear Porosity',
    'SI - Slag Inclusion',
    'T - Tungsten Inclusion',
    'UC - Undercut',
    'CR - Crack',
    'Hi-Lo',
];
export const rtTechniqueOptions = ['SWSI', 'DWSI', 'DWDI', 'Panoramic'];
export const rtPenetrameterOptions = ['ASTM #10', 'ASTM #12', 'ASTM #15', 'ASTM #20', 'ISO Wire 10-16', 'ISO Wire 6-12'];
export const rtProcedureNoOptions = ['PO/AE.MIG-OPS/35-RT', 'PROJ-SPEC-RT-001'];

// --- Union Type for all Details ---
export type ReportDetails = 
    | PenetrantTestReportDetails 
    | MagneticParticleTestReportDetails 
    | UltrasonicTestReportDetails 
    | RadiographicTestReportDetails
    | FlashReportDetails
    | InspectionReportDetails;


export type ReportItem = {
    id: string;
    reportNumber: string;
    jobLocation: string;
    lineType: string;
    jobType: 'Penetrant Test' | 'Magnetic Particle Test' | 'Ultrasonic Test' | 'Radiographic Test' | 'Flash Report' | 'Inspection Report';
    qtyJoint: number;
    status: ReportStatus;
    details: ReportDetails | null;
    creationDate: string;
    reviewerId?: string | null;
    approverId?: string | null;
    approvalHistory: ApprovalAction[];
};

export const initialReports: ReportItem[] = [];

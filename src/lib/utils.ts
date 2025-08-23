

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { isPast, differenceInDays } from "date-fns";
import type { TenderStatus } from "./tenders";
import type { BadgeProps } from "@/components/ui/badge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getInitials(name: string) {
  if (!name) return '';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

export function getAvatarColor(name:string): { background: string; color: string } {
    if (!name) {
        // Fallback to a neutral theme color
        return { background: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' };
    }
    
    // Vibrant, non-white colors
    const colors = [
        { background: 'hsl(15 85% 55%)', color: 'hsl(0 0% 100%)' }, // Orange-Red
        { background: 'hsl(195 90% 40%)', color: 'hsl(0 0% 100%)' }, // Cyan-Blue
        { background: 'hsl(265 80% 60%)', color: 'hsl(0 0% 100%)' }, // Purple
        { background: 'hsl(110 70% 45%)', color: 'hsl(0 0% 100%)' }, // Green
        { background: 'hsl(340 85% 65%)', color: 'hsl(0 0% 100%)' }, // Pink-Red
        { background: 'hsl(210 90% 50%)', color: 'hsl(0 0% 100%)' }, // Blue
    ];

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
        hash = hash & hash;
    }

    const index = Math.abs(hash % colors.length);
    return colors[index];
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
}

export function formatCurrencyMillions(value: number): string {
    return formatCurrencyCompact(value);
}

export function formatCurrencyCompact(value: number) {
    if (Math.abs(value) >= 1_000_000_000_000) {
        return `Rp ${(value / 1_000_000_000_000).toFixed(1)} T`;
    }
    if (Math.abs(value) >= 1_000_000_000) {
        return `Rp ${(value / 1_000_000_000).toFixed(1)} M`;
    }
    if (Math.abs(value) >= 1_000_000) {
        return `Rp ${(value / 1_000_000).toFixed(1)} Jt`;
    }
    if (Math.abs(value) >= 1_000) {
        return `Rp ${(value / 1_000).toFixed(1)} rb`;
    }
    return `Rp ${value}`;
}


export function getEmployeeStatusVariant(status?: 'Active' | 'Inactive' | 'On Leave') {
  switch (status) {
    case 'Active':
      return 'green' as const;
    case 'On Leave':
      return 'yellow' as const;
    case 'Inactive':
      return 'destructive' as const;
    default:
      return 'secondary' as const;
  }
};

export type CalibrationStatus = {
  text: string;
  variant: 'destructive' | 'yellow' | 'green';
};

export const getCalibrationStatus = (dueDate: Date): CalibrationStatus => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const cleanDueDate = new Date(dueDate);
  cleanDueDate.setHours(0, 0, 0, 0);

  if (isPast(cleanDueDate)) {
    return { text: 'Expired', variant: 'destructive' };
  }
  const daysLeft = differenceInDays(cleanDueDate, today);
  if (daysLeft <= 30) {
    return { text: `Expires in ${daysLeft} days`, variant: 'yellow' };
  }
  return { text: 'Valid', variant: 'green' };
};

export type DocumentStatus = {
  text: string;
  variant: 'destructive' | 'yellow' | 'green' | 'secondary';
};

export const getDocumentStatus = (dueDateString?: string): DocumentStatus => {
    if (!dueDateString) {
        return { text: 'No Expiry', variant: 'secondary' as const };
    }
    const dueDate = new Date(dueDateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const cleanDueDate = new Date(dueDate);
    cleanDueDate.setHours(0, 0, 0, 0);

    if (isPast(cleanDueDate)) {
      return { text: 'Expired', variant: 'destructive' as const };
    }
    const daysLeft = differenceInDays(cleanDueDate, today);
    if (daysLeft <= 30) {
      return { text: `Expires in ${daysLeft} days`, variant: 'yellow' as const };
    }
    return { text: 'Valid', variant: 'green' as const };
};

const QUALIFICATION_MAP: Record<string, { keywords: string[], levels?: string[], abbreviation: string }> = {
    // === Conventional NDT ===
    'UT Level II': { keywords: ['ut', 'ultrasonic', 'ultrasonic testing', 'ultrasonik'], levels: ['level 2', 'level ii', 'lvl 2', 'lvl ii'], abbreviation: 'UT Lvl 2' },
    'RT Level II': { keywords: ['rt', 'radiographic', 'radiographic testing', 'radiografi'], levels: ['level 2', 'level ii', 'lvl 2', 'lvl ii'], abbreviation: 'RT Lvl 2' },
    'MT Level II': { keywords: ['mt', 'magnetic particle'], levels: ['level 2', 'level ii', 'lvl 2', 'lvl ii'], abbreviation: 'MT Lvl 2' },
    'PT Level II': { keywords: ['pt', 'penetrant'], levels: ['level 2', 'level ii', 'lvl 2', 'lvl ii'], abbreviation: 'PT Lvl 2' },
    'VT Level II': { keywords: ['vt', 'visual'], levels: ['level 2', 'level ii', 'lvl 2', 'lvl ii'], abbreviation: 'VT Lvl 2' },
    'LT Level II (Leak Testing)': { keywords: ['lt', 'leak testing'], levels: ['level 2', 'level ii', 'lvl 2', 'lvl ii'], abbreviation: 'LT Lvl 2' },
    'UT Level I': { keywords: ['ut', 'ultrasonic', 'ultrasonic testing', 'ultrasonik'], levels: ['level 1', 'level i', 'lvl 1', 'lvl i'], abbreviation: 'UT Lvl 1' },
    'RT Level I': { keywords: ['rt', 'radiographic', 'radiographic testing', 'radiografi'], levels: ['level 1', 'level i', 'lvl 1', 'lvl i'], abbreviation: 'RT Lvl 1' },
    'MT Level I': { keywords: ['mt', 'magnetic particle'], levels: ['level 1', 'level i', 'lvl 1', 'lvl i'], abbreviation: 'MT Lvl 1' },
    'PT Level I': { keywords: ['pt', 'penetrant'], levels: ['level 1', 'level i', 'lvl 1', 'lvl i'], abbreviation: 'PT Lvl 1' },
    'VT Level I': { keywords: ['vt', 'visual'], levels: ['level 1', 'level i', 'lvl 1', 'lvl i'], abbreviation: 'VT Lvl 1' },
    
    // === Advanced NDT ===
    'PAUT Level II': { keywords: ['paut', 'phased array'], levels: ['level 2', 'level ii', 'lvl 2', 'lvl ii'], abbreviation: 'PAUT' },
    'TOFD Level II': { keywords: ['tofd', 'time of flight diffraction'], levels: ['level 2', 'level ii', 'lvl 2', 'lvl ii'], abbreviation: 'TOFD' },
    'LRUT Level II': { keywords: ['lrut', 'long range ut', 'guided wave', 'gwt'], levels: ['level 2', 'level ii', 'lvl 2', 'lvl ii'], abbreviation: 'LRUT' },
    'ECT Level II': { keywords: ['ect', 'eddy current'], levels: ['level 2', 'level ii', 'lvl 2', 'lvl ii'], abbreviation: 'ECT' },
    'AE Level II': { keywords: ['ae', 'acoustic emission'], levels: ['level 2', 'level ii', 'lvl 2', 'lvl ii'], abbreviation: 'AE' },
    'ACFM Level II': { keywords: ['acfm', 'alternating current field measurement'], levels: ['level 2', 'level ii', 'lvl 2', 'lvl ii'], abbreviation: 'ACFM' },
    'PEC Level II': { keywords: ['pec', 'pulsed eddy current'], levels: ['level 2', 'level ii', 'lvl 2', 'lvl ii'], abbreviation: 'PEC' },
    'SRUT': { keywords: ['srut', 'short range ut'], levels: [], abbreviation: 'SRUT' },
    'MFL': { keywords: ['mfl', 'magnetic flux leakage'], levels: [], abbreviation: 'MFL' },
    'IRIS': { keywords: ['iris', 'internal rotating inspection system'], levels: [], abbreviation: 'IRIS' },
    'CRT (Computed Radiography)': { keywords: ['crt', 'computed radiography'], levels: [], abbreviation: 'CRT' },
    'DRT (Digital Radiography)': { keywords: ['drt', 'digital radiography'], levels: [], abbreviation: 'DRT' },

    // === MIGAS Certifications (KPDM) ===
    'MIGAS Operator Radiografi (OR)': { keywords: ['operator radiografi', 'petugas radiografi', 'or migas'], levels: [], abbreviation: 'OR' },
    'MIGAS Ahli Interpretasi Film (AIF/RFI)': { keywords: ['aif', 'rfi', 'ahli interpretasi film', 'radiographic film interpreter'], levels: [], abbreviation: 'AIF/RFI' },
    'MIGAS Inspektur Las (WI)': { keywords: ['inspektur las', 'wi migas', 'welding inspector'], levels: [], abbreviation: 'WI MIGAS' },
    'MIGAS Inspektur Bejana Tekan': { keywords: ['inspektur bejana tekan', 'pressure vessel inspector migas'], levels: [], abbreviation: 'Insp. Bejana Tekan' },
    'MIGAS Inspektur Tangki Penimbun': { keywords: ['inspektur tangki', 'tank inspector migas', 'inspektur tangki penimbun'], levels: [], abbreviation: 'Insp. Tangki' },
    'MIGAS Inspektur Pipa Penyalur': { keywords: ['inspektur pipa', 'pipeline inspector migas', 'inspektur instalasi pipa penyalur', 'inspektur instalasi minyak dan gas bumi'], levels: [], abbreviation: 'Insp. Pipa Penyalur' },
    'MIGAS Inspektur Katup Pengaman': { keywords: ['inspektur katup pengaman', 'safety valve inspector', 'PSV','Pressure Safety Valve'], levels: [], abbreviation: 'Insp. Katup Pengaman' },
    'MIGAS Inspektur Pesawat Angkat': { keywords: ['inspektur pesawat angkat', 'lifting equipment inspector'], levels: [], abbreviation: 'Insp. Pesawat Angkat' },
    'MIGAS Inspektur Peralatan Putar': { keywords: ['inspektur peralatan putar', 'rotating equipment inspector'], levels: [], abbreviation: 'Insp. Peralatan Putar' },
    'MIGAS Inspektur Peralatan Listrik': { keywords: ['inspektur peralatan listrik', 'electrical inspector migas'], levels: [], abbreviation: 'Insp. Peralatan Listrik' },
    'MIGAS Inspektur Platform': { keywords: ['inspektur platform migas', 'offshore platform inspector'], levels: [], abbreviation: 'Insp. Platform' },
    'MIGAS Inspektur Rig': { keywords: ['inspektur rig', 'rig inspector'], levels: [], abbreviation: 'Insp. Rig' },
    'MIGAS Inspektur Alat Bantu Angkat': { keywords: ['inspektur alat bantu angkat', 'lifting gear inspector', 'iaba'], levels: [], abbreviation: 'Insp. Alat Bantu Angkat' },
    'BAPETEN Petugas Proteksi Radiasi (PPR)': { keywords: ['ppr', 'petugas proteksi radiasi', 'radiation protection officer'], levels: [], abbreviation: 'PPR' },
    'K3 Migas': { keywords: ['k3 migas', 'ahli k3', 'safety officer'], levels: [], abbreviation: 'K3 Migas' },

    // === Welding & Plant Inspection - International ===
    'AWS CWI': { keywords: ['cwi', 'certified welding inspector', 'aws'], levels: [], abbreviation: 'AWS CWI' },
    'API 510 - Pressure Vessel': { keywords: ['api 510', 'pressure vessel inspector'], levels: [], abbreviation: 'API 510' },
    'API 570 - Piping': { keywords: ['api 570', 'piping inspector'], levels: [], abbreviation: 'API 570' },
    'API 653 - Storage Tank': { keywords: ['api 653', 'aboveground storage tank', 'tank inspector'], levels: [], abbreviation: 'API 653' },
    'CSWIP 3.1': { keywords: ['cswip 3.1', 'cswip 31'], levels: [], abbreviation: 'CSWIP 3.1' },

    // === Coating & Painting Inspection ===
    'AMPP (NACE) CIP Level 1': { keywords: ['nace 1', 'ampp 1', 'cip 1', 'coating inspector 1'], levels: [], abbreviation: 'CIP Lvl 1' },
    'AMPP (NACE) CIP Level 2': { keywords: ['nace 2', 'ampp 2', 'cip 2', 'coating inspector 2'], levels: [], abbreviation: 'CIP Lvl 2' },
    'AMPP (NACE) CIP Level 3': { keywords: ['nace 3', 'ampp 3', 'cip 3', 'peer review'], levels: [], abbreviation: 'CIP Lvl 3' },
    'BGAS-CSWIP Painting Inspector Gr. 2': { keywords: ['bgas grade 2', 'bgas gr 2', 'painting inspector grade 2'], levels: [], abbreviation: 'BGAS Gr. 2' },
    'BGAS-CSWIP Painting Inspector Gr. 1': { keywords: ['bgas grade 1', 'bgas gr 1', 'site coatings'], levels: [], abbreviation: 'BGAS Gr. 1' },

    // === Rope Access ===
    'IRATA Level 1': { keywords: ['irata 1'], levels: [], abbreviation: 'IRATA Lvl 1' },
    'IRATA Level 2': { keywords: ['irata 2'], levels: [], abbreviation: 'IRATA Lvl 2' },
    'IRATA Level 3': { keywords: ['irata 3'], levels: [], abbreviation: 'IRATA Lvl 3' },
    'SPRAT Level 1': { keywords: ['sprat 1'], levels: [], abbreviation: 'SPRAT Lvl 1' },
    'SPRAT Level 2': { keywords: ['sprat 2'], levels: [], abbreviation: 'SPRAT Lvl 2' },
    'SPRAT Level 3': { keywords: ['sprat 3'], levels: [], abbreviation: 'SPRAT Lvl 3' },
    
    // === NDT Level III & Management ===
    'ASNT NDT Level III': { keywords: ['asnt level iii', 'asnt level 3', 'level 3', 'level iii'], levels: [], abbreviation: 'ASNT Lvl 3' },
    'PMP (Project Management Professional)': { keywords: ['pmp', 'project management professional'], levels: [], abbreviation: 'PMP' },
};


export function formatQualificationName(name: string): string {
    if (!name) return 'Other';
    
    const cleanedName = name
        .toLowerCase()
        .replace(/\.pdf$|\.jpg$|\.png$|\.jpeg$/i, '')
        .replace(/[_-]/g, ' ');

    for (const standardName in QUALIFICATION_MAP) {
        const { keywords, levels, abbreviation } = QUALIFICATION_MAP[standardName as keyof typeof QUALIFICATION_MAP];
        const hasKeyword = keywords.some(kw => cleanedName.includes(kw));

        if (hasKeyword) {
            // If levels are defined, check for a level match
            if (levels && levels.length > 0) {
                const hasLevel = levels.some(lvl => cleanedName.includes(lvl));
                if (hasLevel) {
                    return abbreviation; // Exact keyword and level match
                }
            // If no levels are defined, a keyword match is sufficient
            } else {
                 return abbreviation;
            }
        }
    }
    
    // Broader secondary check for leveled qualifications where the level might be implied
    for (const standardName in QUALIFICATION_MAP) {
        const { keywords, levels, abbreviation } = QUALIFICATION_MAP[standardName as keyof typeof QUALIFICATION_MAP];
        const hasKeyword = keywords.some(kw => cleanedName.includes(kw));
        
        if (hasKeyword && levels && levels.length > 0) {
             const hasLevel = levels.some(lvl => cleanedName.includes(lvl));
             if (!hasLevel) {
                 return abbreviation;
             }
        }
    }


    return name
        .replace(/\.pdf$|\.jpg$|\.png$|\.jpeg$/i, '')
        .replace(/[_-]/g, ' ')
        .trim();
}


export function formatDocumentName(name?: string) {
    if (!name) return 'Untitled Document';
    return name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, ' ');
}

export function getTenderStatusVariant(status: TenderStatus) {
    switch (status) {
        case 'Awarded': return 'green' as const;
        case 'Bidding':
        case 'Evaluation':
            return 'yellow';
        case 'Aanwijzing':
            return 'blue';
        case 'Lost':
        case 'Cancelled':
            return 'destructive';
        default:
            return 'secondary' as const;
    }
};

export function getCostCategoryVariant(category: string): BadgeProps['variant'] {
    switch (category) {
        case 'PT dan PTT':
        case 'PTT Project':
            return 'blue';
        case 'Tenaga Ahli dan Labour Supply':
            return 'indigo';
        case 'Perjalanan Dinas':
            return 'yellow';
        case 'Operasional':
            return 'green';
        case 'Promosi':
            return 'info';
        case 'Fasilitas dan Interen':
        case 'Amortisasi':
        case 'Kantor dan Diklat':
        case 'Umum':
        case 'Other':
        default:
            return 'secondary';
    }
}

export function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

export function getFileNameFromDataUrl(dataUrl: string): string | null {
    if (typeof dataUrl !== 'string') return null;
    
    // Check if it's a Firebase Storage URL
    if (dataUrl.startsWith('https://firebasestorage.googleapis.com')) {
        try {
            const url = new URL(dataUrl);
            // The pathname is like /v0/b/bucket-name/o/path%2Fto%2Ffile.jpg
            const pathName = decodeURIComponent(url.pathname);
            const fileName = pathName.substring(pathName.lastIndexOf('/') + 1);
            return fileName;
        } catch (e) {
            console.error("Could not parse Firebase Storage URL", e);
            // Fallback for cases where URL parsing might fail
            const lastSlashIndex = dataUrl.lastIndexOf('%2F');
            const tokenIndex = dataUrl.indexOf('?');
            if(lastSlashIndex !== -1 && tokenIndex !== -1) {
                return decodeURIComponent(dataUrl.substring(lastSlashIndex + 3, tokenIndex));
            }
            return 'document';
        }
    }

    // Fallback for old data URI format
    const match = dataUrl.match(/^data:.*;name=([^;]+);/);
    if (match && match[1]) {
        try {
            return decodeURIComponent(match[1]);
        } catch (e) {
            console.error("Could not decode filename from data URL", e);
            return 'document';
        }
    }
    return 'document';
}







    
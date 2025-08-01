
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { isPast, differenceInDays } from "date-fns";
import type { TenderStatus } from "./tenders";

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
  if (Math.abs(value) >= 10000000) { // Threshold for conversion
    const millions = value / 1000000;
    const formattedMillions = new Intl.NumberFormat('id-ID', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(millions);
    return `Rp ${formattedMillions} jt`;
  }
  return formatCurrency(value);
}

export function formatCurrencyCompact(value: number) {
    if (Math.abs(value) >= 1_000_000_000) {
        return `Rp ${(value / 1_000_000_000).toFixed(1).replace(/\.0$/, '')} M`;
    }
    if (Math.abs(value) >= 1_000_000) {
        return `Rp ${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')} Jt`;
    }
    if (Math.abs(value) >= 1_000) {
        return `Rp ${(value / 1_000).toFixed(1).replace(/\.0$/, '')} rb`;
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

export function formatQualificationName(name: string) {
    if (!name) return 'Untitled';
    return name
        .replace(/\.pdf$|\.jpg$|\.png$/i, '') // Remove common extensions
        .replace(/[_-]/g, ' ') // Replace underscores/hyphens with spaces
        .replace(/level/i, 'Lvl') // Abbreviate "Level"
        .trim();
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

export function fileToBase64(file: File): Promise<string | ArrayBuffer | null> {
    return new Promise((resolve, reject) => {
        // Add a robust check to ensure the parameter is a File/Blob object
        if (!(file instanceof Blob)) {
            resolve(null);
            return;
        }
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

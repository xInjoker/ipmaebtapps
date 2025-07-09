import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { isPast, differenceInDays } from "date-fns";

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

export function getAvatarColor(name: string) {
  if (!name) {
    return { background: 'bg-muted', text: 'text-muted-foreground' };
  }
  
  const colorPairs = [
    { background: 'bg-avatar-1', text: 'text-primary-foreground' },
    { background: 'bg-avatar-2', text: 'text-primary-foreground' },
    { background: 'bg-avatar-3', text: 'text-primary-foreground' },
    { background: 'bg-avatar-4', text: 'text-primary-foreground' },
    { background: 'bg-avatar-5', text: 'text-primary-foreground' },
    { background: 'bg-avatar-6', text: 'text-primary-foreground' },
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; 
  }

  const index = Math.abs(hash % colorPairs.length);
  return colorPairs[index];
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
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

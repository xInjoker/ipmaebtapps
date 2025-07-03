import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

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
    { background: 'bg-primary', text: 'text-primary-foreground' },
    { background: 'bg-accent', text: 'text-accent-foreground' },
    { background: 'bg-chart-1', text: 'text-primary-foreground' },
    { background: 'bg-chart-2', text: 'text-primary-foreground' },
    { background: 'bg-destructive', text: 'text-destructive-foreground' },
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; 
  }

  const index = Math.abs(hash % colorPairs.length);
  return colorPairs[index];
}

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatVineBalance(amount: number): string {
  return new Intl.NumberFormat('en-US').format(amount);
}

export function formatDate(date: Date | string | null): string {
  if (!date) return 'N/A';
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
}

export function formatDateTime(date: Date | string | null): string {
  if (!date) return 'N/A';
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function getTimeUntilNextCheckIn(lastCheckIn: Date | string | null): {
  canCheckIn: boolean;
  hoursRemaining: number;
  minutesRemaining: number;
} {
  if (!lastCheckIn) {
    return { canCheckIn: true, hoursRemaining: 0, minutesRemaining: 0 };
  }

  const last = typeof lastCheckIn === 'string' ? new Date(lastCheckIn) : lastCheckIn;
  const now = new Date();
  const nextCheckIn = new Date(last.getTime() + 24 * 60 * 60 * 1000);
  
  if (now >= nextCheckIn) {
    return { canCheckIn: true, hoursRemaining: 0, minutesRemaining: 0 };
  }

  const diff = nextCheckIn.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return { canCheckIn: false, hoursRemaining: hours, minutesRemaining: minutes };
}

export function getTimeUntilNextAd(lastAdWatch: Date | string | null, cooldownMinutes: number): {
  canWatch: boolean;
  minutesRemaining: number;
  secondsRemaining: number;
} {
  if (!lastAdWatch) {
    return { canWatch: true, minutesRemaining: 0, secondsRemaining: 0 };
  }

  const last = typeof lastAdWatch === 'string' ? new Date(lastAdWatch) : lastAdWatch;
  const now = new Date();
  const nextAd = new Date(last.getTime() + cooldownMinutes * 60 * 1000);
  
  if (now >= nextAd) {
    return { canWatch: true, minutesRemaining: 0, secondsRemaining: 0 };
  }

  const diff = nextAd.getTime() - now.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { canWatch: false, minutesRemaining: minutes, secondsRemaining: seconds };
}

export function shortenAddress(address: string, chars = 4): string {
  if (!address) return '';
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

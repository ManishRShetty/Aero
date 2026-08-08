import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMs(ms: number): string {
  return `${Math.round(ms)} ms`;
}

export function formatConfidence(conf: number): string {
  return `${(conf * 100).toFixed(1)}%`;
}

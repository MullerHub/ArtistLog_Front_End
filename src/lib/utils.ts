import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function resolvePhotoUrl(url: string | undefined | null): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const base = import.meta.env.DEV
    ? (import.meta.env.VITE_LOCAL_API_URL || "http://localhost:8080").replace(/\/+$/, "")
    : (import.meta.env.VITE_API_URL || import.meta.env.VITE_PROD_API_FALLBACK_URL || "https://artistlog-backend-latest.onrender.com").replace(/\/+$/, "");
  return `${base}${url}`;
}

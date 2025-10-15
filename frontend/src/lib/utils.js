// src/lib/utils.js
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combine class names conditionally and merge Tailwind classes
 * Usage: cn("p-2", isActive && "bg-red-500")
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format datetime string into local human-readable string
 */
export function formatDateLocal(datetime) {
  if (!datetime) return "-";
  const d = new Date(datetime);
  return d.toLocaleString();
}

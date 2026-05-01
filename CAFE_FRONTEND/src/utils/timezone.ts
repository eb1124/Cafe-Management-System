/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { data } from "react-router-dom";

/**
 * Convert UTC date to IST (Indian Standard Time)
 * IST is UTC+5:30
 */
export const convertToIST = (dateInput?: string | Date): string => {
  try {
    if (!dateInput) return '';

    // ✅ If already YYYY-MM-DD → return directly (NO conversion)
    if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
      return dateInput;
    }

    // Only use Date object if needed
    const date = new Date(dateInput);

    if (isNaN(date.getTime())) return '';

    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);

  } catch (error) {
    console.error('Error converting to IST:', error);
    return '';
  }
};
/**
 * Get current date in IST
 */

/**
 * Get current date in YYYY-MM-DD format for date inputs
 * This returns the IST date in YYYY-MM-DD format for HTML date inputs
 */
export const getCurrentDateForInput = (): string => {
  const now = new Date(); // ✅ current date

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`; // ✅ "YYYY-MM-DD"
};

/**
 * Format any date to YYYY-MM-DD for HTML date input fields
 * Handles various input formats and ensures consistent output
 */
export const formatDateForInput = (date?: string | Date): string => {
  if (!date) return '';

  // If string → DO NOT TOUCH
  if (typeof date === 'string') {
    return date.slice(0, 10); // safest
  }

  // If Date object → extract local values (no conversion)
  if (date instanceof Date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  return '';
};

export const getCurrentDateIST = (): string => {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
};
/**
 * Format date to IST in DD-MM-YYYY format
 */
export const formatDateIST = (dateInput?: string | Date): string => {
  if (!dateInput) return '';

  // ✅ If already YYYY-MM-DD → return directly
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    return dateInput;
  }

  const date = new Date(dateInput);

  if (isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
};

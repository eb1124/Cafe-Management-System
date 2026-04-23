/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Convert UTC date to IST (Indian Standard Time)
 * IST is UTC+5:30
 */
export const convertToIST = (dateString?: string | Date): string => {
  try {
    const date = dateString ? new Date(dateString) : new Date();
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return new Date().toLocaleDateString('en-CA'); // Fallback to today in YYYY-MM-DD
    }
    
    // Use Intl.DateTimeFormat to format in IST without creating invalid Date objects
    const year = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
    }).format(date);
    
    const month = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      month: '2-digit',
    }).format(date);
    
    const day = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
    }).format(date);
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Error converting to IST:', error);
    return new Date().toLocaleDateString('en-CA'); // Fallback to today
  }
};

/**
 * Get current date in IST
 */
export const getCurrentDateIST = (): string => {
  return convertToIST(new Date());
};

/**
 * Get current date and time in IST
 */
export const getCurrentDateTimeIST = (): string => {
  const date = new Date();
  return date.toLocaleString('en-IN', { 
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
};

/**
 * Format date to IST in DD-MM-YYYY format
 */
export const formatDateIST = (dateString?: string | Date): string => {
  try {
    const date = dateString ? new Date(dateString) : new Date();
    
    if (isNaN(date.getTime())) {
      return new Date().toLocaleDateString('en-IN');
    }
    
    return date.toLocaleString('en-IN', { 
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting date to IST:', error);
    return new Date().toLocaleDateString('en-IN');
  }
};


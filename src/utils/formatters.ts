/**
 * Format a number as currency in EUR
 * @param amount Amount in cents
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount / 100);
};

/**
 * Format a date to a localized string
 * @param date Date to format
 * @param format Format to use (short, medium, long)
 * @returns Formatted date string
 */
export const formatDate = (date: Date | string, format: 'short' | 'medium' | 'long' = 'medium'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: format === 'short' ? '2-digit' : 'long',
    day: '2-digit'
  };
  
  if (format !== 'short') {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  
  return dateObj.toLocaleDateString('fr-FR', options);
};

/**
 * Format a payment method to a human-readable string
 * @param method Payment method code
 * @returns Human-readable payment method
 */
export const formatPaymentMethod = (method: string): string => {
  switch (method) {
    case 'card':
      return 'Carte bancaire';
    case 'transfer':
      return 'Virement bancaire';
    case 'cash':
      return 'Espèces/Chèque';
    default:
      return method;
  }
};

/**
 * Truncate a string to a maximum length and add ellipsis if needed
 * @param str String to truncate
 * @param maxLength Maximum length
 * @returns Truncated string
 */
export const truncate = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
};
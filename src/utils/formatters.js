/**
 * Centralized Formatters
 * Utilities for formatting common data types (currency, dates, prices)
 */

/**
 * Format value as currency (ARS)
 * @param {number} value - The value to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value) => {
  try {
    if (!value && value !== 0) return "-";
    return parseFloat(value).toLocaleString("es-AR", {
      style: "currency",
      currency: "ARS",
    });
  } catch {
    return "-";
  }
};

/**
 * Format value as price
 * @param {number} price - The price to format
 * @returns {string} Formatted price string
 */
export const formatPrice = (price) => {
  try {
    if (!price && price !== 0) return "-";
    return `$${parseFloat(price).toFixed(2)}`;
  } catch {
    return "-";
  }
};

/**
 * Format date to locale string
 * @param {Date|Timestamp} timestamp - The date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (timestamp) => {
  if (!timestamp) return "-";
  try {
    const date = timestamp.toDate?.() || new Date(timestamp);
    return date.toLocaleDateString("es-AR");
  } catch {
    return "-";
  }
};

/**
 * Format date and time to locale string
 * @param {Date|Timestamp} timestamp - The date to format
 * @returns {string} Formatted date and time string
 */
export const formatDateTime = (timestamp) => {
  if (!timestamp) return "-";
  try {
    const date = timestamp.toDate?.() || new Date(timestamp);
    return date.toLocaleString("es-AR");
  } catch {
    return "-";
  }
};

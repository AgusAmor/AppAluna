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
 * Resolve any date format to a JS Date object.
 * Handles: Firestore Timestamp (live), serialized { seconds }, { _seconds }, ISO string, Date.
 * @param {*} value
 * @returns {Date|null}
 */
const resolveDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value.toDate === "function") return value.toDate();
  if (typeof value === "object" && "seconds" in value)
    return new Date(value.seconds * 1000);
  if (typeof value === "object" && "_seconds" in value)
    return new Date(value._seconds * 1000);
  if (typeof value === "string" || typeof value === "number")
    return new Date(value);
  return null;
};

/**
 * Format date to dd/MM/yyyy
 * @param {*} timestamp - Date in any supported format
 * @returns {string} Formatted date string
 */
export const formatDate = (timestamp) => {
  if (!timestamp) return "-";
  try {
    const date = resolveDate(timestamp);
    if (!date || isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "-";
  }
};

/**
 * Format date and time to dd/MM/yyyy · HH:mm
 * @param {*} timestamp - Date in any supported format
 * @returns {string} Formatted date and time string
 */
export const formatDateTime = (timestamp) => {
  if (!timestamp) return "-";
  try {
    const date = resolveDate(timestamp);
    if (!date || isNaN(date.getTime())) return "-";
    const datePart = date.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const timePart = date.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    return `${datePart} · ${timePart}`;
  } catch {
    return "-";
  }
};

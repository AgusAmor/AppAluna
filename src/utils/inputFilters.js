/**
 * inputFilters.js
 * Input character filters to restrict data types per field
 * Ensures only valid characters are entered without needing validation
 */

/**
 * Filter for street names - allow letters, numbers, spaces, dashes, dots, parentheses
 * @param {string} text - Input text
 * @returns {string} Filtered text
 */
export const filterStreet = (text) => {
  return text.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-\.,()]/g, "");
};

/**
 * Filter for house/building numbers - allow numeric strings up to 4 digits (1-9999)
 * Like WebAluna: restricts to 1-9999 range for numeric-only house numbers
 * Allows formats like: 123, but NOT 123-A or Lote 5 for numeric-only
 * @param {string} text - Input text
 * @returns {string} Filtered text (numeric only, max 4 digits = 9999)
 */
export const filterNumber = (text) => {
  // Remove non-numeric characters
  const numericOnly = text.replace(/[^0-9]/g, "");

  // If empty, return empty
  if (!numericOnly) return "";

  // Restrict to max 9999 (4 digits)
  const numValue = parseInt(numericOnly, 10);
  if (numValue > 9999) {
    return "9999";
  }

  return numericOnly;
};

/**
 * Filter for city names - allow letters, numbers, spaces, dashes
 * @param {string} text - Input text
 * @returns {string} Filtered text
 */
export const filterCity = (text) => {
  return text.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-]/g, "");
};

/**
 * Filter for region/neighborhood names - allow letters, spaces, dashes
 * @param {string} text - Input text
 * @returns {string} Filtered text
 */
export const filterRegion = (text) => {
  return text.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-]/g, "");
};

/**
 * Filter for postal codes - allow numbers and letters
 * Handles various formats like: 1425, C1425BHO, etc.
 * @param {string} text - Input text
 * @returns {string} Filtered text (uppercase)
 */
export const filterPostalCode = (text) => {
  return text.toUpperCase().replace(/[^0-9A-Z]/g, "");
};

/**
 * Filter for recipient names - allow letters, numbers, spaces, dots
 * @param {string} text - Input text
 * @returns {string} Filtered text
 */
export const filterRecipientName = (text) => {
  return text.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\.]/g, "");
};

/**
 * Filter for phone numbers - allow digits, spaces, +, -, (, )
 * International format friendly
 * @param {string} text - Input text
 * @returns {string} Filtered text
 */
export const filterPhone = (text) => {
  return text.replace(/[^\d\s+\-()]/g, "");
};

/**
 * Filter for numeric only fields
 * @param {string} text - Input text
 * @returns {string} Filtered text (digits only)
 */
export const filterNumericOnly = (text) => {
  return text.replace(/[^\d]/g, "");
};

/**
 * Get the appropriate filter function for a field
 * @param {string} fieldName - Name of the field
 * @returns {Function} Filter function
 */
export const getFilterForField = (fieldName) => {
  const filters = {
    street: filterStreet,
    number: filterNumber,
    city: filterCity,
    region: filterRegion,
    postalCode: filterPostalCode,
    recipientName: filterRecipientName,
    recipientPhone: filterPhone,
  };

  return filters[fieldName] || ((text) => text);
};

/**
 * Get max length for a field
 * @param {string} fieldName - Name of the field
 * @returns {number} Maximum length
 */
export const getMaxLengthForField = (fieldName) => {
  const maxLengths = {
    street: 100,
    number: 4, // Max 9999 (4 digits) like WebAluna
    city: 50,
    region: 50,
    postalCode: 20,
    recipientName: 100,
    recipientPhone: 20,
  };

  return maxLengths[fieldName] || 100;
};

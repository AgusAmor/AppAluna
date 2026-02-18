/**
 * addressUtils.js
 * Shared address utilities for address management
 */

/**
 * Creates an empty address object with default structure
 * @returns {object} Empty address object
 */
export const createEmptyAddress = () => ({
  street: "",
  number: "",
  apartment: "",
  city: "",
  region: "",
  postalCode: "",
  recipientName: "",
  recipientPhone: "",
  isDefault: false,
});

/**
 * Updates the default flag for an address and clears it from others
 * @param {Array} addresses - Array of address objects
 * @param {number} idx - Index of address to set as default
 * @param {string} fieldName - Field name being updated
 * @param {boolean} checked - New value for the field
 * @returns {Array} Updated addresses array
 */
export const updateDefaultAddress = (addresses, idx, fieldName, checked) => {
  // Only handle isDefault field logic
  if (fieldName === "isDefault" && checked) {
    return addresses.map((addr, i) => ({
      ...addr,
      isDefault: i === idx,
    }));
  }
  // For any other field, return addresses unchanged
  return addresses;
};

/**
 * Removes an address at the specified index
 * @param {Array} addresses - Array of address objects
 * @param {number} idx - Index to remove
 * @returns {Array} Updated addresses array
 */
export const removeAddressAtIndex = (addresses, idx) =>
  addresses.filter((_, i) => i !== idx);

/**
 * Adds a new empty address to the array
 * @param {Array} addresses - Current addresses array
 * @returns {Array} Updated addresses array with new empty address
 */
export const addNewAddress = (addresses) => [
  ...addresses,
  createEmptyAddress(),
];

/**
 * Ensures at least one address is set as default
 * If no address is default, sets the first one as default
 * @param {Array} addresses - Array of address objects
 * @returns {Array} Updated addresses array with at least one default
 */
export const ensureDefaultAddress = (addresses) => {
  if (addresses.length === 0) return addresses;

  const hasDefault = addresses.some((addr) => addr.isDefault);

  if (!hasDefault) {
    return addresses.map((addr, idx) => ({
      ...addr,
      isDefault: idx === 0,
    }));
  }

  return addresses;
};

/**
 * Validates required address fields with length constraints
 * @param {object} address - Address object to validate
 * @returns {object} Errors object { fieldName: errorMessage }
 */
export const validateAddressFields = (address) => {
  const errors = {};

  // Define validation rules: { fieldName: { required: true, min, max } }
  const validationRules = {
    street: { required: true, min: 3, max: 100 },
    number: { required: true, min: 1, max: 20 },
    city: { required: true, min: 2, max: 50 },
    region: { required: true, min: 2, max: 50 },
    postalCode: { required: true, min: 2, max: 20 },
    recipientName: { required: true, min: 3, max: 100 },
    recipientPhone: { required: true, min: 7, max: 20 }, // Mínimo 7 dígitos
  };

  // Validate each field
  Object.entries(validationRules).forEach(([field, rules]) => {
    const value = address[field];
    const fieldLabel = getAddressFieldLabel(field);

    // Check required
    if (rules.required && (!value || value.trim() === "")) {
      errors[field] = `${fieldLabel} es requerido`;
      return;
    }

    // Check length
    if (value && value.trim() !== "") {
      const length = value.trim().length;

      if (rules.min && length < rules.min) {
        errors[field] =
          `${fieldLabel} debe tener al menos ${rules.min} caracteres`;
      } else if (rules.max && length > rules.max) {
        errors[field] =
          `${fieldLabel} no puede exceder ${rules.max} caracteres`;
      }
    }
  });

  return errors;
};

/**
 * Gets a friendly label for address field names
 * @param {string} fieldName - Field name
 * @returns {string} Friendly label
 */
const getAddressFieldLabel = (fieldName) => {
  const labels = {
    street: "Calle",
    number: "Número",
    apartment: "Apartamento",
    city: "Ciudad",
    region: "Región/Provincia",
    postalCode: "Código Postal",
    recipientName: "Nombre del Destinatario",
    recipientPhone: "Teléfono del Destinatario",
  };
  return labels[fieldName] || fieldName;
};

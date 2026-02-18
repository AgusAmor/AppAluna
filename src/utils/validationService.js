/**
 * validationService.js
 * Centralized validation service for form validation
 * Single source of truth for all form validation logic
 */

import { VALIDATION } from "./validationConstants.js";

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
export function isValidEmail(email) {
  return VALIDATION.EMAIL_REGEX.test(email);
}

/**
 * Validates phone number format (international format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid
 */
export function isValidPhone(phone) {
  return VALIDATION.PHONE_REGEX.test(phone);
}

/**
 * Validates flexible phone format (allows spaces, dashes, parens)
 * Optional field - empty is valid
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid
 */
export function isValidContactPhone(phone) {
  if (!phone || phone.trim() === "") return true; // Optional field empty is valid
  // Allow digits, spaces, +, -, (, )
  return /^[\d\s+\-()]*$/.test(phone);
}

/**
 * Validates minimum digits in phone number
 * @param {string} phone - Phone number
 * @param {number} min - Minimum digits (default 7)
 * @returns {boolean} True if valid
 */
export function validatePhoneMinDigits(phone, min = 7) {
  if (!phone || phone.trim() === "") return true;
  const digits = phone.replace(/\D/g, "");
  return digits.length >= min;
}

/**
 * Validates required field
 * @param {any} value - Value to validate
 * @param {string} fieldName - Name of the field for error message
 * @returns {string|null} Error message or null if valid
 */
export function validateRequired(value, fieldName = "Este campo") {
  if (!value || (typeof value === "string" && value.trim() === "")) {
    return `${fieldName} es requerido`;
  }
  return null;
}

/**
 * Validates string length
 * @param {string} value - Value to validate
 * @param {number} min - Minimum length
 * @param {number} max - Maximum length
 * @param {string} fieldName - Field name for error message
 * @returns {string|null} Error message or null if valid
 */
export function validateLength(value, min, max, fieldName = "Este campo") {
  if (!value) return null;
  const length = value.length;
  if (length < min) {
    return `${fieldName} debe tener al menos ${min} caracteres`;
  }
  if (length > max) {
    return `${fieldName} no puede tener más de ${max} caracteres`;
  }
  return null;
}

/**
 * Creates a validator function for required fields
 * @param {string} fieldName - Field name
 * @returns {Function} Validator function
 */
export function createRequiredValidator(fieldName) {
  return (value) => validateRequired(value, fieldName);
}

/**
 * Creates a validator function for email fields
 * @param {string} fieldName - Field name (default: "Email")
 * @returns {Function} Validator function
 */
export function createEmailValidator(fieldName = "Email") {
  return (value) => {
    const requiredError = validateRequired(value, fieldName);
    if (requiredError) return requiredError;
    if (!isValidEmail(value)) return `${fieldName} inválido`;
    return null;
  };
}

/**
 * Creates a validator function for phone fields (optional)
 * @param {string} fieldName - Field name (default: "Teléfono")
 * @returns {Function} Validator function
 */
export function createPhoneValidator(fieldName = "Teléfono") {
  return (value) => {
    // Phone is optional
    if (!value || value.trim() === "") return null;

    if (!isValidContactPhone(value)) {
      return `${fieldName} inválido. Solo números y símbolos +, -, ( )`;
    }

    if (!validatePhoneMinDigits(value, 7)) {
      return `${fieldName} debe tener al menos 7 dígitos`;
    }

    return null;
  };
}

/**
 * Validates a form object against rules
 * @param {Object} formData - Form data to validate
 * @param {Object} rules - Validation rules { fieldName: [validator1, validator2, ...] }
 * @returns {Object} Errors object { fieldName: errorMessage }
 */
export function validateForm(formData, rules) {
  const errors = {};

  for (const [fieldName, validators] of Object.entries(rules)) {
    const value = formData[fieldName];

    // Validators should be functions that return error message or null
    for (const validator of validators) {
      const error = validator(value, fieldName);
      if (error) {
        errors[fieldName] = error;
        break; // Stop at first error for this field
      }
    }
  }

  return errors;
}

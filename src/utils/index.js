/**
 * Utility functions index
 * Centralized exports for all utility functions
 */

export {
  isValidEmail,
  isValidPhone,
  isValidContactPhone,
  validatePhoneMinDigits,
  validateRequired,
  validateLength,
  createRequiredValidator,
  createEmailValidator,
  createPhoneValidator,
  validateForm,
} from "./validationService";

export { VALIDATION } from "./validationConstants";

export {
  createEmptyAddress,
  updateDefaultAddress,
  removeAddressAtIndex,
  addNewAddress,
  ensureDefaultAddress,
  validateAddressFields,
} from "./addressUtils";

export {
  splitPhoneNumber,
  combinePhoneNumber,
  formatPhoneDisplay,
} from "./phoneUtils";

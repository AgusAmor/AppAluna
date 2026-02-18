/**
 * phoneUtils.js
 * Shared phone number utilities
 */

/**
 * Splits a combined phone number into country code and local number
 * @param {string} phone - Combined phone number (e.g., "+549 123456789")
 * @returns {object} { phoneCountry, phoneLocal } or { phoneCountry: "", phoneLocal: "" }
 */
export const splitPhoneNumber = (phone) => {
  if (!phone) {
    return { phoneCountry: "", phoneLocal: "" };
  }

  // Handle both "+549 123456789" and "+549123456789" formats
  const match = phone.match(/^\+(\d+)\s?(.*)$/);

  if (match) {
    return {
      phoneCountry: `+${match[1]}`,
      phoneLocal: match[2] || "",
    };
  }

  // If no + prefix, assume it's just the local number
  return { phoneCountry: "", phoneLocal: phone };
};

/**
 * Combines country code and local number into a single phone string
 * @param {string} phoneCountry - Country code (e.g., "+549")
 * @param {string} phoneLocal - Local number
 * @returns {string} Combined phone number
 */
export const combinePhoneNumber = (phoneCountry, phoneLocal) => {
  if (!phoneCountry || !phoneLocal) return "";
  return `${phoneCountry} ${phoneLocal}`.trim();
};

/**
 * Formats a phone number for display
 * Removes extra spaces and maintains the structure
 * @param {string} phone - Phone number to format
 * @returns {string} Formatted phone number
 */
export const formatPhoneDisplay = (phone) => {
  if (!phone) return "";
  // Remove extra spaces
  return phone.replace(/\s+/g, " ").trim();
};

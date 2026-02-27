/**
 * Address Formatter
 * Utilities for formatting address data
 */

/**
 * Format address object to readable string
 * Handles both string and object address formats
 * @param {string|object} address - Address data (string or object with street, number, region, city)
 * @returns {string} Formatted address string
 */
export const formatAddress = (address) => {
  if (!address) return "";

  // If address is already a string, return it
  if (typeof address === "string") {
    return address;
  }

  // If address is an object, format it: street number, region · city
  if (typeof address === "object") {
    const streetNumber = [address.street, address.number]
      .filter(Boolean)
      .join(" ");
    const regionCity = [address.region, address.city]
      .filter(Boolean)
      .join(" · ");
    return [streetNumber, regionCity].filter(Boolean).join(", ");
  }

  return "";
};

/**
 * Format delivery address from order
 * Handles pickup vs shipping addresses
 * @param {object} delivery - Delivery object from order
 * @returns {object|null} Object with type and formatted address, or null
 */
export const formatDeliveryInfo = (delivery) => {
  if (!delivery) return null;

  if (delivery.method === "pickup") {
    return {
      type: "Retiro",
      displayType: "Retiro en Local",
      address: null,
    };
  }

  const address = delivery?.shippingAddress;
  if (!address) return null;

  return {
    type: "Envío",
    displayType: "Dirección de Entrega",
    address: formatAddress(address),
  };
};

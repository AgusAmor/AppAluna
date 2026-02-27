/**
 * useOrdersFilter.js
 * Custom hook for managing order list filters
 * Handles: search by customer name/email/address, filter by status, filter by product, sort by status
 * Returns: filtered orders, search term, status filter, product filter, and setters
 */

import { useState, useMemo } from "react";

// Order status filter options
export const ORDER_STATUS_FILTERS = {
  ALL: "all",
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PRINTING: "printing",
  DISPATCHED: "dispatched",
  DELIVERED: "delivered",
  WITHDRAWN: "withdrawn",
  CANCELLED: "cancelled",
};

// Status sort options
export const STATUS_SORTS = {
  NONE: "none",
  ASC: "asc",
  DESC: "desc",
};

// Delivery method filter options
export const DELIVERY_METHOD_FILTERS = {
  ALL: "all",
  ENVIO: "envio",
  RETIRO: "retiro",
};

/**
 * Get numeric value for order status to enable sorting
 * Orden: pending > confirmed > printing > dispatched > delivered/withdrawn > cancelled
 */
const getStatusValue = (status) => {
  const statusMap = {
    pending: 1,
    confirmed: 2,
    printing: 3,
    dispatched: 4,
    delivered: 5,
    withdrawn: 5,
    cancelled: 6,
  };
  return statusMap[status] || 0;
};

/**
 * Formats address from shipping address object
 * Format: street number, region · city
 */
const getAddressText = (shippingAddress) => {
  if (!shippingAddress) return "";

  if (typeof shippingAddress === "string") {
    return shippingAddress;
  }

  if (typeof shippingAddress === "object") {
    const streetNumber = [shippingAddress.street, shippingAddress.number]
      .filter(Boolean)
      .join(" ");
    const regionCity = [shippingAddress.region, shippingAddress.city]
      .filter(Boolean)
      .join(" · ");
    return [streetNumber, regionCity].filter(Boolean).join(", ");
  }

  return "";
};

/**
 * useOrdersFilter
 * Filters orders by multiple criteria and sorts by status
 * @param {Array} orders - Orders to filter
 * @param {Array} products - Products for filtering (optional)
 * @returns {Object} Filtered orders and filter controls
 */
export function useOrdersFilter(orders, products = []) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(ORDER_STATUS_FILTERS.ALL);
  const [statusSort, setStatusSort] = useState(STATUS_SORTS.NONE);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [showFinalized, setShowFinalized] = useState(true);
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState(
    DELIVERY_METHOD_FILTERS.ALL,
  );

  // Filter and sort orders
  const filteredOrders = useMemo(() => {
    if (!orders) return [];

    let result = orders;

    // Search filter (name, email, order number, address)
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter((order) => {
        const matchesName =
          order.customerInfo?.name?.toLowerCase().includes(searchLower) ||
          false;
        const matchesEmail =
          order.customerInfo?.email?.toLowerCase().includes(searchLower) ||
          false;
        const matchesOrderNumber =
          order.orderNumber?.toLowerCase().includes(searchLower) || false;
        const matchesAddress =
          getAddressText(order.delivery?.shippingAddress)
            .toLowerCase()
            .includes(searchLower) || false;

        return (
          matchesName || matchesEmail || matchesOrderNumber || matchesAddress
        );
      });
    }

    // Status filter
    if (statusFilter !== ORDER_STATUS_FILTERS.ALL) {
      result = result.filter((order) => order.status === statusFilter);
    }

    // Product filter
    if (selectedProductId) {
      result = result.filter(
        (order) =>
          order.items &&
          order.items.some((item) => item.productId === selectedProductId),
      );
    }

    // Delivery method filter
    if (selectedDeliveryMethod !== DELIVERY_METHOD_FILTERS.ALL) {
      result = result.filter((order) => {
        const method = order.delivery?.method;
        if (selectedDeliveryMethod === DELIVERY_METHOD_FILTERS.ENVIO) {
          return method !== "pickup";
        } else if (selectedDeliveryMethod === DELIVERY_METHOD_FILTERS.RETIRO) {
          return method === "pickup";
        }
        return true;
      });
    }

    // Filter finalized orders (cancelled, delivered, withdrawn)
    if (!showFinalized) {
      result = result.filter(
        (order) =>
          ![
            ORDER_STATUS_FILTERS.CANCELLED,
            ORDER_STATUS_FILTERS.DELIVERED,
            ORDER_STATUS_FILTERS.WITHDRAWN,
          ].includes(order.status),
      );
    }

    // Sort by status
    if (statusSort !== STATUS_SORTS.NONE) {
      result = [...result].sort((a, b) => {
        const statusValueA = getStatusValue(a.status);
        const statusValueB = getStatusValue(b.status);

        if (statusSort === STATUS_SORTS.ASC) {
          return statusValueA - statusValueB;
        } else {
          return statusValueB - statusValueA;
        }
      });
    }

    return result;
  }, [
    orders,
    searchTerm,
    statusFilter,
    statusSort,
    selectedProductId,
    showFinalized,
    selectedDeliveryMethod,
  ]);

  return {
    filteredOrders,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    statusSort,
    setStatusSort,
    selectedProductId,
    setSelectedProductId,
    showFinalized,
    setShowFinalized,
    selectedDeliveryMethod,
    setSelectedDeliveryMethod,
  };
}

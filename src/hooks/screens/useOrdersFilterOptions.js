/**
 * useOrdersFilterOptions Hook
 * Manages all filter option generation for Orders screen
 */

import { useMemo } from "react";
import {
  getStatusFilterOptions,
  getDeliveryMethodFilterOptions,
} from "../../constants/orderConstants";
import { getStatusColor } from "../../utils/statusColors";
import { ORDER_STATUS_FILTERS } from "./useOrdersFilter";

/**
 * Custom hook for generating and memoizing filter options
 * @param {Array} products - List of available products
 * @returns {object} status, statusColorMap, deliveryMethod, product options
 */
export const useOrdersFilterOptions = (products) => {
  // Status filter options
  const statusOptions = useMemo(() => {
    return getStatusFilterOptions();
  }, []);

  // Status color map for Select styling
  const statusColorMap = useMemo(() => {
    return {
      [ORDER_STATUS_FILTERS.PENDING]: getStatusColor("pending"),
      [ORDER_STATUS_FILTERS.CONFIRMED]: getStatusColor("confirmed"),
      [ORDER_STATUS_FILTERS.PRINTING]: getStatusColor("printing"),
      [ORDER_STATUS_FILTERS.DISPATCHED]: getStatusColor("dispatched"),
      [ORDER_STATUS_FILTERS.DELIVERED]: getStatusColor("delivered"),
      [ORDER_STATUS_FILTERS.WITHDRAWN]: getStatusColor("withdrawn"),
      [ORDER_STATUS_FILTERS.CANCELLED]: getStatusColor("cancelled"),
    };
  }, []);

  // Product filter options
  const productOptions = useMemo(() => {
    const baseOptions = [{ label: "Producto", value: null }];
    if (products && products.length > 0) {
      const productOpts = products.map((product) => ({
        label: product.name,
        value: product.id,
      }));
      return [...baseOptions, ...productOpts];
    }
    return baseOptions;
  }, [products]);

  // Delivery method filter options
  const deliveryMethodOptions = useMemo(() => {
    return getDeliveryMethodFilterOptions();
  }, []);

  return {
    statusOptions,
    statusColorMap,
    productOptions,
    deliveryMethodOptions,
  };
};

export default useOrdersFilterOptions;

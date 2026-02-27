/**
 * Order Constants
 * Centralized constants for order-related filters and options
 */

import {
  ORDER_STATUS_FILTERS,
  DELIVERY_METHOD_FILTERS,
} from "../hooks/screens";

/**
 * Status filter options for Select component
 */
export const getStatusFilterOptions = () => [
  { label: "Estado", value: ORDER_STATUS_FILTERS.ALL },
  { label: "Pendiente", value: ORDER_STATUS_FILTERS.PENDING },
  { label: "Confirmado", value: ORDER_STATUS_FILTERS.CONFIRMED },
  { label: "Imprimiendo", value: ORDER_STATUS_FILTERS.PRINTING },
  { label: "Despachado", value: ORDER_STATUS_FILTERS.DISPATCHED },
  { label: "Entregado", value: ORDER_STATUS_FILTERS.DELIVERED },
  { label: "Retirado", value: ORDER_STATUS_FILTERS.WITHDRAWN },
  { label: "Cancelado", value: ORDER_STATUS_FILTERS.CANCELLED },
];

/**
 * Delivery method filter options for Select component
 */
export const getDeliveryMethodFilterOptions = () => [
  { label: "Entrega", value: DELIVERY_METHOD_FILTERS.ALL },
  { label: "Envío", value: DELIVERY_METHOD_FILTERS.ENVIO },
  { label: "Retiro", value: DELIVERY_METHOD_FILTERS.RETIRO },
];

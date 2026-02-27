/**
 * Screen hooks index
 * Central export point for all screen-related custom hooks
 * Re-exports hooks from organized subcategories (users, products, etc.)
 *
 * Usage: import { useUsersList, useProductsList } from "../hooks/screens";
 */

export {
  useUsersList,
  useUserModal,
  useUserEdit,
  useAddressEdit,
  useUserActions,
  useModalTransitions,
  useModalReopenLogic,
  useUsersFilter,
  ACCOUNT_STATUS_FILTERS,
} from "./users";
export {
  useProductsList,
  useProductEdit,
  useProductsFilter,
  FAMILY_FILTERS,
  PRICE_SORTS,
} from "./products";
export { useDashboardStats } from "./useDashboardStats";
export { useOrdersList } from "./useOrdersList";
export {
  useOrdersFilter,
  ORDER_STATUS_FILTERS,
  STATUS_SORTS,
  DELIVERY_METHOD_FILTERS,
} from "./useOrdersFilter";

/**
 * Product management hooks index
 * Exports all custom hooks specific to product management screen
 * - useProductsList: Manages product list, real-time subscription, debouncing
 * - useProductEdit: Manages product edit modal state and form
 * - useProductsFilter: Filters products by search term and family
 */

export { useProductsList } from "./useProductsList";
export { useProductEdit } from "./useProductEdit";
export {
  useProductsFilter,
  FAMILY_FILTERS,
  PRICE_SORTS,
} from "./useProductsFilter";

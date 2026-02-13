/**
 * Hooks index
 * Central export point for all custom hooks organized by category
 *
 * Exports:
 * - loading/: Data management hooks (debounce, pagination, utilities)
 * - screens/: UI logic and screen-specific hooks (user management, modals, forms)
 *
 * Usage: import { useUsersList, useDebounce } from "./hooks";
 */

// Data & loading hooks
export { useDebounce, usePagination, useScreenFocus } from "./loading";

// Screen hooks (organized by screen/feature)
export {
  useUsersList,
  useUserModal,
  useUserEdit,
  useAddressEdit,
  useUserActions,
} from "./screens";

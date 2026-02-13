/**
 * usePagination.js
 * Custom hook for pagination
 * Manages displaying data in chunks to improve performance on Android
 *
 * Prevents rendering massive lists by showing only visible items + buffer
 */

import { useState, useCallback, useMemo } from "react";

/**
 * Manages pagination state and data chunking
 *
 * @param {Array} items - Full array of items to paginate
 * @param {number} initialPageSize - Items to load initially (default: 20)
 * @returns {Object} Pagination object with:
 *   - visibleItems: Array of currently visible items
 *   - pageSize: Current page size
 *   - totalPages: Total number of pages
 *   - currentPage: Current page number
 *   - loadMore: Function to load next page
 *   - reset: Function to reset pagination
 *   - hasMore: Boolean indicating if more items available
 *
 * Example:
 *   const {
 *     visibleItems,
 *     loadMore,
 *     hasMore,
 *   } = usePagination(users, 20);
 *
 *   <FlatList
 *     data={visibleItems}
 *     onEndReached={hasMore ? loadMore : null}
 *   />
 */
export function usePagination(items = [], initialPageSize = 20) {
  const [pageSize, setPageSize] = useState(initialPageSize);

  const visibleItems = useMemo(() => {
    return items.slice(0, pageSize);
  }, [items, pageSize]);

  const totalPages = useMemo(() => {
    return Math.ceil(items.length / initialPageSize);
  }, [items.length, initialPageSize]);

  const currentPage = useMemo(() => {
    return Math.ceil(pageSize / initialPageSize);
  }, [pageSize, initialPageSize]);

  const hasMore = useMemo(() => {
    return pageSize < items.length;
  }, [pageSize, items.length]);

  const loadMore = useCallback(() => {
    if (hasMore) {
      setPageSize((prev) => prev + initialPageSize);
    }
  }, [hasMore, initialPageSize]);

  const reset = useCallback(() => {
    setPageSize(initialPageSize);
  }, [initialPageSize]);

  return {
    visibleItems,
    pageSize,
    totalPages,
    currentPage,
    loadMore,
    reset,
    hasMore,
  };
}

export default usePagination;

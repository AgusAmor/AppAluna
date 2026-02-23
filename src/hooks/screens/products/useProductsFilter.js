import { useState, useMemo } from "react";

export const FAMILY_FILTERS = {
  ALL: "all",
  AENOR: "AENOR",
  CORE: "CORE",
};

export const PRICE_SORTS = {
  NONE: "none",
  ASC: "asc",
  DESC: "desc",
};

/**
 * useProductsFilter
 * Filters products by family and sorts by price
 * @param {Array} products - Products to filter
 * @returns {Object} Filtered products and filter controls
 */
export function useProductsFilter(products) {
  const [familyFilter, setFamilyFilter] = useState(FAMILY_FILTERS.ALL);
  const [priceSort, setPriceSort] = useState(PRICE_SORTS.NONE);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    if (!products) return [];

    let result = products;

    // Filter by family
    if (familyFilter !== FAMILY_FILTERS.ALL) {
      result = result.filter((product) => product.family === familyFilter);
    }

    // Sort by price (normal price)
    if (priceSort !== PRICE_SORTS.NONE) {
      result = [...result].sort((a, b) => {
        const priceA = parseFloat(a.pricing?.normal?.price) || 0;
        const priceB = parseFloat(b.pricing?.normal?.price) || 0;

        if (priceSort === PRICE_SORTS.ASC) {
          return priceA - priceB;
        } else {
          return priceB - priceA;
        }
      });
    }

    return result;
  }, [products, familyFilter, priceSort]);

  return {
    filteredProducts,
    familyFilter,
    setFamilyFilter,
    priceSort,
    setPriceSort,
  };
}

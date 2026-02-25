/**
 * Status Colors Utility
 * Maps order statuses to their badge colors for consistent styling across the app
 */

export const getStatusColor = (status) => {
  const colorMap = {
    pending: {
      backgroundColor: "#FEF08A", // yellow-100
      textColor: "#854D0E", // yellow-700
    },
    confirmed: {
      backgroundColor: "#DBEAFE", // blue-100
      textColor: "#1E40AF", // blue-700
    },
    printing: {
      backgroundColor: "#FED7AA", // orange-100
      textColor: "#B45309", // orange-700
    },
    dispatched: {
      backgroundColor: "#E9D5FF", // purple-100
      textColor: "#6B21A8", // purple-700
    },
    delivered: {
      backgroundColor: "#DCFCE7", // green-100
      textColor: "#15803D", // green-700
    },
    withdrawn: {
      backgroundColor: "#DCFCE7", // green-100
      textColor: "#15803D", // green-700
    },
    cancelled: {
      backgroundColor: "#FEE2E2", // red-100
      textColor: "#DC2626", // red-600
    },
  };

  return (
    colorMap[status] || {
      backgroundColor: "#F3F4F6", // gray-100
      textColor: "#374151", // gray-700
    }
  );
};

/**
 * Get status colors for a list of status values
 * Useful for creating color maps for Select components
 *
 * @param {string[]} statuses - Array of status values (e.g., ['pending', 'confirmed', 'delivered'])
 * @returns {object} Map of status to colors
 */
export const getStatusColorMap = (statuses = []) => {
  const map = {};
  statuses.forEach((status) => {
    map[status] = getStatusColor(status);
  });
  return map;
};

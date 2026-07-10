const DEPARTMENT_MAP = {
  ROAD: 'Road Maintenance',
  SANITATION: 'Sanitation',
  WATER_DRAINAGE: 'Water & Drainage',
  ELECTRICAL: 'Electrical',
};

export const departmentFromCategory = (category) =>
  DEPARTMENT_MAP[category] || category;

export const CATEGORIES = Object.keys(DEPARTMENT_MAP);
export const DEPARTMENTS = Object.values(DEPARTMENT_MAP);

// constants/api.ts
export const API_CONFIG = {
  DJANGO_BASE_URL: "https://fast-food-backend-yx5s.onrender.com/api",

  DJANGO_ENDPOINTS: {
    // Health
    HEALTH: "/health/",

    // Categories
    CATEGORIES: "/categories/",
    CATEGORY_CREATE: "/categories/create/",

    // Foods
    FOODS: "/foods/",
    FOOD_CREATE: "/foods/create/",
    FEATURED_FOODS: "/foods/featured/",
    SEARCH_FOODS: "/foods/search/",

    // Orders - COMPLETE SET
    ORDERS: "/orders/",
    ORDER_CREATE: "/orders/create/",
    ORDER_DETAILS: (id: string) => `/orders/${id}/`,
    ORDER_STATUS: (id: string) => `/orders/${id}/status/`,

    // Auth
    LOGIN: "/auth/login/",
    REGISTER: "/auth/register/",
    LOGOUT: "/auth/logout/",
    PROFILE: "/auth/profile/",

    // Utilities
    UPLOAD: "/upload/",
    SEED: "/seed-database/",
  },

  TIMEOUT: 15000,
} as const;

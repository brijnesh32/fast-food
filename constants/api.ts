// Only Django backend config
export const API_CONFIG = {
  DJANGO_BASE_URL: 'https://fast-food-backend-yx5s.onrender.com/api',
  DJANGO_ENDPOINTS: {
    HEALTH: '/health/',
    CATEGORIES: '/categories/',
    FOODS: '/foods/',
    FEATURED_FOODS: '/foods/featured/',
    SEARCH_FOODS: '/foods/search/',
    ORDERS: '/orders/',
    ORDER_CREATE: '/orders/create/',
  },
} as const;
import { API_CONFIG } from '@/constants/api';

// ========== DJANGO BACKEND SERVICE ==========
class DjangoApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_CONFIG.DJANGO_BASE_URL;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const config: RequestInit = {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      };

      if (options.body) {
        config.body = JSON.stringify(options.body);
      }

      console.log('🌐 Django API Call:', url);
      
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: T = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Django API Request failed:', error);
      throw error;
    }
  }

  async healthCheck() {
    return this.request<{ status: string; db: string }>(API_CONFIG.DJANGO_ENDPOINTS.HEALTH);
  }

  async getCategories() {
    return this.request<any[]>(API_CONFIG.DJANGO_ENDPOINTS.CATEGORIES);
  }

  async getFoods() {
    return this.request<any[]>(API_CONFIG.DJANGO_ENDPOINTS.FOODS);
  }

  async getFeaturedFoods() {
    return this.request<any[]>(API_CONFIG.DJANGO_ENDPOINTS.FEATURED_FOODS);
  }

  async searchFoods(query: string) {
    return this.request<any[]>(`${API_CONFIG.DJANGO_ENDPOINTS.SEARCH_FOODS}?q=${encodeURIComponent(query)}`);
  }

  async createOrder(orderData: any) {
    return this.request<{ id: string }>(API_CONFIG.DJANGO_ENDPOINTS.ORDER_CREATE, {
      method: 'POST',
      body: orderData,
    });
  }
}

export const djangoApi = new DjangoApiService();

// Simple database functions to replace Appwrite
export const getMenu = async ({ category, query, limit = 10 }: { category?: string; query?: string; limit?: number }) => {
  try {
    let foods = await djangoApi.getFoods();
    
    // Filter by category if provided
    if (category && category !== 'all') {
      foods = foods.filter(food => food.category?.id === category || food.category?._id === category);
    }
    
    // Filter by search query if provided
    if (query) {
      foods = foods.filter(food => 
        food.name.toLowerCase().includes(query.toLowerCase()) ||
        food.description.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    // Apply limit
    if (limit) {
      foods = foods.slice(0, limit);
    }
    
    return foods;
  } catch (error) {
    console.error('getMenu error:', error);
    return [];
  }
};

export const getCategories = async () => {
  try {
    return await djangoApi.getCategories();
  } catch (error) {
    console.error('getCategories error:', error);
    return [];
  }
};

export const createOrder = async (orderData: any) => {
  try {
    return await djangoApi.createOrder(orderData);
  } catch (error) {
    console.error('createOrder error:', error);
    throw error;
  }
};
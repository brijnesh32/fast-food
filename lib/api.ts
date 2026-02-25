import { API_CONFIG } from "@/constants/api";
import { Image } from "react-native";

// ========== DJANGO BACKEND SERVICE ==========
class DjangoApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_CONFIG.DJANGO_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const config: RequestInit = {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      };

      if (options.body && typeof options.body === "object") {
        config.body = JSON.stringify(options.body);
      }

      console.log("🌐 Django API Call:", url);

      const response = await fetch(url, config);

      // ✅ FIX: Read response body ONCE as text
      const responseText = await response.text();

      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        data = responseText;
      }

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}: ${response.statusText}. ${JSON.stringify(data)}`,
        );
      }

      return data as T;
    } catch (error) {
      console.error("❌ Django API Request failed:", error);
      throw error;
    }
  }

  // ========== HEALTH CHECK ==========
  async healthCheck() {
    return this.request<{ status: string; db: string }>(
      API_CONFIG.DJANGO_ENDPOINTS.HEALTH,
    );
  }

  // ========== CATEGORIES ==========
  async getCategories() {
    return this.request<any[]>(API_CONFIG.DJANGO_ENDPOINTS.CATEGORIES);
  }

  // ========== FOODS ==========
  async getFoods() {
    return this.request<any[]>(API_CONFIG.DJANGO_ENDPOINTS.FOODS);
  }

  async getFeaturedFoods() {
    return this.request<any[]>(API_CONFIG.DJANGO_ENDPOINTS.FEATURED_FOODS);
  }

  async searchFoods(query: string) {
    return this.request<any[]>(
      `${API_CONFIG.DJANGO_ENDPOINTS.SEARCH_FOODS}?q=${encodeURIComponent(query)}`,
    );
  }

  // ========== ORDERS ==========
  async createOrder(orderData: any) {
    return this.request<{ id: string }>(
      API_CONFIG.DJANGO_ENDPOINTS.ORDER_CREATE,
      {
        method: "POST",
        body: orderData,
      },
    );
  }

  async getMyOrders(token: string) {
    return this.request<any[]>("/orders/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async getOrderDetails(orderId: string, token: string) {
    return this.request<any>(`/orders/${orderId}/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // ========== DATABASE SEED ==========
  async seedDatabase() {
    return this.request("/api/seed-database/", {
      method: "POST",
    });
  }
}

export const djangoApi = new DjangoApiService();

// ========== CACHED API FUNCTIONS ==========
let cachedFoods: any[] | null = null;
let cachedCategories: any[] | null = null;
let allFoodsCache: any[] | null = null;

export const getMenu = async ({
  category,
  query,
  limit = 10,
}: {
  category?: string;
  query?: string;
  limit?: number;
}) => {
  try {
    console.log("📋 Fetching menu with params:", { category, query, limit });

    if (!allFoodsCache) {
      console.log("🔄 First time - fetching all foods from API");
      const foodsFromApi = await djangoApi.getFoods();

      allFoodsCache = foodsFromApi.map((food) => ({
        ...food,
        image_url: food.image || "",
        id: food.id || food._id,
      }));

      console.log("💾 Cached", allFoodsCache.length, "food items");
    }

    let foods = [...allFoodsCache];

    if (category && category !== "all") {
      foods = foods.filter((food) => food.category?.id === category);
    }

    if (query) {
      foods = foods.filter(
        (food) =>
          food.name?.toLowerCase().includes(query.toLowerCase()) ||
          food.description?.toLowerCase().includes(query.toLowerCase()),
      );
    }

    if (limit && foods.length > limit) {
      foods = foods.slice(0, limit);
    }

    return foods;
  } catch (error) {
    console.error("❌ getMenu error:", error);
    return getMockMenuData({ category, query, limit });
  }
};

export const clearFoodCache = () => {
  allFoodsCache = null;
  console.log("🗑️ Cleared food cache");
};

export const getCategories = async () => {
  try {
    if (cachedCategories) {
      return cachedCategories;
    }

    const categories = await djangoApi.getCategories();
    cachedCategories = categories;
    return categories;
  } catch (error) {
    console.error("❌ getCategories error:", error);
    return getMockCategories();
  }
};

export const clearCache = () => {
  cachedFoods = null;
  cachedCategories = null;
  allFoodsCache = null;
  console.log("🗑️ All caches cleared");
};

// ========== ORDER FUNCTIONS ==========
export const createOrder = async (orderData: any) => {
  try {
    return await djangoApi.createOrder(orderData);
  } catch (error) {
    console.error("createOrder error:", error);
    throw error;
  }
};

export const getMyOrders = async (token: string) => {
  try {
    return await djangoApi.getMyOrders(token);
  } catch (error) {
    console.error("getMyOrders error:", error);
    return [];
  }
};

export const getOrderDetails = async (orderId: string, token: string) => {
  try {
    return await djangoApi.getOrderDetails(orderId, token);
  } catch (error) {
    console.error("getOrderDetails error:", error);
    throw error;
  }
};

export const seedDatabase = async (token: string) => {
  try {
    console.log("🌱 Seeding database...");
    // ✅ FIXED: Remove extra /api from endpoint
    const result = await djangoApi.request("/seed-database/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("✅ Database seeded:", result);
    return result;
  } catch (error) {
    console.error("❌ Seed database error:", error);
    throw error;
  }
};

// ========== IMAGE PRELOADING ==========
export const preloadFoodImages = (items: any[], limit: number = 10) => {
  if (!items || items.length === 0) return;

  const urls = items
    .slice(0, limit)
    .map((item) => item.image_url || item.image)
    .filter((url) => url && typeof url === "string" && url.startsWith("http"));

  urls.forEach((url) => {
    Image.prefetch(url);
  });

  console.log(`🖼️ Preloaded ${urls.length} images`);
};

export const preloadImageBatch = (urls: string[]) => {
  const validUrls = urls.filter(
    (url) => url && typeof url === "string" && url.startsWith("http"),
  );
  validUrls.forEach((url) => Image.prefetch(url));
  console.log(`🖼️ Batch preloaded ${validUrls.length} images`);
};

// ========== MOCK DATA (FALLBACK) ==========
const getMockCategories = () => [
  { id: "1", name: "Burgers", slug: "burgers" },
  { id: "2", name: "Pizza", slug: "pizza" },
  { id: "3", name: "Drinks", slug: "drinks" },
  { id: "4", name: "Desserts", slug: "desserts" },
];

const getMockMenuData = ({
  category,
  query,
  limit,
}: {
  category?: string;
  query?: string;
  limit?: number;
}) => {
  const mockFoods = [
    {
      id: "1",
      name: "Classic Burger",
      price: 9.99,
      image: "https://via.placeholder.com/300x200/FF6B6B/white?text=Burger",
      image_url: "https://via.placeholder.com/300x200/FF6B6B/white?text=Burger",
      description: "Juicy beef burger with fresh vegetables",
      category: { id: "1", name: "Burgers" },
    },
    {
      id: "2",
      name: "Pepperoni Pizza",
      price: 12.99,
      image: "https://via.placeholder.com/300x200/4ECDC4/white?text=Pizza",
      image_url: "https://via.placeholder.com/300x200/4ECDC4/white?text=Pizza",
      description: "Classic pizza with pepperoni and cheese",
      category: { id: "2", name: "Pizza" },
    },
    {
      id: "3",
      name: "Cola",
      price: 2.99,
      image: "https://via.placeholder.com/300x200/45B7D1/white?text=Drink",
      image_url: "https://via.placeholder.com/300x200/45B7D1/white?text=Drink",
      description: "Refreshing cola drink",
      category: { id: "3", name: "Drinks" },
    },
    {
      id: "4",
      name: "Chocolate Cake",
      price: 5.99,
      image: "https://via.placeholder.com/300x200/96CEB4/white?text=Dessert",
      image_url:
        "https://via.placeholder.com/300x200/96CEB4/white?text=Dessert",
      description: "Rich chocolate cake",
      category: { id: "4", name: "Desserts" },
    },
  ];

  let foods = [...mockFoods];

  if (category && category !== "all") {
    foods = foods.filter((food) => food.category.id === category);
  }

  if (query) {
    foods = foods.filter(
      (food) =>
        food.name.toLowerCase().includes(query.toLowerCase()) ||
        food.description.toLowerCase().includes(query.toLowerCase()),
    );
  }

  if (limit) {
    foods = foods.slice(0, limit);
  }

  return foods;
};

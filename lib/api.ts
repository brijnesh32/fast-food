import { API_CONFIG } from "@/constants/api";

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

      if (!response.ok) {
        // Clone the response before reading it for error details
        const errorResponse = response.clone();
        let errorDetails = "";
        try {
          const errorData = await errorResponse.json();
          errorDetails = JSON.stringify(errorData);
        } catch {
          errorDetails = await errorResponse.text();
        }

        throw new Error(
          `HTTP ${response.status}: ${response.statusText}. ${errorDetails}`,
        );
      }

      const data: T = await response.json();
      return data;
    } catch (error) {
      console.error("❌ Django API Request failed:", error);
      throw error;
    }
  }

  async healthCheck() {
    return this.request<{ status: string; db: string }>(
      API_CONFIG.DJANGO_ENDPOINTS.HEALTH,
    );
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
    return this.request<any[]>(
      `${API_CONFIG.DJANGO_ENDPOINTS.SEARCH_FOODS}?q=${encodeURIComponent(query)}`,
    );
  }

  async createOrder(orderData: any) {
    return this.request<{ id: string }>(
      API_CONFIG.DJANGO_ENDPOINTS.ORDER_CREATE,
      {
        method: "POST",
        body: orderData,
      },
    );
  }
}

export const djangoApi = new DjangoApiService();

// Enhanced database functions with better error handling and caching
let cachedFoods: any[] | null = null;
let cachedCategories: any[] | null = null;
// Add cache at the top of your file
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

    // 🎯 FETCH ALL FOODS ONLY ONCE
    if (!allFoodsCache) {
      console.log("🔄 First time - fetching all foods from API");
      const foodsFromApi = await djangoApi.getFoods();

      // Map fields once
      allFoodsCache = foodsFromApi.map((food) => ({
        ...food,
        image_url: food.image || "", // Create image_url from image
        id: food.id || food._id, // Ensure id field exists
      }));

      console.log("💾 Cached", allFoodsCache.length, "food items");
    }

    // Start with cached data
    let foods = [...allFoodsCache];

    console.log("🔍 Applying filters to", foods.length, "cached items");

    // Filter by category if provided
    if (category && category !== "all") {
      foods = foods.filter((food) => food.category?.id === category);
      console.log(
        `🎯 Filtered by category ${category}:`,
        foods.length,
        "items",
      );
    }

    // Filter by search query if provided
    if (query) {
      foods = foods.filter(
        (food) =>
          food.name?.toLowerCase().includes(query.toLowerCase()) ||
          food.description?.toLowerCase().includes(query.toLowerCase()),
      );
      console.log(`🔍 Filtered by search "${query}":`, foods.length, "items");
    }

    // Apply limit
    if (limit && foods.length > limit) {
      foods = foods.slice(0, limit);
    }

    console.log("✅ Final menu items:", foods.length);
    return foods;
  } catch (error) {
    console.error("❌ getMenu error:", error);
    return getMockMenuData({ category, query, limit });
  }
};

// Add function to clear cache if needed
export const clearFoodCache = () => {
  allFoodsCache = null;
  console.log("🗑️ Cleared food cache");
};

export const getCategories = async () => {
  try {
    console.log("📂 Fetching categories...");

    // Use cached data if available, otherwise fetch
    if (cachedCategories) {
      console.log("✅ Using cached categories");
      return cachedCategories;
    }

    const categories = await djangoApi.getCategories();
    cachedCategories = categories; // Cache the result
    console.log("✅ Categories data:", categories);
    return categories;
  } catch (error) {
    console.error("❌ getCategories error:", error);
    // Return mock categories for development
    return getMockCategories();
  }
};

// Clear cache function (optional)
export const clearCache = () => {
  cachedFoods = null;
  cachedCategories = null;
};

// Mock data for development when backend is down
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
      image_url: "https://via.placeholder.com/300x200/FF6B6B/white?text=Burger", // Added for consistency
      description: "Juicy beef burger with fresh vegetables",
      category: { id: "1", name: "Burgers" },
    },
    {
      id: "2",
      name: "Pepperoni Pizza",
      price: 12.99,
      image: "https://via.placeholder.com/300x200/4ECDC4/white?text=Pizza",
      image_url: "https://via.placeholder.com/300x200/4ECDC4/white?text=Pizza", // Added for consistency
      description: "Classic pizza with pepperoni and cheese",
      category: { id: "2", name: "Pizza" },
    },
    {
      id: "3",
      name: "Cola",
      price: 2.99,
      image: "https://via.placeholder.com/300x200/45B7D1/white?text=Drink",
      image_url: "https://via.placeholder.com/300x200/45B7D1/white?text=Drink", // Added for consistency
      description: "Refreshing cola drink",
      category: { id: "3", name: "Drinks" },
    },
    {
      id: "4",
      name: "Chocolate Cake",
      price: 5.99,
      image: "https://via.placeholder.com/300x200/96CEB4/white?text=Dessert",
      image_url:
        "https://via.placeholder.com/300x200/96CEB4/white?text=Dessert", // Added for consistency
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

export const createOrder = async (orderData: any) => {
  try {
    return await djangoApi.createOrder(orderData);
  } catch (error) {
    console.error("createOrder error:", error);
    throw error;
  }
};
// Add this to your lib/api.ts
export const seedDatabase = async () => {
  try {
    console.log("🌱 Seeding database...");
    const result = await djangoApi.request("/api/seed-database/", {
      method: "POST",
    });
    console.log("✅ Database seeded:", result);
    return result;
  } catch (error) {
    console.error("❌ Seed database error:", error);
    throw error;
  }
};
// Add this at the bottom of lib/api.ts
import { Image } from "react-native";

// Image preloading helper
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

// Batch preload for multiple items
export const preloadImageBatch = (urls: string[]) => {
  const validUrls = urls.filter(
    (url) => url && typeof url === "string" && url.startsWith("http"),
  );
  validUrls.forEach((url) => Image.prefetch(url));
  console.log(`🖼️ Batch preloaded ${validUrls.length} images`);
};

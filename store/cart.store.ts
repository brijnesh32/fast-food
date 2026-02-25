// store/cart.store.ts - Updated with restaurant support
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import useAuthStore from "./auth.store";

export interface CartItemType {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image_url?: string;
  customizations?: string[];
}

interface CartState {
  items: CartItemType[];

  // Actions
  addItem: (item: Omit<CartItemType, "quantity">, quantity?: number) => void;
  removeItem: (id: string, customizations?: string[]) => void;
  increaseQty: (id: string, customizations?: string[]) => void;
  decreaseQty: (id: string, customizations?: string[]) => void;
  updateQuantity: (
    id: string,
    quantity: number,
    customizations?: string[],
  ) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getItems: () => CartItemType[];

  // Order creation with restaurant support
  createOrder: (deliveryDetails: {
    phone: string;
    address?: string;
    paymentMethod: string;
    deliveryOption?: string;
    // ✅ Add these for dine-in
    restaurantName?: string;
    restaurantAddress?: string;
    pincode?: string;
  }) => Promise<{ ok: boolean; orderId?: string; message?: string }>;
}

const API_BASE_URL = "https://fast-food-backend-yx5s.onrender.com/api";

const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find(
            (i) =>
              i.id === item.id &&
              JSON.stringify(i.customizations) ===
                JSON.stringify(item.customizations),
          );

          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.id === item.id &&
                JSON.stringify(i.customizations) ===
                  JSON.stringify(item.customizations)
                  ? { ...i, quantity: i.quantity + quantity }
                  : i,
              ),
            };
          } else {
            return {
              items: [...state.items, { ...item, quantity }],
            };
          }
        });
      },

      removeItem: (id, customizations = []) => {
        set((state) => ({
          items: state.items.filter(
            (i) =>
              !(
                i.id === id &&
                JSON.stringify(i.customizations) ===
                  JSON.stringify(customizations)
              ),
          ),
        }));
      },

      increaseQty: (id, customizations = []) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id &&
            JSON.stringify(i.customizations) === JSON.stringify(customizations)
              ? { ...i, quantity: i.quantity + 1 }
              : i,
          ),
        }));
      },

      decreaseQty: (id, customizations = []) => {
        set((state) => {
          const item = state.items.find(
            (i) =>
              i.id === id &&
              JSON.stringify(i.customizations) ===
                JSON.stringify(customizations),
          );

          if (!item) return state;

          if (item.quantity > 1) {
            return {
              items: state.items.map((i) =>
                i.id === id &&
                JSON.stringify(i.customizations) ===
                  JSON.stringify(customizations)
                  ? { ...i, quantity: i.quantity - 1 }
                  : i,
              ),
            };
          } else {
            return {
              items: state.items.filter(
                (i) =>
                  !(
                    i.id === id &&
                    JSON.stringify(i.customizations) ===
                      JSON.stringify(customizations)
                  ),
              ),
            };
          }
        });
      },

      updateQuantity: (id, quantity, customizations = []) => {
        if (quantity < 1) {
          get().removeItem(id, customizations);
          return;
        }

        set((state) => ({
          items: state.items.map((i) =>
            i.id === id &&
            JSON.stringify(i.customizations) === JSON.stringify(customizations)
              ? { ...i, quantity }
              : i,
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0,
        );
      },

      getItems: () => {
        return get().items;
      },

      // ✅ UPDATED: Create order with restaurant support
      createOrder: async (deliveryDetails) => {
        const { items, getTotalPrice } = get();
        const { user, token } = useAuthStore.getState();

        // Validation
        if (!user || !token) {
          return { ok: false, message: "Please login first" };
        }

        if (items.length === 0) {
          return { ok: false, message: "Cart is empty" };
        }

        if (!deliveryDetails.phone) {
          return { ok: false, message: "Phone number is required" };
        }

        try {
          // Prepare base order data
          const orderData: any = {
            user_email: user.email,
            user_name: user.name,
            user_phone: deliveryDetails.phone,
            items: items.map((item) => ({
              food_id: item.id,
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              customizations: item.customizations || [],
            })),
            total: getTotalPrice(),
            address: deliveryDetails.address || "",
            payment_method: deliveryDetails.paymentMethod || "cod",
            delivery_option: deliveryDetails.deliveryOption || "delivery",
          };

          // ✅ Add restaurant details for dine-in orders
          if (deliveryDetails.deliveryOption === "dine-in") {
            orderData.restaurant_name = deliveryDetails.restaurantName || "";
            orderData.restaurant_address =
              deliveryDetails.restaurantAddress || "";
            orderData.pincode = deliveryDetails.pincode || "";
          }

          console.log("📦 Creating order:", orderData);

          // API call
          const response = await fetch(`${API_BASE_URL}/orders/create/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(orderData),
          });

          const data = await response.json();

          if (response.ok) {
            // Clear cart on success
            get().clearCart();
            console.log("✅ Order created:", data.id);
            return { ok: true, orderId: data.id || data.order_id };
          }

          console.log("❌ Order failed:", data);
          return {
            ok: false,
            message: data.message || "Failed to create order",
          };
        } catch (error: any) {
          console.error("❌ Order error:", error);
          return {
            ok: false,
            message: error.message || "Network error. Please try again.",
          };
        }
      },
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export default useCartStore;

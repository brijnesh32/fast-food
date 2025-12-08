// store/cart.store.ts - WORKING VERSION
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

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
  addItem: (item: Omit<CartItemType, 'quantity'>, quantity?: number) => void;
  removeItem: (id: string, customizations?: string[]) => void;
  increaseQty: (id: string, customizations?: string[]) => void;
  decreaseQty: (id: string, customizations?: string[]) => void;
  updateQuantity: (id: string, quantity: number, customizations?: string[]) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getItems: () => CartItemType[];
}

const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find(i => 
            i.id === item.id && 
            JSON.stringify(i.customizations) === JSON.stringify(item.customizations)
          );
          
          if (existingItem) {
            return {
              items: state.items.map(i => 
                i.id === item.id && JSON.stringify(i.customizations) === JSON.stringify(item.customizations)
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              )
            };
          } else {
            return {
              items: [...state.items, { ...item, quantity }]
            };
          }
        });
      },

      removeItem: (id, customizations = []) => {
        set((state) => ({
          items: state.items.filter(i => 
            !(i.id === id && JSON.stringify(i.customizations) === JSON.stringify(customizations))
          )
        }));
      },

      increaseQty: (id, customizations = []) => {
        set((state) => ({
          items: state.items.map(i => 
            i.id === id && JSON.stringify(i.customizations) === JSON.stringify(customizations)
              ? { ...i, quantity: i.quantity + 1 }
              : i
          )
        }));
      },

      decreaseQty: (id, customizations = []) => {
        set((state) => {
          const item = state.items.find(i => 
            i.id === id && JSON.stringify(i.customizations) === JSON.stringify(customizations)
          );
          
          if (!item) return state;
          
          if (item.quantity > 1) {
            return {
              items: state.items.map(i => 
                i.id === id && JSON.stringify(i.customizations) === JSON.stringify(customizations)
                  ? { ...i, quantity: i.quantity - 1 }
                  : i
              )
            };
          } else {
            return {
              items: state.items.filter(i => 
                !(i.id === id && JSON.stringify(i.customizations) === JSON.stringify(customizations))
              )
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
          items: state.items.map(i => 
            i.id === id && JSON.stringify(i.customizations) === JSON.stringify(customizations)
              ? { ...i, quantity }
              : i
          )
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      },

      getItems: () => {
        return get().items;
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useCartStore; // ✅ Default export
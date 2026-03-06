// app/(tabs)/order-history.tsx – Fixed price display
import CustomHeader from "@/components/CustomHeader";
import { getMyOrders } from "@/lib/api";
import useAuthStore from "@/store/auth.store";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Define order status types
type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "on-the-way"
  | "delivered"
  | "cancelled"
  | "completed";

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface Order {
  id: string;
  order_number?: string;
  orderId: string;
  status: OrderStatus;
  orderDate: string;
  orderTime: string;
  deliveryOption: "delivery" | "dine-in" | "takeaway";
  totalAmount: number;
  items: OrderItem[];
  restaurantName: string;
  rating?: number;
  created_at?: string;
  delivery_address?: string;
  user_phone?: string;
}

const OrderHistory = () => {
  const router = useRouter();
  const { user, token } = useAuthStore();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch orders from backend
  const fetchOrders = async () => {
    try {
      if (token) {
        const response = await getMyOrders(token);
        console.log("✅ Real orders fetched:", response?.length || 0);

        // Transform API response to match our Order interface
        const transformedOrders = (response || []).map((order: any) => ({
          id: order.id,
          orderId: order.order_number || `#ORD-${order.id}`,
          status: order.status || "pending",
          orderDate: new Date(order.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          orderTime: new Date(order.created_at).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          deliveryOption: order.delivery_option || "delivery",
          // ✅ FIX: Ensure price is treated as number and properly formatted
          totalAmount:
            typeof order.total_amount === "number"
              ? order.total_amount
              : parseFloat(order.total_amount) || 0,
          items: (order.items || []).map((item: any) => ({
            ...item,
            price:
              typeof item.price === "number"
                ? item.price
                : parseFloat(item.price) || 0,
          })),
          restaurantName: order.restaurant_name || "Restaurant",
          rating: order.rating || null,
          delivery_address: order.delivery_address,
          user_phone: order.user_phone,
        }));

        setOrders(transformedOrders);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.log("❌ Error fetching orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchOrders();
  }, [token]);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (token) {
        fetchOrders();
      }
    }, [token]),
  );

  // Pull to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders();
  }, []);

  // Filter orders to show only delivered, completed, and cancelled
  const filteredOrders = orders.filter((order) =>
    ["delivered", "completed", "cancelled"].includes(order.status),
  );

  // ✅ FIX: Ensure price is properly formatted
  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return isNaN(numPrice) ? "₹0.00" : `₹${numPrice.toFixed(2)}`;
  };

  const getStatusColor = (status: OrderStatus) => {
    const colors = {
      pending: "bg-yellow-100",
      confirmed: "bg-blue-100",
      preparing: "bg-purple-100",
      ready: "bg-indigo-100",
      "on-the-way": "bg-orange-100",
      delivered: "bg-green-100",
      cancelled: "bg-red-100",
      completed: "bg-gray-100",
    };
    return colors[status] || "bg-gray-100";
  };

  const getStatusTextColor = (status: OrderStatus) => {
    const colors = {
      pending: "text-yellow-800",
      confirmed: "text-blue-800",
      preparing: "text-purple-800",
      ready: "text-indigo-800",
      "on-the-way": "text-orange-800",
      delivered: "text-green-800",
      cancelled: "text-red-800",
      completed: "text-gray-800",
    };
    return colors[status] || "text-gray-800";
  };

  const getStatusDisplayText = (status: OrderStatus) => {
    const texts = {
      pending: "Pending",
      confirmed: "Confirmed",
      preparing: "Preparing",
      ready: "Ready",
      "on-the-way": "On the Way",
      delivered: "Delivered",
      cancelled: "Cancelled",
      completed: "Completed",
    };
    return texts[status] || "Unknown";
  };

  const handleViewOrderDetails = (order: Order) => {
    router.push({
      pathname: "/(tabs)/view-order",
      params: {
        orderId: order.id,
        status: order.status,
        total: order.totalAmount.toString(),
        deliveryOption: order.deliveryOption,
        restaurantName: order.restaurantName,
        address: order.delivery_address || "Address not available",
        phone: order.user_phone || user?.phone || "+91 98765 43210",
        items: JSON.stringify(order.items),
      },
    });
  };

  const handleReorder = (order: Order) => {
    router.push({
      pathname: "/(tabs)/cart",
      params: { reorder: order.id },
    });
  };

  const handleRateOrder = (order: Order) => {
    console.log("Rate order:", order.id);
    // TODO: Implement rating modal
  };

  const getDeliveryIcon = (option: string) => {
    switch (option) {
      case "delivery":
        return "truck";
      case "dine-in":
        return "users";
      default:
        return "package";
    }
  };

  const renderOrderItem = ({ item }: { item: Order }) => {
    return (
      <TouchableOpacity
        onPress={() => handleViewOrderDetails(item)}
        className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100 active:opacity-80"
        activeOpacity={0.7}
      >
        {/* Header with restaurant name, date and status */}
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1 pr-3">
            <Text className="text-xl font-bold text-gray-900">
              {item.restaurantName}
            </Text>
            <View className="flex-row items-center mt-1">
              <Feather name="calendar" size={14} color="#9CA3AF" />
              <Text className="text-gray-500 text-sm ml-1">
                {item.orderDate} • {item.orderTime}
              </Text>
            </View>
            <View className="flex-row items-center mt-1">
              <Feather
                name={getDeliveryIcon(item.deliveryOption)}
                size={14}
                color="#9CA3AF"
              />
              <Text className="text-gray-500 text-sm ml-1">
                {item.orderId} •{" "}
                {item.deliveryOption === "delivery"
                  ? "Delivery"
                  : item.deliveryOption === "dine-in"
                    ? "Dine‑in"
                    : "Takeaway"}
              </Text>
            </View>
          </View>
          <View
            className={`px-3 py-1.5 rounded-full ${getStatusColor(item.status)}`}
          >
            <Text
              className={`text-xs font-semibold ${getStatusTextColor(item.status)}`}
            >
              {getStatusDisplayText(item.status)}
            </Text>
          </View>
        </View>

        {/* Order Items Summary */}
        <View className="mb-4">
          <Text className="text-gray-700 font-medium mb-2">Items</Text>
          <View className="space-y-1">
            {item.items.slice(0, 2).map((foodItem, index) => (
              <View key={index} className="flex-row justify-between">
                <Text className="text-gray-600 flex-1">
                  {foodItem.name} ×{foodItem.quantity}
                </Text>
                <Text className="text-gray-900 font-medium">
                  {formatPrice(foodItem.price * foodItem.quantity)}
                </Text>
              </View>
            ))}
            {item.items.length > 2 && (
              <Text className="text-gray-500 text-sm">
                +{item.items.length - 2} more item
                {item.items.length - 2 > 1 ? "s" : ""}
              </Text>
            )}
          </View>
        </View>

        {/* Footer with total and actions */}
        <View className="flex-row justify-between items-center pt-4 border-t border-gray-200">
          <View>
            <Text className="text-gray-500 text-xs uppercase">Total</Text>
            <Text className="text-2xl font-bold text-primary">
              {formatPrice(item.totalAmount)}
            </Text>
          </View>

          <View className="flex-row gap-2">
            {item.status === "delivered" && !item.rating && (
              <TouchableOpacity
                onPress={() => handleRateOrder(item)}
                className="px-4 py-2 bg-yellow-50 rounded-xl border border-yellow-200"
              >
                <Text className="text-yellow-700 font-medium text-sm">
                  Rate
                </Text>
              </TouchableOpacity>
            )}

            {item.status === "delivered" && (
              <TouchableOpacity
                onPress={() => handleReorder(item)}
                className="px-4 py-2 bg-primary/10 rounded-xl border border-primary/20"
              >
                <Text className="text-primary font-medium text-sm">
                  Reorder
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() => handleViewOrderDetails(item)}
              className="px-4 py-2 bg-gray-100 rounded-xl"
            >
              <Text className="text-gray-700 font-medium text-sm">Details</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Rating Display (if already rated) */}
        {item.rating && (
          <View className="flex-row items-center mt-4 pt-4 border-t border-gray-100">
            <Feather name="star" size={16} color="#F59E0B" />
            <Text className="text-gray-700 ml-1 font-medium">
              {item.rating.toFixed(1)}
            </Text>
            <Text className="text-gray-400 text-xs ml-2">
              You rated this order
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <CustomHeader title="Order History" />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#FE8C00" />
          <Text className="mt-4 text-gray-500 font-medium">
            Loading your orders...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <CustomHeader title="Order History" />

      <FlatList
        data={filteredOrders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        contentContainerClassName="px-5 pb-8 pt-2"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FE8C00"
          />
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-20 px-6">
            <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center mb-6">
              <Feather name="archive" size={40} color="#D1D5DB" />
            </View>
            <Text className="text-xl font-bold text-gray-900 mb-2">
              No orders yet
            </Text>
            <Text className="text-gray-500 text-center mb-8">
              When you have delivered, completed, or cancelled orders, they will
              appear here.
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/search")}
              className="bg-primary px-8 py-4 rounded-xl shadow-md"
            >
              <Text className="text-white font-semibold text-lg">
                Browse Menu
              </Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default OrderHistory;

// app/(tabs)/order-history.tsx
import CustomHeader from "@/components/CustomHeader";
import { images } from "@/constants";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Define order status types
type OrderStatus =
  | "pending"
  | "preparing"
  | "on-the-way"
  | "delivered"
  | "cancelled";

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface Order {
  id: string;
  orderId: string;
  status: OrderStatus;
  orderDate: string;
  orderTime: string;
  deliveryOption: "delivery" | "dine-in";
  totalAmount: number;
  items: OrderItem[];
  restaurantName: string;
  restaurantImage?: string;
  rating?: number;
}

const OrderHistory = () => {
  const router = useRouter();

  // Mock order history data - in real app, fetch from API
  const [orders, setOrders] = useState<Order[]>([
    {
      id: "1",
      orderId: "#ORD-123456",
      status: "delivered",
      orderDate: "Today",
      orderTime: "10:30 AM",
      deliveryOption: "delivery",
      totalAmount: 45.99,
      restaurantName: "Pizza Palace",
      restaurantImage: images.pizzaOne,
      rating: 4.5,
      items: [
        { id: "1", name: "Margherita Pizza", quantity: 2, price: 12.99 },
        { id: "2", name: "Garlic Bread", quantity: 1, price: 5.99 },
      ],
    },
    {
      id: "2",
      orderId: "#ORD-123455",
      status: "delivered",
      orderDate: "Yesterday",
      orderTime: "7:45 PM",
      deliveryOption: "delivery",
      totalAmount: 28.5,
      restaurantName: "Burger King",
      restaurantImage: images.burgerOne,
      rating: 4.2,
      items: [
        { id: "3", name: "Classic Burger", quantity: 1, price: 14.99 },
        { id: "4", name: "Fries", quantity: 1, price: 3.99 },
      ],
    },
    {
      id: "3",
      orderId: "#ORD-123454",
      status: "delivered",
      orderDate: "Dec 24, 2024",
      orderTime: "1:30 PM",
      deliveryOption: "dine-in",
      totalAmount: 35.75,
      restaurantName: "Spice Garden",
      restaurantImage: images.buritto,
      rating: 4.8,
      items: [
        { id: "5", name: "Chicken Biryani", quantity: 2, price: 16.99 },
        { id: "6", name: "Naan", quantity: 2, price: 3.99 },
      ],
    },
    {
      id: "4",
      orderId: "#ORD-123453",
      status: "cancelled",
      orderDate: "Dec 22, 2024",
      orderTime: "8:15 PM",
      deliveryOption: "delivery",
      totalAmount: 22.49,
      restaurantName: "Healthy Bites",
      restaurantImage: images.salad,
      items: [
        { id: "7", name: "Caesar Salad", quantity: 1, price: 12.99 },
        { id: "8", name: "Garlic Bread", quantity: 1, price: 5.99 },
      ],
    },
    {
      id: "5",
      orderId: "#ORD-123452",
      status: "delivered",
      orderDate: "Dec 20, 2024",
      orderTime: "12:00 PM",
      deliveryOption: "delivery",
      totalAmount: 18.99,
      restaurantName: "Taco Bell",
      restaurantImage: images.buritto,
      rating: 4.0,
      items: [
        { id: "9", name: "Crunchwrap Supreme", quantity: 1, price: 8.99 },
        { id: "10", name: "Tacos", quantity: 2, price: 5.0 },
      ],
    },
  ]);

  const [filter, setFilter] = useState<"all" | "delivered" | "cancelled">(
    "all",
  );

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "delivered":
        return "bg-green-100";
      case "cancelled":
        return "bg-red-100";
      case "pending":
        return "bg-yellow-100";
      case "preparing":
        return "bg-blue-100";
      case "on-the-way":
        return "bg-purple-100";
      default:
        return "bg-gray-100";
    }
  };

  const getStatusTextColor = (status: OrderStatus) => {
    switch (status) {
      case "delivered":
        return "text-green-800";
      case "cancelled":
        return "text-red-800";
      case "pending":
        return "text-yellow-800";
      case "preparing":
        return "text-blue-800";
      case "on-the-way":
        return "text-purple-800";
      default:
        return "text-gray-800";
    }
  };

  const getStatusDisplayText = (status: OrderStatus) => {
    switch (status) {
      case "delivered":
        return "Delivered";
      case "cancelled":
        return "Cancelled";
      case "pending":
        return "Pending";
      case "preparing":
        return "Preparing";
      case "on-the-way":
        return "On the Way";
      default:
        return "Unknown";
    }
  };

  // FIXED: Navigate to view-order instead of order-details
  const handleViewOrderDetails = (order: Order) => {
    router.push({
      pathname: "/(tabs)/view-order",
      params: {
        orderId: order.id,
        status: order.status,
        total: order.totalAmount.toString(),
        deliveryOption: order.deliveryOption,
        restaurantName: order.restaurantName,
        address: "123 Main St, City Center",
        phone: "+1 (555) 123-4567",
      },
    });
  };

  const handleReorder = (order: Order) => {
    // In real app, this would add items to cart
    router.push({
      pathname: "/(tabs)/cart",
      params: {
        reorder: order.id,
      },
    });
  };

  const handleRateOrder = (order: Order) => {
    // In real app, this would open rating modal
    console.log("Rate order:", order.id);
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === "all") return true;
    return order.status === filter;
  });

  const renderOrderItem = ({ item }: { item: Order }) => {
    const itemCount = item.items.reduce((sum, i) => sum + i.quantity, 0);

    return (
      <TouchableOpacity
        onPress={() => handleViewOrderDetails(item)}
        className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100"
        activeOpacity={0.7}
      >
        {/* Restaurant Header */}
        <View className="flex-row items-center mb-4">
          {/* Restaurant Image */}
          <View className="w-16 h-16 rounded-2xl bg-gray-100 overflow-hidden mr-4">
            {item.restaurantImage ? (
              <Image
                source={item.restaurantImage}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <View className="w-full h-full items-center justify-center">
                <Text className="text-2xl">🍽️</Text>
              </View>
            )}
          </View>

          {/* Restaurant Info */}
          <View className="flex-1">
            <Text className="text-lg font-bold text-gray-900">
              {item.restaurantName}
            </Text>
            <View className="flex-row items-center mt-1">
              <Text className="text-gray-500 text-sm">
                {item.orderDate} • {item.orderTime}
              </Text>
            </View>
            <View className="flex-row items-center mt-1">
              <Text className="text-gray-500 text-sm">
                {item.orderId} •{" "}
                {item.deliveryOption === "delivery" ? "Delivery" : "Dine-in"}
              </Text>
            </View>
          </View>

          {/* Status Badge - Icons removed, only text */}
          <View
            className={`px-3 py-1 rounded-full ${getStatusColor(item.status)}`}
          >
            <Text
              className={`text-xs font-semibold ${getStatusTextColor(item.status)}`}
            >
              {getStatusDisplayText(item.status)}
            </Text>
          </View>
        </View>

        {/* Order Summary */}
        <View className="mb-4">
          <Text className="text-gray-700 font-medium mb-2">Items:</Text>
          <View className="space-y-1">
            {item.items.slice(0, 2).map((foodItem) => (
              <View key={foodItem.id} className="flex-row justify-between">
                <Text className="text-gray-600">
                  {foodItem.name} ×{foodItem.quantity}
                </Text>
                <Text className="text-gray-900 font-medium">
                  ${(foodItem.price * foodItem.quantity).toFixed(2)}
                </Text>
              </View>
            ))}
            {item.items.length > 2 && (
              <Text className="text-gray-500 text-sm">
                +{item.items.length - 2} more items
              </Text>
            )}
          </View>
        </View>

        {/* Order Footer */}
        <View className="flex-row justify-between items-center pt-4 border-t border-gray-100">
          <View>
            <Text className="text-gray-600 text-sm">Total Amount</Text>
            <Text className="text-xl font-bold text-primary">
              ${item.totalAmount.toFixed(2)}
            </Text>
          </View>

          <View className="flex-row gap-2">
            {item.status === "delivered" && !item.rating && (
              <TouchableOpacity
                onPress={() => handleRateOrder(item)}
                className="px-4 py-2 bg-yellow-50 rounded-lg"
              >
                <Text className="text-yellow-600 font-medium text-sm">
                  Rate
                </Text>
              </TouchableOpacity>
            )}

            {item.status === "delivered" && (
              <TouchableOpacity
                onPress={() => handleReorder(item)}
                className="px-4 py-2 bg-primary/10 rounded-lg"
              >
                <Text className="text-primary font-medium text-sm">
                  Reorder
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() => handleViewOrderDetails(item)}
              className="px-4 py-2 bg-gray-100 rounded-lg"
            >
              <Text className="text-gray-700 font-medium text-sm">Details</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Rating Display (if already rated) */}
        {item.rating && (
          <View className="flex-row items-center mt-3 pt-3 border-t border-gray-100">
            <Text className="text-yellow-500 text-lg">★</Text>
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

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header with CustomHeader */}
      <CustomHeader title="Order History" />

      {/* Filter Tabs */}
      <View className="px-5 pt-4 pb-2 bg-white border-b border-gray-200">
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={() => setFilter("all")}
            className={`px-4 py-2 rounded-full ${filter === "all" ? "bg-primary" : "bg-gray-100"}`}
          >
            <Text
              className={`font-medium ${filter === "all" ? "text-white" : "text-gray-700"}`}
            >
              All Orders
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFilter("delivered")}
            className={`px-4 py-2 rounded-full ${filter === "delivered" ? "bg-primary" : "bg-gray-100"}`}
          >
            <Text
              className={`font-medium ${filter === "delivered" ? "text-white" : "text-gray-700"}`}
            >
              Delivered
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFilter("cancelled")}
            className={`px-4 py-2 rounded-full ${filter === "cancelled" ? "bg-primary" : "bg-gray-100"}`}
          >
            <Text
              className={`font-medium ${filter === "cancelled" ? "text-white" : "text-gray-700"}`}
            >
              Cancelled
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        contentContainerClassName="p-5"
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <Text className="text-6xl mb-4">📭</Text>
            <Text className="text-xl font-semibold text-gray-900 mb-2">
              No orders found
            </Text>
            <Text className="text-gray-500 text-center mb-6">
              {filter === "all"
                ? "You haven't placed any orders yet."
                : filter === "delivered"
                  ? "No delivered orders yet."
                  : "No cancelled orders."}
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/search")}
              className="bg-primary px-6 py-3 rounded-xl"
            >
              <Text className="text-white font-semibold">Browse Menu</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default OrderHistory;

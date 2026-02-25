// app/(tabs)/view-order.tsx – with real‑time status updates
import CustomHeader from "@/components/CustomHeader";
import { getOrderDetails } from "@/lib/api";
import useAuthStore from "@/store/auth.store";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
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
  customizations?: string[];
}

interface OrderDetails {
  id: string;
  order_number?: string;
  orderId: string;
  status: OrderStatus;
  orderDate: string;
  deliveryTime: string;
  deliveryOption: "delivery" | "dine-in";
  totalAmount: number;
  items: OrderItem[];
  deliveryAddress?: string;
  restaurantAddress?: string;
  restaurantName?: string;
  phoneNumber: string;
  paymentMethod: string;
  created_at?: string;
  pincode?: string;
}

const ViewOrder = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user, token } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);

  const fetchOrderDetails = useCallback(async () => {
    if (!params.orderId || !token) return;
    try {
      const response = await getOrderDetails(params.orderId as string, token);
      console.log("✅ Real order details fetched:", response);

      // Transform API response
      const transformedOrder: OrderDetails = {
        id: response.id,
        orderId: response.order_number || `#${params.orderId}`,
        status: response.status || "pending",
        orderDate: new Date(response.created_at).toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        deliveryTime:
          response.delivery_option === "delivery"
            ? "30-45 min"
            : "15-20 min preparation",
        deliveryOption: response.delivery_option || "delivery",
        totalAmount: response.total_amount || 0,
        items: response.items || [],
        deliveryAddress: response.delivery_address || "",
        restaurantAddress: response.restaurant_address || "",
        restaurantName: response.restaurant_name || "Restaurant",
        phoneNumber: response.user_phone || user?.phone || "Not provided",
        paymentMethod: response.payment_method || "cod",
        pincode: response.pincode || "",
      };

      setOrderDetails(transformedOrder);
    } catch (error) {
      console.log("❌ Error fetching order:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [params.orderId, token, user?.phone]);

  // Initial fetch
  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  // Auto-refresh every 10 seconds if order is not in a final state
  useEffect(() => {
    if (!orderDetails) return;
    const finalStatuses: OrderStatus[] = [
      "delivered",
      "completed",
      "cancelled",
    ];
    if (finalStatuses.includes(orderDetails.status)) return;

    const interval = setInterval(() => {
      fetchOrderDetails();
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [orderDetails, fetchOrderDetails]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  // Safe calculation with null check
  const calculateSubtotal = () => {
    if (!orderDetails?.items || !Array.isArray(orderDetails.items)) {
      return 0;
    }
    return orderDetails.items.reduce((total, item) => {
      const price = item.price || 0;
      const quantity = item.quantity || 0;
      return total + price * quantity;
    }, 0);
  };

  // Format currency in Rupees
  const formatPrice = (price: number) => {
    return `₹${(price || 0).toFixed(2)}`;
  };

  // Dynamic tracking steps based on order type
  const getTrackingSteps = () => {
    if (!orderDetails) return [];

    if (orderDetails.status === "cancelled") {
      return [
        {
          id: 0,
          title: "Order Cancelled",
          description: "This order has been cancelled",
          time: new Date().toLocaleTimeString(),
          completed: false,
          active: true,
        },
      ];
    }

    if (orderDetails.deliveryOption === "delivery") {
      const deliverySteps = [
        {
          id: 1,
          title: "Order Placed",
          description: "We have received your order",
          time: new Date(
            orderDetails.created_at || Date.now(),
          ).toLocaleTimeString(),
          completed: orderDetails.status !== "pending",
          active: orderDetails.status === "pending",
        },
        {
          id: 2,
          title: "Confirmed",
          description: "Restaurant has confirmed your order",
          time: "Processing",
          completed: [
            "preparing",
            "ready",
            "on-the-way",
            "delivered",
            "completed",
          ].includes(orderDetails.status),
          active: orderDetails.status === "confirmed",
        },
        {
          id: 3,
          title: "Preparing",
          description: "Chef is preparing your food",
          time: "In progress",
          completed: ["ready", "on-the-way", "delivered", "completed"].includes(
            orderDetails.status,
          ),
          active: orderDetails.status === "preparing",
        },
        {
          id: 4,
          title: "Ready for Delivery",
          description: "Your order is ready for pickup by rider",
          time: "Ready",
          completed: ["on-the-way", "delivered", "completed"].includes(
            orderDetails.status,
          ),
          active: orderDetails.status === "ready",
        },
        {
          id: 5,
          title: "On the Way",
          description: "Rider is on the way to deliver",
          time: "In transit",
          completed: ["delivered", "completed"].includes(orderDetails.status),
          active: orderDetails.status === "on-the-way",
        },
        {
          id: 6,
          title: "Delivered",
          description: "Food has been delivered successfully",
          time: "Completed",
          completed:
            orderDetails.status === "delivered" ||
            orderDetails.status === "completed",
          active:
            orderDetails.status === "delivered" ||
            orderDetails.status === "completed",
        },
      ];

      return deliverySteps.filter((step) => {
        if (orderDetails.status === "pending") return step.id <= 1;
        if (orderDetails.status === "confirmed") return step.id <= 2;
        if (orderDetails.status === "preparing") return step.id <= 3;
        if (orderDetails.status === "ready") return step.id <= 4;
        if (orderDetails.status === "on-the-way") return step.id <= 5;
        return step.id <= 6;
      });
    } else {
      const dineInSteps = [
        {
          id: 1,
          title: "Order Placed",
          description: "We have received your order",
          time: new Date(
            orderDetails.created_at || Date.now(),
          ).toLocaleTimeString(),
          completed: orderDetails.status !== "pending",
          active: orderDetails.status === "pending",
        },
        {
          id: 2,
          title: "Confirmed",
          description: "Restaurant has confirmed your order",
          time: "Processing",
          completed: ["preparing", "ready", "completed"].includes(
            orderDetails.status,
          ),
          active: orderDetails.status === "confirmed",
        },
        {
          id: 3,
          title: "Preparing",
          description: "Chef is preparing your food",
          time: "In progress",
          completed: ["ready", "completed"].includes(orderDetails.status),
          active: orderDetails.status === "preparing",
        },
        {
          id: 4,
          title: "Ready for Pickup",
          description: "Your order is ready at the counter",
          time: "Ready",
          completed: ["completed"].includes(orderDetails.status),
          active: orderDetails.status === "ready",
        },
        {
          id: 5,
          title: "Completed",
          description: "Thank you for dining with us",
          time: "Completed",
          completed: orderDetails.status === "completed",
          active: orderDetails.status === "completed",
        },
      ];

      return dineInSteps.filter((step) => {
        if (orderDetails.status === "pending") return step.id <= 1;
        if (orderDetails.status === "confirmed") return step.id <= 2;
        if (orderDetails.status === "preparing") return step.id <= 3;
        if (orderDetails.status === "ready") return step.id <= 4;
        return step.id <= 5;
      });
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      preparing: "bg-purple-100 text-purple-800",
      ready: "bg-indigo-100 text-indigo-800",
      "on-the-way": "bg-orange-100 text-orange-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      completed: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusText = (status: OrderStatus) => {
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

  const handleCancelOrder = () => {
    Alert.alert("Cancel Order", "Are you sure you want to cancel this order?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes, Cancel",
        style: "destructive",
        onPress: () => {
          // TODO: Call API to cancel order
          Alert.alert(
            "Order Cancelled",
            "Your order has been cancelled successfully.",
          );
        },
      },
    ]);
  };

  const handleContactSupport = () => {
    Alert.alert(
      "Contact Support",
      "Call: +91 12345 67890\nEmail: support@foodapp.com",
    );
  };

  const handleTrackOrder = () => {
    if (orderDetails?.deliveryOption === "delivery") {
      Alert.alert(
        "Track Delivery",
        "Your order is on the way! You can track your delivery in real-time.",
      );
    } else {
      Alert.alert(
        "Order Status",
        "Your order is being prepared. Please arrive at the restaurant when status shows 'Ready'.",
      );
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#FE8C00" />
        <Text className="mt-4 text-gray-500">Loading order details...</Text>
      </SafeAreaView>
    );
  }

  if (!orderDetails) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <CustomHeader title="Order Details" />
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-900 text-lg">Order not found</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-4 bg-primary px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const subtotal = calculateSubtotal();
  const deliveryFee = orderDetails.deliveryOption === "delivery" ? 5 : 0;
  const discount = 0.5;
  const total = orderDetails.totalAmount || subtotal + deliveryFee - discount;
  const trackingSteps = getTrackingSteps();

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <CustomHeader title="Order Details" />

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Order ID and Status */}
        <View className="flex-row justify-between items-center mt-4 mb-6">
          <View>
            <Text className="text-gray-600 text-base">Order ID</Text>
            <Text className="text-lg font-semibold text-gray-900">
              {orderDetails.orderId}
            </Text>
          </View>
          <View
            className={`px-4 py-2 rounded-full ${getStatusColor(orderDetails.status)}`}
          >
            <Text className="text-sm font-semibold">
              {getStatusText(orderDetails.status)}
            </Text>
          </View>
        </View>

        <Text className="text-gray-500 text-sm mb-6">
          {orderDetails.orderDate}
        </Text>

        {/* Order Tracking */}
        <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
          <Text className="text-2xl font-bold text-gray-900 mb-6">
            Order Tracking
          </Text>

          <View className="space-y-8">
            {trackingSteps.map((step, index) => (
              <View key={step.id} className="flex-row">
                <View className="relative mr-4">
                  <View
                    className={`w-4 h-4 rounded-full ${
                      step.completed
                        ? "bg-primary"
                        : step.active
                          ? "bg-primary/50"
                          : "bg-gray-300"
                    }`}
                  />
                  {index < trackingSteps.length - 1 && (
                    <View
                      className={`absolute top-4 left-[6px] w-[2px] h-12 ${
                        step.completed ? "bg-primary" : "bg-gray-300"
                      }`}
                    />
                  )}
                </View>
                <View className="flex-1">
                  <View className="flex-row justify-between items-start">
                    <View>
                      <Text
                        className={`text-lg font-semibold ${
                          step.active
                            ? "text-primary"
                            : step.completed
                              ? "text-gray-900"
                              : "text-gray-400"
                        }`}
                      >
                        {step.title}
                      </Text>
                      <Text
                        className={`text-sm mt-1 ${
                          step.completed ? "text-gray-500" : "text-gray-400"
                        }`}
                      >
                        {step.description}
                      </Text>
                    </View>
                    <Text className="text-gray-400 text-sm">{step.time}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Track Button - Only for active orders */}
          {orderDetails.status !== "cancelled" &&
            orderDetails.status !== "delivered" &&
            orderDetails.status !== "completed" && (
              <TouchableOpacity
                onPress={handleTrackOrder}
                className="mt-8 py-3 bg-primary rounded-xl"
              >
                <Text className="text-white text-center text-lg font-semibold">
                  {orderDetails.deliveryOption === "delivery"
                    ? "Track Order"
                    : "Check Status"}
                </Text>
              </TouchableOpacity>
            )}

          {/* Cancel Order Button - Only for orders that can be cancelled */}
          {(orderDetails.status === "pending" ||
            orderDetails.status === "confirmed") && (
            <TouchableOpacity
              onPress={handleCancelOrder}
              className="mt-4 py-4 bg-red-600 rounded-xl"
            >
              <Text className="text-white text-center text-lg font-semibold">
                Cancel Order
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Order Items */}
        <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
          <Text className="text-2xl font-bold text-gray-900 mb-6">
            Order Summary
          </Text>

          <View className="space-y-4">
            {orderDetails.items && orderDetails.items.length > 0 ? (
              orderDetails.items.map((item, index) => (
                <View
                  key={index}
                  className="flex-row justify-between items-center py-3 border-b border-gray-100 last:border-0"
                >
                  <View className="flex-1">
                    <Text className="text-gray-900 font-medium text-base">
                      {item.name || "Item"}
                    </Text>
                    <Text className="text-gray-500 text-sm">
                      Qty: {item.quantity || 1}
                    </Text>
                    {item.customizations && item.customizations.length > 0 && (
                      <Text className="text-gray-400 text-xs">
                        {item.customizations.join(", ")}
                      </Text>
                    )}
                  </View>
                  <Text className="text-gray-900 font-semibold">
                    {formatPrice((item.price || 0) * (item.quantity || 1))}
                  </Text>
                </View>
              ))
            ) : (
              <Text className="text-gray-500 text-center py-4">
                No items in this order
              </Text>
            )}
          </View>

          {/* Price Breakdown */}
          <View className="mt-6 space-y-3">
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Subtotal</Text>
              <Text className="text-gray-900">{formatPrice(subtotal)}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Delivery Fee</Text>
              <Text className="text-gray-900">
                {deliveryFee > 0 ? formatPrice(deliveryFee) : "Free"}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Discount</Text>
              <Text className="text-green-600">-{formatPrice(discount)}</Text>
            </View>
            <View className="flex-row justify-between pt-3 border-t border-gray-200">
              <Text className="text-lg font-semibold text-gray-900">Total</Text>
              <Text className="text-2xl font-bold text-primary">
                {formatPrice(total)}
              </Text>
            </View>
          </View>
        </View>

        {/* Delivery/Dine-in Details */}
        <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
          <Text className="text-2xl font-bold text-gray-900 mb-6">
            {orderDetails.deliveryOption === "delivery"
              ? "Delivery Details"
              : "Dine-in Details"}
          </Text>

          <View className="space-y-4">
            <View>
              <Text className="text-gray-700 font-medium mb-1">
                Contact Number
              </Text>
              <Text className="text-gray-900 text-lg">
                {orderDetails.phoneNumber}
              </Text>
            </View>

            {orderDetails.deliveryOption === "delivery" ? (
              // Delivery Details
              <>
                <View>
                  <Text className="text-gray-700 font-medium mb-1">
                    Delivery Address
                  </Text>
                  <Text className="text-gray-900 text-lg">
                    {orderDetails.deliveryAddress || "Not provided"}
                  </Text>
                </View>
                {orderDetails.pincode && (
                  <View>
                    <Text className="text-gray-700 font-medium mb-1">
                      Pincode
                    </Text>
                    <Text className="text-gray-900 text-lg">
                      {orderDetails.pincode}
                    </Text>
                  </View>
                )}
              </>
            ) : (
              // Dine-in Details
              <>
                <View>
                  <Text className="text-gray-700 font-medium mb-1">
                    Restaurant Name
                  </Text>
                  <Text className="text-gray-900 text-lg">
                    {orderDetails.restaurantName || "Main Restaurant"}
                  </Text>
                </View>
                <View>
                  <Text className="text-gray-700 font-medium mb-1">
                    Restaurant Address
                  </Text>
                  <Text className="text-gray-900 text-lg">
                    {orderDetails.restaurantAddress ||
                      "Main Restaurant Location"}
                  </Text>
                </View>
                {orderDetails.pincode && (
                  <View>
                    <Text className="text-gray-700 font-medium mb-1">
                      Area Pincode
                    </Text>
                    <Text className="text-gray-900 text-lg">
                      {orderDetails.pincode}
                    </Text>
                  </View>
                )}
              </>
            )}

            <View>
              <Text className="text-gray-700 font-medium mb-1">
                Estimated Time
              </Text>
              <Text className="text-gray-900 text-lg">
                {orderDetails.deliveryTime}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Method */}
        <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
          <Text className="text-2xl font-bold text-gray-900 mb-6">
            Payment Method
          </Text>
          <View className="p-4 rounded-xl border border-gray-200">
            <Text className="text-lg font-semibold text-gray-900">
              {orderDetails.paymentMethod === "upi"
                ? "UPI"
                : orderDetails.paymentMethod === "cod"
                  ? "Cash on Delivery"
                  : "Card / NetBanking"}
            </Text>
            <Text className="text-gray-500 text-sm mt-1">
              {orderDetails.paymentMethod === "cod"
                ? "Pay at delivery"
                : "Paid online"}
            </Text>
          </View>
        </View>

        {/* Extra bottom padding for comfortable scrolling */}
        <View className="h-15" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ViewOrder;

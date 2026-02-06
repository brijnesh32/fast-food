// app/(tabs)/view-order.tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Define order status types
type OrderStatus =
  | "pending"
  | "preparing"
  | "on-the-way"
  | "delivered"
  | "cancelled";

const ViewOrder = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Mock order data - in real app, fetch from API
  const [orderDetails, setOrderDetails] = useState({
    orderId: `#${params.orderId || Math.floor(100000 + Math.random() * 900000)}`,
    status: "preparing" as OrderStatus,
    orderDate: new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    deliveryTime:
      params.deliveryOption === "delivery" ? "30-45 min" : "15-20 min",
    deliveryOption:
      (params.deliveryOption as "delivery" | "dine-in") || "delivery",
    totalAmount: params.total ? parseFloat(params.total as string) : 0,
    items: [
      { id: "1", name: "Margherita Pizza", quantity: 2, price: 12.99 },
      { id: "2", name: "Garlic Bread", quantity: 1, price: 5.99 },
      { id: "3", name: "Coca Cola", quantity: 1, price: 2.99 },
    ],
    deliveryAddress: params.address || "123 Main St, City Center",
    restaurantAddress: params.restaurantAddress || "456 Restaurant Ave",
    phoneNumber: params.phone || "+1 (555) 123-4567",
  });

  const [trackingSteps, setTrackingSteps] = useState([
    {
      id: 1,
      title: "Order Placed",
      description: "We have received your order",
      time: "10:30 AM",
      completed: true,
      active: false,
    },
    {
      id: 2,
      title: "Preparing",
      description: "Chef is preparing your food",
      time: "10:35 AM",
      completed: true,
      active: true,
    },
    {
      id: 3,
      title:
        orderDetails.deliveryOption === "delivery"
          ? "On the Way"
          : "Ready for Pickup",
      description:
        orderDetails.deliveryOption === "delivery"
          ? "Rider is on the way"
          : "Your order is ready",
      time: "Estimated 11:00 AM",
      completed: false,
      active: false,
    },
    {
      id: 4,
      title:
        orderDetails.deliveryOption === "delivery" ? "Delivered" : "Completed",
      description:
        orderDetails.deliveryOption === "delivery"
          ? "Food has been delivered"
          : "Dine-in completed",
      time: "",
      completed: false,
      active: false,
    },
  ]);

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "preparing":
        return "bg-blue-100 text-blue-800";
      case "on-the-way":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "preparing":
        return "Preparing";
      case "on-the-way":
        return "On the Way";
      case "delivered":
        return "Delivered";
      case "cancelled":
        return "Cancelled";
      default:
        return "Unknown";
    }
  };

  const handleCancelOrder = () => {
    Alert.alert("Cancel Order", "Are you sure you want to cancel this order?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes, Cancel",
        style: "destructive",
        onPress: () => {
          setOrderDetails((prev) => ({ ...prev, status: "cancelled" }));
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
      "Call: +1 (800) 123-4567\nEmail: support@example.com",
    );
  };

  const handleTrackOrder = () => {
    // In real app, this would open tracking map
    Alert.alert(
      "Tracking",
      orderDetails.deliveryOption === "delivery"
        ? "Your order is being tracked. Rider will arrive soon."
        : "Your order is being prepared. Please arrive at the restaurant soon.",
    );
  };

  const calculateSubtotal = () => {
    return orderDetails.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
  };

  const subtotal = calculateSubtotal();
  const deliveryFee = orderDetails.deliveryOption === "delivery" ? 5 : 0;
  const discount = 0.5;
  const total = subtotal + deliveryFee - discount;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-5 pt-6 pb-4 bg-white border-b border-gray-200">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 justify-center"
        >
          <Text className="text-2xl text-gray-800">←</Text>
        </TouchableOpacity>

        <Text className="text-3xl font-bold text-primary mt-3">
          Order Details
        </Text>

        <View className="flex-row justify-between items-center mt-4">
          <View>
            <Text className="text-gray-600 text-base">Order ID</Text>
            <Text className="text-lg font-semibold text-gray-900">
              {orderDetails.orderId}
            </Text>
          </View>
          <View
            className={`px-4 py-2 rounded-full ${getStatusColor(orderDetails.status)}`}
          >
            <Text className={`text-sm font-semibold`}>
              {getStatusText(orderDetails.status)}
            </Text>
          </View>
        </View>

        <Text className="text-gray-500 text-sm mt-2">
          {orderDetails.orderDate}
        </Text>
      </View>

      <ScrollView className="px-5 mt-5" showsVerticalScrollIndicator={false}>
        {/* Order Tracking */}
        <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
          <Text className="text-2xl font-bold text-gray-900 mb-6">
            Order Tracking
          </Text>

          <View className="space-y-8">
            {trackingSteps.map((step, index) => (
              <View key={step.id} className="flex-row">
                {/* Timeline line */}
                <View className="relative mr-4">
                  <View
                    className={`w-4 h-4 rounded-full ${step.completed ? "bg-primary" : "bg-gray-300"}`}
                  />
                  {index < trackingSteps.length - 1 && (
                    <View
                      className={`absolute top-4 left-[6px] w-[2px] h-12 ${step.completed ? "bg-primary" : "bg-gray-300"}`}
                    />
                  )}
                </View>

                {/* Step details */}
                <View className="flex-1">
                  <View className="flex-row justify-between items-start">
                    <View>
                      <Text
                        className={`text-lg font-semibold ${step.active ? "text-primary" : "text-gray-900"}`}
                      >
                        {step.title}
                      </Text>
                      <Text className="text-gray-500 text-sm mt-1">
                        {step.description}
                      </Text>
                    </View>
                    <Text className="text-gray-400 text-sm">{step.time}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity
            onPress={handleTrackOrder}
            className="mt-8 py-3 bg-primary rounded-xl"
          >
            <Text className="text-white text-center text-lg font-semibold">
              {orderDetails.deliveryOption === "delivery"
                ? "Track Delivery"
                : "View Preparation Status"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Order Items */}
        <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
          <Text className="text-2xl font-bold text-gray-900 mb-6">
            Order Summary
          </Text>

          <View className="space-y-4">
            {orderDetails.items.map((item) => (
              <View
                key={item.id}
                className="flex-row justify-between items-center py-3 border-b border-gray-100 last:border-0"
              >
                <View className="flex-1">
                  <Text className="text-gray-900 font-medium text-base">
                    {item.name}
                  </Text>
                  <Text className="text-gray-500 text-sm">
                    Qty: {item.quantity}
                  </Text>
                </View>
                <Text className="text-gray-900 font-semibold">
                  ${(item.price * item.quantity).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>

          {/* Price Breakdown */}
          <View className="mt-6 space-y-3">
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Subtotal</Text>
              <Text className="text-gray-900">${subtotal.toFixed(2)}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Delivery Fee</Text>
              <Text className="text-gray-900">
                {deliveryFee > 0 ? `$${deliveryFee.toFixed(2)}` : "Free"}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Discount</Text>
              <Text className="text-green-600">-${discount.toFixed(2)}</Text>
            </View>
            <View className="flex-row justify-between pt-3 border-t border-gray-200">
              <Text className="text-lg font-semibold text-gray-900">Total</Text>
              <Text className="text-2xl font-bold text-primary">
                ${total.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Delivery Details */}
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
              <View>
                <Text className="text-gray-700 font-medium mb-1">
                  Delivery Address
                </Text>
                <Text className="text-gray-900 text-lg">
                  {orderDetails.deliveryAddress}
                </Text>
              </View>
            ) : (
              <View>
                <Text className="text-gray-700 font-medium mb-1">
                  Restaurant Address
                </Text>
                <Text className="text-gray-900 text-lg">
                  {orderDetails.restaurantAddress}
                </Text>
                <Text className="text-gray-500 text-sm mt-1">
                  Please arrive within 15 minutes
                </Text>
              </View>
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
        <View className="bg-white rounded-2xl p-6 mb-28 shadow-sm border border-gray-100">
          <Text className="text-2xl font-bold text-gray-900 mb-6">
            Payment Method
          </Text>

          <View className="p-4 rounded-xl border border-gray-200">
            <Text className="text-lg font-semibold text-gray-900">
              Cash on Delivery
            </Text>
            <Text className="text-gray-500 text-sm mt-1">Pay at doorstep</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View className="absolute bottom-0 left-0 right-0 bg-white pt-5 px-5 pb-8 border-t border-gray-200 shadow-lg">
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={handleContactSupport}
            className="flex-1 py-4 border-2 border-primary rounded-xl"
          >
            <Text className="text-primary text-center text-lg font-semibold">
              Contact Support
            </Text>
          </TouchableOpacity>

          {orderDetails.status === "pending" ||
          orderDetails.status === "preparing" ? (
            <TouchableOpacity
              onPress={handleCancelOrder}
              className="flex-1 py-4 bg-red-600 rounded-xl"
            >
              <Text className="text-white text-center text-lg font-semibold">
                Cancel Order
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => router.push("/(tabs)")}
              className="flex-1 py-4 bg-primary rounded-xl"
            >
              <Text className="text-white text-center text-lg font-semibold">
                Back to Home
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ViewOrder;

// app/(tabs)/profile.tsx
import CustomButton from "@/components/CustomButton";
import CustomHeader from "@/components/CustomHeader";
import { images } from "@/constants";
import useAuthStore from "@/store/auth.store";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Profile = () => {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/sign-in");
  };

  const handleViewOrders = () => {
    // Navigate to view-order screen with mock order data
    router.push({
      pathname: "/(tabs)/view-order",
      params: {
        orderId: Math.floor(100000 + Math.random() * 900000),
        total: "45.99",
        deliveryOption: "delivery",
        address: user?.address || "123 Main St, City Center",
        phone: user?.phone || "+1 (555) 123-4567",
      },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <CustomHeader title="Profile" />

      <View className="p-5">
        <View className="items-center mt-6 mb-8">
          <Image
            source={images.avatar}
            className="w-32 h-32 rounded-full"
            resizeMode="cover"
          />

          <Text className="text-2xl font-bold text-dark-100 mt-4">
            {user?.name || "Guest User"}
          </Text>
          <Text className="text-gray-500 mt-1">
            {user?.email || "No email"}
          </Text>
        </View>

        <View className="bg-gray-50 rounded-xl p-5 mb-6">
          <View className="mb-4">
            <Text className="text-sm text-gray-500 font-medium">Name</Text>
            <Text className="text-lg text-dark-100 mt-1">
              {user?.name || "-"}
            </Text>
          </View>

          <View className="mb-4">
            <Text className="text-sm text-gray-500 font-medium">Email</Text>
            <Text className="text-lg text-dark-100 mt-1">
              {user?.email || "-"}
            </Text>
          </View>
        </View>

        {/* Your Orders Button */}
        <CustomButton
          title="Your Orders"
          onPress={handleViewOrders}
          style="mb-4 bg-primary border-2 border-primary py-4 rounded-xl"
          textStyle="text-white text-lg font-semibold"
        />

        {/* Logout Button */}
        <CustomButton
          title="Logout"
          onPress={handleLogout}
          style="py-4 rounded-xl bg-primary border-2 border-primary"
          textStyle="text-white text-lg font-semibold"
        />

        <View className="mt-12 items-center">
          <Text className="text-xs text-gray-400">App Version 1.0.0</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Profile;

// app/(root)/profile.tsx
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
    router.replace('/(auth)/sign-in');
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
          
          <View>
            <Text className="text-sm text-gray-500 font-medium">Account ID</Text>
            <Text className="text-lg text-dark-100 mt-1">
              {user?.id ? user.id.substring(0, 8) + '...' : "-"}
            </Text>
          </View>
        </View>

        {/* Only Logout button remains */}
        <CustomButton
          title="Logout"
          onPress={handleLogout}
          
        />

        <View className="mt-12 items-center">
          <Text className="text-xs text-gray-400">App Version 1.0.0</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Profile;
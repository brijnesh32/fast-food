// app/(root)/profile.tsx
import CustomButton from "@/components/CustomButton";
import CustomHeader from "@/components/CustomHeader";
import { images } from "@/constants";
import useAuthStore from "@/store/auth.store";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Image, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/**
 * Profile screen styled to match the rest of the app (Tailwind / NativeWind classes used across project).
 * - reads current user from the zustand auth store
 * - shows avatar, name, email
 * - provides Edit and Logout buttons
 */

const Profile = () => {
  const router = useRouter();
  const { user, fetchAuthenticatedUser, signOut, isLoading } = useAuthStore(
    (s) => ({
      user: s.user,
      fetchAuthenticatedUser: s.fetchAuthenticatedUser,
      signOut: s.signOut,
      isLoading: s.isLoading,
    })
  );

  useEffect(() => {
    // ensure user is loaded when screen mounts
    fetchAuthenticatedUser();
  }, []);

  const handleEdit = () => {
    // navigate to an edit-profile screen (if you have one));
  };

  const handleLogout = async () => {
    await signOut();
    router.replace("/sign-in");
  };

  const avatarUri =
    user?.avatar && user.avatar.startsWith("http")
      ? user.avatar
      : images.avatar; // fallback to bundled avatar image

  return (
    <SafeAreaView className="flex-1 bg-white">
      <CustomHeader title="Profile" />

      <View className="p-5">
        <View className="items-center mt-6 mb-6">
          <Image
            source={typeof avatarUri === "string" ? { uri: avatarUri } : avatarUri}
            className="w-28 h-28 rounded-full"
            resizeMode="cover"
          />

          <Text className="text-2xl font-bold text-dark-100 mt-4">
            {user?.name ?? "Guest User"}
          </Text>
          <Text className="text-sm text-gray-200 mt-1">{user?.email ?? ""}</Text>
        </View>

        <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
          <View className="mb-4">
            <Text className="text-sm text-gray-500">Name</Text>
            <Text className="text-lg font-medium text-dark-100 mt-1">{user?.name ?? "-"}</Text>
          </View>

          <View className="mb-4">
            <Text className="text-sm text-gray-500">Email</Text>
            <Text className="text-lg font-medium text-dark-100 mt-1">{user?.email ?? "-"}</Text>
          </View>

          {/* Add other profile fields here if available */}
        </View>

        <View className="mt-6 space-y-3">
          <CustomButton title="Edit Profile" onPress={handleEdit} />
          <CustomButton
            title="Logout"
            onPress={handleLogout}
            style="bg-white border border-gray-200"
            textStyle="text-primary"
          />
        </View>

        <View className="mt-8 items-center">
          <Text className="text-xs text-gray-300">App version 1.0.0</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Profile;

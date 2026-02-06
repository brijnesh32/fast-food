// components/CustomHeader.tsx
import { images } from "@/constants";
import { CustomHeaderProps } from "@/type";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

const CustomHeader = ({ title }: CustomHeaderProps) => {
  const router = useRouter();

  return (
    <View className="custom-header">
      <TouchableOpacity onPress={() => router.back()}>
        <Image
          source={images.arrowBack}
          className="size-5"
          resizeMode="contain"
        />
      </TouchableOpacity>

      {title && (
        <Text className="base-semibold text-center text-dark-100">{title}</Text>
      )}
    </View>
  );
};

export default CustomHeader;

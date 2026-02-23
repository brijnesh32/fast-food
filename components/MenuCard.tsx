// components/MenuCard.tsx - FULLY OPTIMIZED
import useCartStore from "@/store/cart.store";
import { MenuItem } from "@/type";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const MenuCard = ({ item }: { item: MenuItem }) => {
  const addItem = useCartStore((state) => state.addItem);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Ensure image_url exists with fallback
  const imageSource = item.image_url || item.image;
  const finalImageSource = imageSource || "https://via.placeholder.com/150";

  // Prefetch image when component mounts
  useEffect(() => {
    if (
      finalImageSource &&
      finalImageSource !== "https://via.placeholder.com/150"
    ) {
      Image.prefetch(finalImageSource);
    }
  }, [finalImageSource]);

  return (
    <View className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 items-center min-h-[180px] relative">
      {/* Image Container with Loading State */}
      <View className="w-24 h-24 rounded-lg mb-2 relative overflow-hidden">
        {/* Loading Spinner */}
        {isLoading && !imageError && (
          <View className="absolute inset-0 bg-gray-100 items-center justify-center z-10">
            <ActivityIndicator size="small" color="#FE8C00" />
          </View>
        )}

        {/* Loading Skeleton (alternative) */}
        {isLoading && !imageError && (
          <View className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}

        {/* Actual Image */}
        <Image
          source={{ uri: finalImageSource }}
          className="w-24 h-24 rounded-lg"
          style={{ opacity: imageLoaded ? 1 : 0 }}
          resizeMode="cover"
          onLoadStart={() => setIsLoading(true)}
          onLoad={() => {
            setImageLoaded(true);
            setIsLoading(false);
          }}
          onError={() => {
            setImageError(true);
            setIsLoading(false);
            setImageLoaded(false);
          }}
          fadeDuration={300} // Smooth fade in
        />

        {/* Fallback if image fails to load */}
        {imageError && (
          <View className="absolute inset-0 bg-gray-300 rounded-lg items-center justify-center">
            <Text className="text-gray-500 text-xs text-center px-1">
              No Image
            </Text>
          </View>
        )}
      </View>

      {/* Food Name */}
      <Text
        className="text-center font-bold text-dark-100 mb-1"
        numberOfLines={1}
      >
        {item.name}
      </Text>

      {/* Price */}
      <Text className="text-gray-200 mb-3">
        ${item.price?.toFixed(2) || "0.00"}
      </Text>

      {/* Add to Cart Button */}
      <TouchableOpacity
        className="bg-primary px-4 py-2 rounded-full active:opacity-80"
        onPress={() =>
          addItem({
            id: item.id,
            name: item.name,
            price: item.price,
            image_url: item.image_url,
            customizations: [],
          })
        }
      >
        <Text className="text-white font-bold">Add to Cart</Text>
      </TouchableOpacity>
    </View>
  );
};

export default MenuCard;

// components/MenuCard.tsx - FIXED IMPORT
import useCartStore from "@/store/cart.store"; // ✅ Changed from { useCartStore }
import { MenuItem } from "@/type";
import { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

const MenuCard = ({ item }: { item: MenuItem }) => {
  const addItem = useCartStore((state) => state.addItem); // ✅ Use selector
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Ensure image_url exists with fallback
  const imageSource = item.image_url || item.image;
  const finalImageSource = imageSource || 'https://via.placeholder.com/150';

  // Handle image load
  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // Handle image error
  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  return (
    <View className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 items-center min-h-[180px] relative">
      {/* Image Container with Loading State */}
      <View className="w-24 h-24 rounded-lg mb-2 relative overflow-hidden">
        {/* Loading Skeleton */}
        {!imageLoaded && (
          <View className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg" />
        )}
        
        {/* Actual Image */}
        <Image 
          source={{ uri: finalImageSource }} 
          className="w-24 h-24 rounded-lg"
          style={{ opacity: imageLoaded ? 1 : 0 }}
          resizeMode="cover"
          onLoad={handleImageLoad}
          onError={handleImageError}
          fadeDuration={100}
        />
        
        {/* Fallback if image fails to load */}
        {imageError && (
          <View className="absolute inset-0 bg-gray-300 rounded-lg items-center justify-center">
            <Text className="text-gray-500 text-xs text-center px-1">No Image</Text>
          </View>
        )}
      </View>

      {/* Food Name */}
      <Text className="text-center font-bold text-dark-100 mb-1" numberOfLines={1}>
        {item.name}
      </Text>
      
      {/* Price */}
      <Text className="text-gray-200 mb-3">${item.price?.toFixed(2) || '0.00'}</Text>
      
      {/* Add to Cart Button */}
      <TouchableOpacity 
        className="bg-primary px-4 py-2 rounded-full active:opacity-80"
        onPress={() => addItem({ 
          id: item.id, 
          name: item.name, 
          price: item.price, 
          image_url: item.image_url, 
          customizations: [] 
        })}
      >
        <Text className="text-white font-bold">Add to Cart</Text>
      </TouchableOpacity>
    </View>
  );
};

export default MenuCard;
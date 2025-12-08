// app/(tabs)/product-details.tsx - WITH CartButton COMPONENT
import CartButton from "@/components/CartButton"; // ✅ Import CartButton
import { images } from "@/constants";
import useCartStore from "@/store/cart.store";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ProductDetails = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const addItem = useCartStore((state) => state.addItem);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Parse parameters
  const foodItem = {
    id: params.id as string || '1',
    name: params.name as string || "Food Item",
    description: params.description as string || "Delicious food item description",
    price: parseFloat(params.price as string) || 0,
    image: params.image as string || images.burger,
    rating: parseFloat(params.rating as string) || 4.5,
    calories: parseInt(params.calories as string) || 0,
    protein: parseInt(params.protein as string) || 0,
    cookingTime: params.cookingTime as string || '15-20 mins',
    category: params.category as string || 'Fast Food',
    isVeg: params.isVeg === 'true',
    ingredients: params.ingredients ? JSON.parse(params.ingredients as string) : [],
    customizations: params.customizations ? JSON.parse(params.customizations as string) : []
  };

  const [qty, setQty] = useState(1);
  const MAX_QUANTITY = 10;
  const total = (foodItem.price * qty).toFixed(2);

  const handleIncrease = () => {
    if (qty < MAX_QUANTITY) {
      setQty(qty + 1);
    } else {
      Alert.alert('Maximum Quantity', `You can only add up to ${MAX_QUANTITY} items`);
    }
  };

  const handleDecrease = () => {
    if (qty > 1) {
      setQty(qty - 1);
    }
  };

  const handleAddToCart = () => {
    addItem({
      id: foodItem.id,
      name: foodItem.name,
      price: foodItem.price,
      image_url: foodItem.image,
      customizations: []
    }, qty);
    
    Alert.alert(
      "✅ Added to Cart!",
      `${qty} x ${foodItem.name} added to your cart`,
      [
        {
          text: "Continue Shopping",
          onPress: () => router.back(),
          style: "cancel"
        },
        {
          text: "View Cart",
          onPress: () => router.push('/(tabs)/cart')
        }
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pt-5">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center rounded-full bg-gray-100 active:opacity-70"
          >
            <Text className="text-xl font-bold">‹</Text>
          </TouchableOpacity>
          
          {/* Use CartButton Component instead of the simple cart icon */}
          <CartButton />
        </View>

        {/* Product Image with Loading State */}
        <View className="items-center px-5 mt-5 relative">
          {!imageLoaded && !imageError && (
            <View className="w-full h-64 rounded-2xl bg-gray-200 animate-pulse" />
          )}
          
          <Image
            source={typeof foodItem.image === 'string' ? { uri: foodItem.image } : foodItem.image}
            className="w-full h-64 rounded-2xl"
            style={{ opacity: imageLoaded ? 1 : 0 }}
            resizeMode="cover"
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true);
              setImageLoaded(true);
            }}
          />
          
          {imageError && (
            <View className="absolute inset-0 bg-gray-300 rounded-2xl items-center justify-center">
              <Text className="text-gray-500">No Image Available</Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View className="px-5 mt-6">
          <View className="flex-row justify-between items-start">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-dark-100">{foodItem.name}</Text>
              <Text className="text-gray-500 mt-1">{foodItem.category}</Text>
            </View>
            <Text className="text-2xl font-bold text-primary">
              ${foodItem.price.toFixed(2)}
            </Text>
          </View>

          {/* Rating */}
          <View className="flex-row items-center mt-3">
            <View className="flex-row">
              {[...Array(5)].map((_, i) => (
                <Text 
                  key={i}
                  className={i < Math.floor(foodItem.rating) ? "text-yellow-500 text-lg" : "text-gray-300 text-lg"}
                >
                  ★
                </Text>
              ))}
            </View>
            <Text className="ml-2 text-gray-600">({foodItem.rating.toFixed(1)})</Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View className="flex-row justify-between mx-5 mt-6 bg-gray-50 rounded-xl p-4">
          <View className="items-center">
            <Text className="text-gray-500 text-sm">Calories</Text>
            <Text className="font-bold text-dark-100 text-lg">{foodItem.calories} cal</Text>
          </View>
          <View className="items-center">
            <Text className="text-gray-500 text-sm">Protein</Text>
            <Text className="font-bold text-dark-100 text-lg">{foodItem.protein}g</Text>
          </View>
          <View className="items-center">
            <Text className="text-gray-500 text-sm">Time</Text>
            <Text className="font-bold text-dark-100 text-lg">{foodItem.cookingTime}</Text>
          </View>
          <View className="items-center">
            <Text className="text-gray-500 text-sm">Type</Text>
            <Text className={`font-bold text-lg ${foodItem.isVeg ? 'text-green-600' : 'text-red-600'}`}>
              {foodItem.isVeg ? '🥬 Veg' : '🥩 Non-Veg'}
            </Text>
          </View>
        </View>

        {/* Description */}
        <View className="px-5 mt-6">
          <Text className="text-lg font-semibold text-dark-100 mb-2">Description</Text>
          <Text className="text-gray-600 leading-6">
            {foodItem.description}
          </Text>
        </View>

        {/* Ingredients */}
        {foodItem.ingredients && foodItem.ingredients.length > 0 && (
          <View className="px-5 mt-6">
            <Text className="text-lg font-semibold text-dark-100 mb-3">Ingredients</Text>
            <View className="flex-row flex-wrap gap-2">
              {foodItem.ingredients.map((ingredient: string, index: number) => (
                <View 
                  key={index}
                  className="bg-gray-100 rounded-full px-4 py-2"
                >
                  <Text className="text-gray-700">{ingredient}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Quantity Selector */}
        <View className="px-5 mt-10 mb-32">
          <Text className="text-lg font-semibold text-dark-100 mb-3">Quantity</Text>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-5">
              <TouchableOpacity
                onPress={handleDecrease}
                className={`w-12 h-12 rounded-xl justify-center items-center ${
                  qty <= 1 ? 'bg-gray-100' : 'bg-gray-200'
                }`}
                disabled={qty <= 1}
              >
                <Text className={`text-2xl font-bold ${
                  qty <= 1 ? 'text-gray-400' : 'text-gray-700'
                }`}>
                  -
                </Text>
              </TouchableOpacity>

              <Text className="text-2xl font-semibold text-dark-100 min-w-[40px] text-center">
                {qty}
              </Text>

              <TouchableOpacity
                onPress={handleIncrease}
                className={`w-12 h-12 rounded-xl justify-center items-center ${
                  qty >= MAX_QUANTITY ? 'bg-gray-100' : 'bg-gray-200'
                }`}
                disabled={qty >= MAX_QUANTITY}
              >
                <Text className={`text-2xl font-bold ${
                  qty >= MAX_QUANTITY ? 'text-gray-400' : 'text-gray-700'
                }`}>
                  +
                </Text>
              </TouchableOpacity>
            </View>
            
            <Text className="text-xl font-bold text-dark-100">
              Total: ${total}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Add to Cart Button */}
      <View className="border-t border-gray-200 p-5 bg-white">
        <TouchableOpacity 
          className="bg-primary py-4 rounded-xl items-center active:opacity-80"
          onPress={handleAddToCart}
          activeOpacity={0.8}
        >
          <Text className="text-white font-bold text-lg">
            Add to Cart • ${total}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ProductDetails;
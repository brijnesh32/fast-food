// app/(tabs)/product-details.tsx - CORRECTED VERSION
import CartButton from "@/components/CartButton";
import { images } from "@/constants";
import useCartStore from "@/store/cart.store";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const ProductDetails = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const addItem = useCartStore((state) => state.addItem);
  const items = useCartStore((state) => state.items);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isInCart, setIsInCart] = useState(false);
  const [cartQuantity, setCartQuantity] = useState(0);

  // Parse parameters
  const foodItem = {
    id: (params.id as string) || "1",
    name: (params.name as string) || "Classic Cheeseburger",
    description:
      (params.description as string) || "Beef patty, cheese, lettuce, tomato",
    price: parseFloat(params.price as string) || 25.99,
    image: (params.image as string) || images.burger,
    rating: parseFloat(params.rating as string) || 4.5,
    calories: parseInt(params.calories as string) || 550,
    protein: parseInt(params.protein as string) || 25,
    cookingTime: (params.cookingTime as string) || "15-20 mins",
    category: (params.category as string) || "Burgers",
    isVeg: params.isVeg === "true",
    ingredients: params.ingredients
      ? JSON.parse(params.ingredients as string)
      : [],
    customizations: params.customizations
      ? JSON.parse(params.customizations as string)
      : [],
  };

  // Check if item is already in cart
  useEffect(() => {
    const checkIfInCart = () => {
      const foundItem = items.find(
        (item) =>
          item.id === foodItem.id &&
          JSON.stringify(item.customizations) ===
            JSON.stringify(foodItem.customizations || []),
      );

      if (foundItem) {
        setIsInCart(true);
        setCartQuantity(foundItem.quantity);
        setQuantity(foundItem.quantity);
      } else {
        setIsInCart(false);
        setCartQuantity(0);
        setQuantity(1);
      }
    };

    checkIfInCart();
  }, [items, foodItem.id, foodItem.customizations]);

  const handleAddToCart = () => {
    addItem(
      {
        id: foodItem.id,
        name: foodItem.name,
        price: foodItem.price,
        image_url: foodItem.image,
        customizations: foodItem.customizations || [],
      },
      quantity,
    );

    setIsInCart(true);
    setCartQuantity(quantity);
  };

  const handleBack = () => {
    router.push("/(tabs)/search");
  };

  const increaseQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header with Back Button and Cart Button */}
      <View className="flex-row items-center justify-between px-5 pt-5">
        <TouchableOpacity
          onPress={handleBack}
          className="w-10 h-10 items-center justify-center rounded-full bg-black"
        >
          <Image
            source={images.arrowBack}
            className="w-6 h-6"
            resizeMode="contain"
          />
        </TouchableOpacity>

        <CartButton />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Smaller Product Image */}
        <View className="items-center px-5 mt-3">
          <Image
            source={
              typeof foodItem.image === "string"
                ? { uri: foodItem.image }
                : foodItem.image
            }
            className="w-64 h-64 rounded-2xl"
            resizeMode="contain"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        </View>

        {/* Product Info */}
        <View className="px-5 mt-5">
          <View className="flex-row justify-between items-start">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-dark-100">
                {foodItem.name}
              </Text>
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
                  className={
                    i < Math.floor(foodItem.rating)
                      ? "text-yellow-500 text-lg"
                      : "text-gray-300 text-lg"
                  }
                >
                  ★
                </Text>
              ))}
            </View>
            <Text className="ml-2 text-gray-600">
              ({foodItem.rating.toFixed(1)})
            </Text>
          </View>
        </View>

        {/* Quick Stats - 4 Columns like in image */}
        <View className="flex-row justify-between mx-5 mt-6 bg-gray-50 rounded-2xl p-4">
          <View className="items-center flex-1">
            <Text className="text-gray-500 text-sm">Calories</Text>
            <Text className="font-bold text-dark-100 text-lg mt-1">
              {foodItem.calories} cal
            </Text>
          </View>

          <View className="h-8 w-px bg-gray-300" />

          <View className="items-center flex-1">
            <Text className="text-gray-500 text-sm">Protein</Text>
            <Text className="font-bold text-dark-100 text-lg mt-1">
              {foodItem.protein}g
            </Text>
          </View>

          <View className="h-8 w-px bg-gray-300" />

          <View className="items-center flex-1">
            <Text className="text-gray-500 text-sm">Time</Text>
            <Text className="font-bold text-dark-100 text-lg mt-1">
              {foodItem.cookingTime}
            </Text>
          </View>

          <View className="h-8 w-px bg-gray-300" />

          <View className="items-center flex-1">
            <Text className="text-gray-500 text-sm">Type</Text>
            <Text
              className={`font-bold text-lg mt-1 ${foodItem.isVeg ? "text-green-600" : "text-red-600"}`}
            >
              {foodItem.isVeg ? "Veg" : "Non-Veg"}
            </Text>
          </View>
        </View>

        {/* Description */}
        <View className="px-5 mt-6">
          <Text className="text-xl font-semibold text-dark-100 mb-3">
            Description
          </Text>
          <Text className="text-gray-600 text-base leading-6">
            {foodItem.description}
          </Text>
        </View>

        {/* Ingredients - If available */}
        {foodItem.ingredients && foodItem.ingredients.length > 0 && (
          <View className="px-5 mt-6">
            <Text className="text-xl font-semibold text-dark-100 mb-3">
              Ingredients
            </Text>
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

        {/* Add to Cart OR Quantity Selector */}
        <View className="px-5 mt-8 mb-32">
          {!isInCart ? (
            // ITEM NOT IN CART: Show "Add to Cart" button
            <TouchableOpacity
              className="bg-primary py-4 rounded-xl items-center"
              onPress={handleAddToCart}
              activeOpacity={0.8}
            >
              <Text className="text-white font-bold text-lg">Add to Cart</Text>
            </TouchableOpacity>
          ) : (
            // ITEM ALREADY IN CART: Show quantity selector
            <View className="bg-primary rounded-xl p-4">
              <View className="mb-3 items-center">
                <Text className="text-white font-bold text-lg">
                  Already in Cart
                </Text>
              </View>

              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-white font-bold text-lg">
                  Update Quantity
                </Text>
                <Text className="text-white font-bold text-lg">
                  ${(foodItem.price * quantity).toFixed(2)}
                </Text>
              </View>

              <View className="flex-row items-center justify-between">
                {/* Minus Button */}
                <TouchableOpacity
                  onPress={decreaseQuantity}
                  className={`w-12 h-12 rounded-full items-center justify-center ${
                    quantity <= 1 ? "bg-gray-400" : "bg-white"
                  }`}
                  disabled={quantity <= 1}
                >
                  <Text
                    className={`text-2xl font-bold ${
                      quantity <= 1 ? "text-gray-200" : "text-primary"
                    }`}
                  >
                    -
                  </Text>
                </TouchableOpacity>

                {/* Quantity Display */}
                <View className="items-center">
                  <Text className="text-white text-2xl font-bold mb-1">
                    {quantity}
                  </Text>
                  <Text className="text-white/80 text-sm">
                    Current: {cartQuantity}
                  </Text>
                </View>

                {/* Plus Button */}
                <TouchableOpacity
                  onPress={increaseQuantity}
                  className="w-12 h-12 rounded-full bg-white items-center justify-center"
                >
                  <Text className="text-2xl font-bold text-primary">+</Text>
                </TouchableOpacity>
              </View>

              {/* Update Button */}
              <TouchableOpacity
                className="mt-4 bg-white py-3 rounded-lg items-center"
                onPress={handleAddToCart}
                activeOpacity={0.8}
              >
                <Text className="text-primary font-bold text-lg">
                  Update to {quantity} Item{quantity > 1 ? "s" : ""}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProductDetails;

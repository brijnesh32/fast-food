// components/CartItem.tsx
import { images } from "@/constants";
import { API_BASE } from "@/lib/api";
import { useCartStore } from "@/store/cart.store";
import { CartItemType } from "@/type";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

const resolveImage = (image_url?: string) => {
  if (!image_url) return "";
  if (image_url.startsWith("http")) return image_url;
  return API_BASE.replace("/api", "") + image_url;
};

const CartItem = ({ item }: { item: CartItemType }) => {
  const increaseQty = useCartStore((s) => s.increaseQty);
  const decreaseQty = useCartStore((s) => s.decreaseQty);
  const removeItem = useCartStore((s) => s.removeItem);

  return (
    <View className="cart-item">
      <View className="flex flex-row items-center gap-x-3">
        <View className="cart-item__image">
          <Image
            source={{ uri: resolveImage(item.image_url) }}
            className="size-4/5 rounded-lg"
            resizeMode="cover"
          />
        </View>

        <View className="flex-1">
          <Text className="base-bold text-dark-100">{item.name}</Text>
          <Text className="paragraph-bold text-primary mt-1">${item.price}</Text>

          <View className="flex flex-row items-center gap-x-4 mt-2">
            <TouchableOpacity
              onPress={() => decreaseQty(item.id, item.customizations ?? [])}
              className="cart-item__actions"
            >
              <Image source={images.minus} className="size-1/2" resizeMode="contain" />
            </TouchableOpacity>

            <Text className="base-bold text-dark-100">{item.quantity}</Text>

            <TouchableOpacity
              onPress={() => increaseQty(item.id, item.customizations ?? [])}
              className="cart-item__actions"
            >
              <Image source={images.plus} className="size-1/2" resizeMode="contain" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <TouchableOpacity onPress={() => removeItem(item.id, item.customizations ?? [])} className="flex-center">
        <Image source={images.trash} className="size-5" resizeMode="contain" />
      </TouchableOpacity>
    </View>
  );
};

export default CartItem;

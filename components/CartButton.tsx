import { images } from '@/constants';
import useCartStore from '@/store/cart.store';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

const CartButton = () => {
  const router = useRouter();
  const { getTotalItems } = useCartStore();
  const totalItems = getTotalItems();

  return (
    <TouchableOpacity className="cart-btn" onPress={() => router.push('/cart')}>
      <Image source={images.bag} className="size-5" resizeMode="contain" />

      {totalItems > 0 && (
        <View className="cart-badge">
          <Text className="small-bold text-white">
            {totalItems > 9 ? '9+' : totalItems}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default CartButton;

// components/CartItem.tsx - WITH PLUS/MINUS ICONS
import { images } from '@/constants';
import useCartStore from '@/store/cart.store';
import { Image, Text, TouchableOpacity, View } from 'react-native';

const CartItem = ({ item }: { item: any }) => {
  const { increaseQty, decreaseQty, removeItem } = useCartStore();

  return (
    <View className="flex-row items-center bg-white border border-gray-200 rounded-2xl p-4 mb-4">
      <Image
        source={item.image_url ? { uri: item.image_url } : images.burger}
        className="w-20 h-20 rounded-xl"
        resizeMode="cover"
      />
      
      <View className="flex-1 ml-4">
        <Text className="text-lg font-bold text-dark-100 mb-1">{item.name}</Text>
        
        {item.customizations && item.customizations.length > 0 && (
          <Text className="text-gray-500 text-sm mb-2">
            {item.customizations.join(', ')}
          </Text>
        )}
        
        <Text className="text-primary font-bold text-lg mb-3">
          ${item.price.toFixed(2)}
        </Text>
        
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            {/* Minus Button with Icon */}
            <TouchableOpacity
              onPress={() => decreaseQty(item.id, item.customizations || [])}
              className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
            >
              {images.minus ? (
                <Image
                  source={images.minus}
                  className="w-4 h-4"
                  resizeMode="contain"
                  
                />
              ) : (
                <Text className="text-gray-700 font-bold text-lg">-</Text>
              )}
            </TouchableOpacity>
            
            <Text className="text-lg font-semibold min-w-[30px] text-center">
              {item.quantity}
            </Text>
            
            {/* Plus Button with Icon */}
            <TouchableOpacity
              onPress={() => increaseQty(item.id, item.customizations || [])}
              className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
            >
              {images.plus ? (
                <Image
                  source={images.plus}
                  className="w-4 h-4"
                  resizeMode="contain"
                  // gray-700
                />
              ) : (
                <Text className="text-gray-700 font-bold text-lg">+</Text>
              )}
            </TouchableOpacity>
          </View>
          
          <Text className="text-dark-100 font-semibold">
            ${(item.price * item.quantity).toFixed(2)}
          </Text>
        </View>
      </View>
      
      {/* Trash Button with Icon */}
      <TouchableOpacity
        onPress={() => removeItem(item.id, item.customizations || [])}
        className="ml-2 p-2"
      >
        {images.trash ? (
          <Image
            source={images.trash}
            className="w-6 h-6"
            resizeMode="contain"
            tintColor="#EF4444" // red-500
          />
        ) : (
          <Text className="text-red-500 text-lg">×</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default CartItem;
// components/MenuCard.tsx
import { useCartStore } from "@/store/cart.store";
import { MenuItem } from "@/type";
import { Image, Text, TouchableOpacity, View } from "react-native";

const MenuCard = ({ item }: { item: MenuItem }) => {
  const { addItem } = useCartStore();

  // Use image_url (created by our mapping) or fallback
  const imageSource = item.image_url || 'https://via.placeholder.com/150';
  
  console.log('🖼️ Rendering item:', item.name, 'Image:', imageSource);

  return (
    <View className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 items-center min-h-[180px]">
      <Image 
        source={{ uri: imageSource }} 
        className="w-24 h-24 rounded-lg mb-2"
        resizeMode="cover"
      />
      <Text className="text-center font-bold text-dark-100 mb-1" numberOfLines={1}>
        {item.name}
      </Text>
      <Text className="text-gray-200 mb-3">${item.price}</Text>
      <TouchableOpacity 
        className="bg-primary px-4 py-2 rounded-full"
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
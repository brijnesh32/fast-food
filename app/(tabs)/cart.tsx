import CartItem from "@/components/CartItem";
import CustomButton from "@/components/CustomButton";
import CustomHeader from "@/components/CustomHeader";
import useCartStore from "@/store/cart.store";
import { useRouter } from "expo-router";
import { Alert, FlatList, Text, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

const PaymentInfoStripe = ({ label, value, labelStyle, valueStyle }: any) => (
  <View className="flex-between flex-row my-1">
    <Text className={`paragraph-medium text-gray-200 ${labelStyle ?? ""}`}>{label}</Text>
    <Text className={`paragraph-bold text-dark-100 ${valueStyle ?? ""}`}>{value}</Text>
  </View>
);

const Cart = () => {
  const { items, getTotalItems, getTotalPrice } = useCartStore();
  const router = useRouter();
  
  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  const handleOrderNow = async () => {
    if (items.length === 0) {
      Alert.alert('Error', 'Your cart is empty');
      return;
    }

    // Navigate to payment screen
    router.push({
      pathname: '/(tabs)/payment',
      params: {
        total: totalPrice.toFixed(2),
        itemsCount: totalItems.toString()
      }
    });
  };

  return (
    <SafeAreaView className="bg-white h-full">
      <FlatList
        data={items}
        renderItem={({ item }) => <CartItem item={item} />}
        keyExtractor={(item) => item.id}
        contentContainerClassName="pb-28 px-5 pt-5"
        ListHeaderComponent={() => <CustomHeader title="Your Cart" />}
        ListEmptyComponent={() => <Text className="text-center text-gray-500 mt-10">Your cart is empty</Text>}
        ListFooterComponent={() => totalItems > 0 && (
          <View className="gap-5">
            <View className="mt-6 border border-gray-200 p-5 rounded-2xl">
              <Text className="h3-bold text-dark-100 mb-5">Order Summary</Text>

              <PaymentInfoStripe label={`Total Items (${totalItems})`} value={`$${totalPrice.toFixed(2)}`} />
              <PaymentInfoStripe label={`Delivery Fee`} value={`$5.00`} />
              <PaymentInfoStripe label={`Discount`} value={`- $0.50`} valueStyle="!text-green-600" />

              <View className="border-t border-gray-300 my-2" />
              <PaymentInfoStripe 
                label={`Total Amount`} 
                value={`$${(totalPrice + 5 - 0.5).toFixed(2)}`} 
                labelStyle="base-bold !text-dark-100" 
                valueStyle="base-bold !text-dark-100 !text-right" 
              />
            </View>

            <CustomButton 
              title={`Pay $${(totalPrice + 5 - 0.5).toFixed(2)}`}
              onPress={handleOrderNow}
              isLoading={false}
              
            />
          </View>
        )}
      />
    </SafeAreaView>
  );
}

export default Cart;
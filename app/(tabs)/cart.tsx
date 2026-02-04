import CartItem from "@/components/CartItem";
import CustomButton from "@/components/CustomButton";
import CustomHeader from "@/components/CustomHeader";
import useCartStore from "@/store/cart.store";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';
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
  const [deliveryOption, setDeliveryOption] = useState<'delivery' | 'dine-in'>('delivery');

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();
  const deliveryFee = deliveryOption === 'delivery' ? 5.00 : 0;
  const discount = 0.50;
  const totalAmount = totalPrice + deliveryFee - discount;

  const handleOrderNow = async () => {
    if (items.length === 0) {
      Alert.alert('Error', 'Your cart is empty');
      return;
    }

    // Navigate to payment screen with delivery option
    router.push({
      pathname: '/(tabs)/payment',
      params: {
        total: totalAmount.toFixed(2),
        itemsCount: totalItems.toString(),
        deliveryOption,
        deliveryFee: deliveryFee.toFixed(2)
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
            {/* Just the two button selection added here */}
            <View className="mt-6">
              <Text className="h3-bold text-dark-100 mb-4">Select Option</Text>
              <View className="flex-row bg-gray-100 p-1 rounded-2xl">
                {/* Delivery Button */}
                <TouchableOpacity
                  className={`flex-1 py-3 rounded-xl ${deliveryOption === 'delivery' ? 'bg-white shadow-sm' : ''}`}
                  onPress={() => setDeliveryOption('delivery')}
                  activeOpacity={0.7}
                >
                  <Text className={`text-center font-semibold ${deliveryOption === 'delivery' ? 'text-black' : 'text-gray-500'}`}>
                    Delivery
                  </Text>
                </TouchableOpacity>

                {/* Dine-in Button */}
                <TouchableOpacity
                  className={`flex-1 py-3 rounded-xl ${deliveryOption === 'dine-in' ? 'bg-white shadow-sm' : ''}`}
                  onPress={() => setDeliveryOption('dine-in')}
                  activeOpacity={0.7}
                >
                  <Text className={`text-center font-semibold ${deliveryOption === 'dine-in' ? 'text-black' : 'text-gray-500'}`}>
                    Dine-in
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View className="border border-gray-200 p-5 rounded-2xl">
              <Text className="h3-bold text-dark-100 mb-5">Order Summary</Text>

              <PaymentInfoStripe label={`Total Items (${totalItems})`} value={`$${totalPrice.toFixed(2)}`} />
              <PaymentInfoStripe
                label={`${deliveryOption === 'delivery' ? 'Delivery Fee' : 'Dine-in Fee'}`}
                value={deliveryOption === 'delivery' ? `$${deliveryFee.toFixed(2)}` : 'Free'}
              />
              <PaymentInfoStripe label={`Discount`} value={`- $${discount.toFixed(2)}`} valueStyle="!text-green-600" />

              <View className="border-t border-gray-300 my-2" />
              <PaymentInfoStripe
                label={`Total Amount`}
                value={`$${totalAmount.toFixed(2)}`}
                labelStyle="base-bold !text-dark-100"
                valueStyle="base-bold !text-dark-100 !text-right"
              />
            </View>

            <CustomButton
              title={`${deliveryOption === 'delivery' ? 'Proceed to Delivery' : 'Proceed to Dine-in'} - $${totalAmount.toFixed(2)}`}
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
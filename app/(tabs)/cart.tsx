import CartItem from "@/components/CartItem";
import CustomButton from "@/components/CustomButton";
import CustomHeader from "@/components/CustomHeader";
import { djangoApi } from "@/lib/api";
import useAuthStore from "@/store/auth.store";
import useCartStore from "@/store/cart.store";
import { useState } from 'react';
import { Alert, FlatList, Text, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

const PaymentInfoStripe = ({ label, value, labelStyle, valueStyle }: any) => (
  <View className="flex-between flex-row my-1">
    <Text className={`paragraph-medium text-gray-200 ${labelStyle ?? ""}`}>{label}</Text>
    <Text className={`paragraph-bold text-dark-100 ${valueStyle ?? ""}`}>{value}</Text>
  </View>
);

const Cart = () => {
  const { items, getTotalItems, getTotalPrice, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  const handleOrderNow = async () => {
    if (items.length === 0) {
      Alert.alert('Error', 'Your cart is empty');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderData = {
        user_email: user?.email || "guest@example.com",
        user_name: user?.name || "Guest User",
        user_phone: user?.phone || "",
        items: items.map(item => ({
          food_id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.image_url || "",
          customizations: item.customizations || []
        })),
        total: totalPrice,
        address: "123 Main St, City, Country", // You can add address input later
        payment_method: "card"
      };

      const result = await djangoApi.createOrder(orderData);
      console.log('✅ Order created in Django:', result);
      
      Alert.alert('Success', `Order #${result.id} created successfully!`);
      clearCart();
    } catch (error: any) {
      console.error('❌ Order failed:', error);
      Alert.alert('Error', 'Failed to create order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
              <Text className="h3-bold text-dark-100 mb-5">Payment Summary</Text>

              <PaymentInfoStripe label={`Total Items (${totalItems})`} value={`$${totalPrice.toFixed(2)}`} />
              <PaymentInfoStripe label={`Delivery Fee`} value={`$5.00`} />
              <PaymentInfoStripe label={`Discount`} value={`- $0.50`} valueStyle="!text-success" />

              <View className="border-t border-gray-300 my-2" />
              <PaymentInfoStripe label={`Total`} value={`$${(totalPrice + 5 - 0.5).toFixed(2)}`} labelStyle="base-bold !text-dark-100" valueStyle="base-bold !text-dark-100 !text-right" />
            </View>

            <CustomButton 
              title={isSubmitting ? "Creating Order..." : "Order Now"} 
              onPress={handleOrderNow}
              isLoading={isSubmitting}
            />
          </View>
        )}
      />
    </SafeAreaView>
  );
}

export default Cart;
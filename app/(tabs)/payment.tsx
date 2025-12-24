import CustomButton from "@/components/CustomButton";
import CustomInput from "@/components/CustomInput";
import { images } from "@/constants"; // Make sure this import exists
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Payment = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [addressError, setAddressError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false); // New state for modal

  const orderTotal = params.total ? parseFloat(params.total as string) : 0;
  const deliveryFee = 5;
  const discount = 0.5;
  const finalTotal = orderTotal + deliveryFee - discount;

  const paymentOptions = [
    { id: "upi", name: "UPI", description: "Google Pay, PhonePe, Paytm" },
    { id: "razorpay", name: "Cards / NetBanking", description: "Fast & secure" },
    { id: "cod", name: "Cash on Delivery", description: "Pay at doorstep" },
  ];

  const validateForm = () => {
    let valid = true;

    if (phone.length < 10) {
      setPhoneError("Enter valid 10-digit number");
      valid = false;
    } else setPhoneError("");

    if (address.length < 10) {
      setAddressError("Enter complete delivery address");
      valid = false;
    } else setAddressError("");

    return valid;
  };

  const handleConfirmOrder = () => {
    if (!selectedPayment) {
      Alert.alert("Payment required", "Select a payment method");
      return;
    }

    if (!validateForm()) return;

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      // Show the success modal instead of Alert
      setShowSuccessModal(true);
    }, 1500);
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    router.replace("/(tabs)"); // Navigate to home tabs
  };

  const isButtonEnabled = selectedPayment && phone && address;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-5 pt-4 pb-2 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-2xl">←</Text>
        </TouchableOpacity>

        <Text className="text-3xl font-bold text-primary mt-2">
          Checkout
        </Text>
      </View>

      <ScrollView className="px-5 mt-6" showsVerticalScrollIndicator={false}>
        {/* Contact Info */}
        <View className="bg-white rounded-2xl p-5 mb-8 shadow-sm">
          <Text className="text-xl font-bold mb-4">Delivery Details</Text>

          <CustomInput
            label="Mobile Number"
            value={phone}
            keyboardType="phone-pad"
            maxLength={10}
            error={phoneError}
            onChangeText={setPhone}
            containerClassName="mb-5"
          />

          <CustomInput
            label="Delivery Address"
            value={address}
            multiline
            numberOfLines={3}
            error={addressError}
            onChangeText={setAddress}
          />
        </View>

        {/* Payment Options */}
        <View className="bg-white rounded-2xl p-5 mb-24 shadow-sm">
          <Text className="text-xl font-bold mb-6">Payment Method</Text>

          {paymentOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              onPress={() => setSelectedPayment(option.id)}
              className={`p-4 rounded-xl mb-4 border ${
                selectedPayment === option.id
                  ? "border-primary bg-primary/10"
                  : "border-gray-200"
              }`}
            >
              <Text className="text-lg font-semibold">{option.name}</Text>
              <Text className="text-gray-400 mt-1">
                {option.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* CTA */}
      <View className="absolute bottom-5 left-0 right-0 bg-white p-5 border-t border-gray-200 shadow-lg">
        <CustomButton
          title={`Pay $${finalTotal.toFixed(2)}`}
          onPress={handleConfirmOrder}
          isLoading={isProcessing}
          style={`py-5 rounded-xl ${
            isButtonEnabled ? "bg-primary" : "bg-gray-300"
          }`}
          textStyle="text-white text-xl font-bold"
        />
      </View>

      {/* Success Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showSuccessModal}
        onRequestClose={handleSuccessClose}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-3xl p-8 items-center w-4/5 max-w-sm">
            {/* Success Image */}
            <Image
              source={images.success} // Make sure this exists in your constants
              className="w-32 h-32 mb-6"
              resizeMode="contain"
            />
            
            {/* Success Title */}
            <Text className="text-2xl font-bold text-primary mb-2">
              Order Confirmed!
            </Text>
            
            {/* Success Message */}
            <Text className="text-gray-600 text-center mb-1">
              Your order has been placed successfully
            </Text>
            {/* OK Button */}
            <TouchableOpacity
              onPress={handleSuccessClose}
              className="bg-primary py-4 px-12 rounded-xl w-full"
            >
              <Text className="text-white text-lg font-bold text-center">
                Continue Shopping
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Payment;
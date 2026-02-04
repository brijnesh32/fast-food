import CustomButton from "@/components/CustomButton";
import CustomInput from "@/components/CustomInput";
import { images } from "@/constants";
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
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // For Dine-in: Restaurant selection and Pincode
  const [restaurant, setRestaurant] = useState("");
  const [pincode, setPincode] = useState("");
  const [restaurantError, setRestaurantError] = useState("");
  const [pincodeError, setPincodeError] = useState("");

  // Get delivery option from cart
  const deliveryOption =
    (params.deliveryOption as "delivery" | "dine-in") || "delivery";
  const orderTotal = params.total ? parseFloat(params.total as string) : 0;
  const deliveryFee = deliveryOption === "delivery" ? 5 : 0;
  const discount = 0.5;
  const finalTotal = orderTotal + deliveryFee - discount;

  // Sample restaurants for dine-in
  const restaurants = [
    {
      id: "1",
      name: "Main Restaurant - Downtown",
      address: "123 Main St, City Center",
    },
    {
      id: "2",
      name: "Food Court - Mall Branch",
      address: "456 Mall Rd, Shopping District",
    },
    {
      id: "3",
      name: "Express Cafe - Station Area",
      address: "789 Station Rd, Transit Hub",
    },
    {
      id: "4",
      name: "Gourmet Kitchen - Uptown",
      address: "101 Uptown Ave, Business District",
    },
  ];

  const paymentOptions = [
    { id: "upi", name: "UPI", description: "Google Pay, PhonePe, Paytm" },
    {
      id: "razorpay",
      name: "Cards / NetBanking",
      description: "Fast & secure",
    },
    { id: "cod", name: "Cash on Delivery", description: "Pay at doorstep" },
  ];

  const validateForm = () => {
    let valid = true;

    // Phone validation (required for both)
    if (phone.length < 10) {
      setPhoneError("Enter valid 10-digit number");
      valid = false;
    } else setPhoneError("");

    if (deliveryOption === "delivery") {
      // Delivery validation
      if (address.length < 10) {
        setAddressError("Enter complete delivery address");
        valid = false;
      } else setAddressError("");

      // Clear dine-in errors
      setRestaurantError("");
      setPincodeError("");
    } else {
      // Dine-in validation
      if (!restaurant) {
        setRestaurantError("Please select a restaurant");
        valid = false;
      } else setRestaurantError("");

      if (pincode.length !== 6) {
        setPincodeError("Enter valid 6-digit pincode");
        valid = false;
      } else setPincodeError("");

      // Clear delivery errors
      setAddressError("");
    }

    return valid;
  };

  const handleConfirmOrder = () => {
    if (!selectedPayment) {
      Alert.alert("Payment required", "Select a payment method"); // Fixed: Using Alert.alert
      return;
    }

    if (!validateForm()) return;

    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setShowSuccessModal(true);
    }, 1500);
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    router.replace("/(tabs)");
  };

  const isButtonEnabled =
    selectedPayment &&
    phone &&
    (deliveryOption === "delivery" ? address : restaurant && pincode);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-5 pt-6 pb-4 bg-white border-b border-gray-200">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 justify-center"
        >
          <Text className="text-2xl text-gray-800">←</Text>
        </TouchableOpacity>

        <Text className="text-3xl font-bold text-primary mt-3">
          {deliveryOption === "delivery" ? "Delivery" : "Dine-in"} Checkout
        </Text>

        <View className="flex-row items-center mt-3">
          <View
            className={`px-4 py-2 rounded-full ${deliveryOption === "delivery" ? "bg-blue-50" : "bg-green-50"}`}
          >
            <Text
              className={`text-base font-semibold ${deliveryOption === "delivery" ? " text-primary-700" : "text-green-700"}`}
            >
              {deliveryOption === "delivery" ? "Home Delivery" : "Dine-in"}
            </Text>
          </View>
          <Text className="ml-3 text-gray-600 text-base">
            {deliveryOption === "delivery"
              ? "30-45 min delivery"
              : "15-20 min preparation"}
          </Text>
        </View>
      </View>

      <ScrollView className="px-5 mt-5" showsVerticalScrollIndicator={false}>
        {/* Contact Info - Always show phone */}
        <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
          <Text className="text-2xl font-bold text-gray-900 mb-5">
            {deliveryOption === "delivery"
              ? "Delivery Details"
              : "Dine-in Details"}
          </Text>

          <View className="mb-5">
            <Text className="text-gray-700 font-medium mb-2 text-base">
              Mobile Number
            </Text>
            <CustomInput
              value={phone}
              keyboardType="phone-pad"
              maxLength={10}
              onChangeText={setPhone}
              placeholder="Enter your 10-digit mobile number"
              containerClassName={phoneError ? "border-red-500" : ""}
            />
            {phoneError ? (
              <Text className="text-red-500 text-sm mt-1">{phoneError}</Text>
            ) : null}
          </View>

          {deliveryOption === "delivery" ? (
            // DELIVERY FIELDS
            <>
              <View className="mb-5">
                <Text className="text-gray-700 font-medium mb-2 text-base">
                  Delivery Address
                </Text>
                <CustomInput
                  value={address}
                  multiline
                  numberOfLines={3}
                  onChangeText={setAddress}
                  placeholder="Enter your complete delivery address with landmarks"
                  containerClassName={addressError ? "border-red-500" : ""}
                />
                {addressError ? (
                  <Text className="text-red-500 text-sm mt-1">
                    {addressError}
                  </Text>
                ) : null}
              </View>

              <View>
                <Text className="text-gray-700 font-medium mb-2 text-base">
                  Pincode
                </Text>
                <CustomInput
                  value={pincode}
                  keyboardType="number-pad"
                  maxLength={6}
                  onChangeText={setPincode}
                  placeholder="Enter 6-digit pincode"
                  containerClassName={pincodeError ? "border-red-500" : ""}
                />
                {pincodeError ? (
                  <Text className="text-red-500 text-sm mt-1">
                    {pincodeError}
                  </Text>
                ) : null}
              </View>
            </>
          ) : (
            // DINE-IN FIELDS
            <>
              <View className="mb-5">
                <Text className="text-gray-700 font-medium mb-3 text-base">
                  Select Restaurant
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="mb-4"
                >
                  <View className="flex-row gap-4">
                    {restaurants.map((rest) => (
                      <TouchableOpacity
                        key={rest.id}
                        onPress={() => setRestaurant(rest.id)}
                        className={`px-5 py-4 rounded-xl border min-w-[220px] ${
                          restaurant === rest.id
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 bg-white"
                        }`}
                      >
                        <Text
                          className={`font-semibold text-lg ${restaurant === rest.id ? "text-primary" : "text-gray-900"}`}
                        >
                          {rest.name}
                        </Text>
                        <Text className="text-gray-500 text-sm mt-2">
                          {rest.address}
                        </Text>
                        {restaurant === rest.id && (
                          <View className="absolute top-3 right-3 w-3 h-3 rounded-full bg-primary"></View>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
                {restaurantError ? (
                  <Text className="text-red-500 text-sm mt-2">
                    {restaurantError}
                  </Text>
                ) : null}
              </View>

              <View>
                <Text className="text-gray-700 font-medium mb-2 text-base">
                  Pincode (for restaurant location)
                </Text>
                <CustomInput
                  value={pincode}
                  keyboardType="number-pad"
                  maxLength={6}
                  onChangeText={setPincode}
                  placeholder="Enter restaurant area pincode"
                  containerClassName={pincodeError ? "border-red-500" : ""}
                />
                {pincodeError ? (
                  <Text className="text-red-500 text-sm mt-1">
                    {pincodeError}
                  </Text>
                ) : null}
              </View>
            </>
          )}
        </View>

        {/* Payment Options */}
        <View className="bg-white rounded-2xl p-6 mb-28 shadow-sm border border-gray-100">
          <Text className="text-2xl font-bold text-gray-900 mb-6">
            Payment Method
          </Text>

          {paymentOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              onPress={() => setSelectedPayment(option.id)}
              className={`p-5 rounded-xl mb-4 border ${
                selectedPayment === option.id
                  ? "border-primary bg-primary/5"
                  : "border-gray-200"
              }`}
            >
              <View className="flex-row justify-between items-center">
                <View>
                  <Text className="text-lg font-semibold text-gray-900">
                    {option.name}
                  </Text>
                  <Text className="text-gray-500 mt-1 text-sm">
                    {option.description}
                  </Text>
                </View>
                <View
                  className={`w-6 h-6 rounded-full border-2 ${
                    selectedPayment === option.id
                      ? "border-primary bg-primary"
                      : "border-gray-300"
                  }`}
                >
                  {selectedPayment === option.id && (
                    <View className="w-3 h-3 rounded-full bg-white m-auto"></View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* CTA */}
      <View className="absolute bottom-0 left-0 right-0 bg-white pt-5 px-5 pb-8 border-t border-gray-200 shadow-lg">
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-lg font-semibold text-gray-700">
              {deliveryOption === "delivery"
                ? "Delivery Total"
                : "Dine-in Total"}
            </Text>
            <Text className="text-gray-500 text-sm mt-1">
              {deliveryFee > 0
                ? `Includes $${deliveryFee} delivery fee`
                : "No delivery fee"}
            </Text>
          </View>
          <Text className="text-3xl font-bold text-primary">
            ${finalTotal.toFixed(2)}
          </Text>
        </View>

        <View className={`${!isButtonEnabled ? "opacity-50" : ""}`}>
          <CustomButton
            title={
              deliveryOption === "delivery"
                ? "Confirm Delivery Order"
                : "Confirm Dine-in Order"
            }
            onPress={handleConfirmOrder}
            isLoading={isProcessing}
            style={`py-4 rounded-xl ${isButtonEnabled ? "bg-primary" : "bg-gray-200"}`}
            textStyle="text-white text-lg font-semibold"
          />
        </View>
      </View>

      {/* Success Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showSuccessModal}
        onRequestClose={handleSuccessClose}
      >
        <View className="flex-1 justify-center items-center bg-black/60">
          <View className="bg-white rounded-3xl p-8 items-center w-4/5 max-w-sm">
            {/* Success Checkmark Image */}
            <Image
              source={images.success} // Make sure this exists in your constants
              className="w-24 h-24 mb-6"
              resizeMode="contain"
            />

            {/* Success Title */}
            <Text className="text-2xl font-bold text-gray-900 mb-3">
              Order Confirmed
            </Text>

            {/* Order Successfully Message */}
            <Text className="text-gray-600 text-center text-base mb-1">
              Order booked successfully
            </Text>

            {/* Order ID (you can generate a real one if needed) */}
            <Text className="text-gray-500 text-center text-sm mb-6">
              Order ID: #{Math.floor(100000 + Math.random() * 900000)}
            </Text>

            {/* OK Button */}
            <TouchableOpacity
              onPress={handleSuccessClose}
              className="bg-primary py-4 px-12 rounded-xl w-full"
            >
              <Text className="text-white text-lg font-semibold text-center">
                OK
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Payment;

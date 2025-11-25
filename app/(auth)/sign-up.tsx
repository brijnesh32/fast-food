// app/(auth)/sign-up.tsx
import CustomButton from "@/components/CustomButton";
import CustomInput from "@/components/CustomInput";
import useAuthStore from "@/store/auth.store";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Text, View } from 'react-native';

const SignUp = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const router = useRouter();
  const register = useAuthStore((s) => s.register);

  const submit = async () => {
    const { name, email, password } = form;
    if (!name || !email || !password) return Alert.alert('Error', 'Please enter valid details');
    setIsSubmitting(true);
    try {
      const res = await register(name, email, password);
      if (!res.ok) return Alert.alert('Error', res.message || 'Register failed');
      router.replace('/');
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Registration failed');
    } finally { setIsSubmitting(false); }
  };

  return (
    <View className="gap-10 bg-white rounded-lg p-5 mt-5">
      <CustomInput placeholder="Enter your full name" value={form.name} onChangeText={(t) => setForm((p) => ({ ...p, name: t }))} label="Full name" />
      <CustomInput placeholder="Enter your email" value={form.email} onChangeText={(t) => setForm((p) => ({ ...p, email: t }))} label="Email" keyboardType="email-address" />
      <CustomInput placeholder="Enter your password" value={form.password} onChangeText={(t) => setForm((p) => ({ ...p, password: t }))} label="Password" secureTextEntry />
      <CustomButton title="Sign Up" isLoading={isSubmitting} onPress={submit} />
      <View className="flex justify-center mt-5 flex-row gap-2">
        <Text className="base-regular text-gray-100">Already have an account?</Text>
        <Text onPress={() => router.push('/sign-in')} className="base-bold text-primary"> Sign In</Text>
      </View>
    </View>
  );
};

export default SignUp;

import CustomButton from '@/components/CustomButton';
import CustomInput from '@/components/CustomInput';
import useAuthStore from '@/store/auth.store';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Text, View } from 'react-native';

const SignIn = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const submit = async () => {
    const { email, password } = form;
    if (!email || !password) {
      Alert.alert('Error', 'Please enter valid details');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const res = await login(email, password);
      if (!res.ok) {
        Alert.alert('Error', res.message || 'Login failed');
        return;
      }
      console.log('Login successful');
    } catch (error: any) {
      Alert.alert('Error', error?.message ?? 'Failed to login');
    } finally { 
      setIsSubmitting(false); 
    }
  };

  return (
    <View className="gap-10 bg-white rounded-lg p-5 mt-5">
      <CustomInput 
        placeholder="Enter your email" 
        value={form.email} 
        onChangeText={(text) => setForm((p) => ({ ...p, email: text.trim() }))} 
        label="Email" 
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <CustomInput 
        placeholder="Enter your password" 
        value={form.password} 
        onChangeText={(text) => setForm((p) => ({ ...p, password: text }))} 
        label="Password" 
        secureTextEntry 
      />
      
      <CustomButton 
        title="Sign-In" 
        isLoading={isSubmitting} 
        onPress={submit} 
      />
      
      <View className='flex justify-center mt-5 flex-row gap-2'>
        <Text className="base-regular text-gray-100">Don't have an account?</Text>
        <Text 
          onPress={() => router.push('/(auth)/sign-up')} 
          className='base-bold text-primary'
        >
          Sign-Up
        </Text>
      </View>
    </View>
  );
};

export default SignIn;
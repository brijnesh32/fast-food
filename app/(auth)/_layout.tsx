import "@/app/globals.css";
import { images } from '@/constants';
import { Slot } from 'expo-router';
import { Dimensions, Image, ImageBackground, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

export default function AuthLayout() {
  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView 
        className="bg-white h-full" 
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View className="w-full relative" style={{ height: Dimensions.get('screen').height / 2.25 }}>
          <ImageBackground 
            source={images.loginGraphic} 
            className="size-full rounded-b-lg" 
            resizeMode="stretch" 
          />
          <Image 
            source={images.logo} 
            className="self-center size-48 absolute -bottom-16 z-10" 
            resizeMode="contain"
          />
        </View>
        
        <View className="flex-1 px-5 pb-10">
          <Slot />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
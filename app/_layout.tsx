// app/_layout.tsx - CORRECT VERSION (fonts only here)
import useAuthStore from "@/store/auth.store";
import { useFonts } from "expo-font";
import { SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";

export default function RootLayout() {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();

  // Load fonts ONLY in root layout
  const [fontsLoaded, fontError] = useFonts({
    "Quicksand-Bold": require("@/assets/fonts/Quicksand-Bold.ttf"),
    "Quicksand-Medium": require("@/assets/fonts/Quicksand-Medium.ttf"),
    "Quicksand-Regular": require("@/assets/fonts/Quicksand-Regular.ttf"),
    "Quicksand-SemiBold": require("@/assets/fonts/Quicksand-SemiBold.ttf"),
    "Quicksand-Light": require("@/assets/fonts/Quicksand-Light.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
      checkAuth();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    if (!fontsLoaded || isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    
    console.log("Auth check:", { 
      isAuthenticated, 
      inAuthGroup, 
      segment: segments[0],
      isLoading 
    });
    
    if (!isAuthenticated && !inAuthGroup) {
      console.log("Redirecting to sign-in");
      router.replace('/(auth)/sign-in');
    } else if (isAuthenticated && inAuthGroup) {
      console.log("Redirecting to tabs");
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, segments, fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
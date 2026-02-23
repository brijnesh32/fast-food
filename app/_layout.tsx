// app/_layout.tsx - WITH BACKGROUND PRELOADING
import { getMenu } from "@/lib/api";
import useAuthStore from "@/store/auth.store";
import { useFonts } from "expo-font";
import { SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { Image } from "react-native";

export default function RootLayout() {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();

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

      // 🚀 BACKGROUND IMAGE PRELOADING
      const preloadPopularFoods = async () => {
        try {
          const foods = await getMenu({ limit: 10 });
          if (foods && foods.length > 0) {
            const urls = foods
              .map((f) => f.image_url || f.image)
              .filter((url) => url && typeof url === "string");

            urls.forEach((url) => Image.prefetch(url));
            console.log(`🖼️ Background preloaded ${urls.length} images`);
          }
        } catch (error) {
          // Silently fail - not critical
        }
      };

      preloadPopularFoods();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    if (!fontsLoaded || isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";

    console.log("Auth check:", {
      isAuthenticated,
      inAuthGroup,
      segment: segments[0],
      isLoading,
    });

    if (!isAuthenticated && !inAuthGroup) {
      console.log("Redirecting to sign-in");
      router.replace("/(auth)/sign-in");
    } else if (isAuthenticated && inAuthGroup) {
      console.log("Redirecting to tabs");
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, isLoading, segments, fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

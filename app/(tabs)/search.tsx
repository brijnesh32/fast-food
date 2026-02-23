// app/(tabs)/search.tsx - OPTIMIZED WITH IMAGE PRELOADING
import CartButton from "@/components/CartButton";
import Filter from "@/components/Filter";
import MenuCard from "@/components/MenuCard";
import SearchBar from "@/components/SearchBar";
import { clearFoodCache, getCategories, getMenu } from "@/lib/api";
import { MenuItem } from "@/type";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Helper function to preload images
const preloadImages = (items: any[], count: number = 6) => {
  const imagesToLoad = items
    .slice(0, count)
    .map((item) => item.image_url || item.image)
    .filter((url) => url && typeof url === "string");

  imagesToLoad.forEach((url) => {
    Image.prefetch(url);
  });

  console.log(`🖼️ Preloaded ${imagesToLoad.length} images`);
};

const Search = () => {
  const { category, query } = useLocalSearchParams<{
    query?: string;
    category?: string;
  }>();
  const router = useRouter();
  const [allItems, setAllItems] = useState<MenuItem[]>([]);
  const [displayItems, setDisplayItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        console.log("🚀 Initial data load...");
        const [menuData, categoriesData] = await Promise.all([
          getMenu({ limit: 12 }),
          getCategories(),
        ]);

        console.log("✅ Initial data loaded:", menuData?.length || 0, "items");

        setAllItems(Array.isArray(menuData) ? menuData : []);
        setDisplayItems(Array.isArray(menuData) ? menuData : []);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);

        // 🚀 PRELOAD FIRST 6 IMAGES
        if (menuData && menuData.length > 0) {
          preloadImages(menuData, 6);
        }
      } catch (error) {
        console.log("❌ Error in loadInitialData:", error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Filter items when category or query changes
  useEffect(() => {
    if (allItems.length === 0) return;

    console.log(
      "🔍 Applying local filters... Category:",
      category,
      "Query:",
      query,
    );

    let filteredItems = [...allItems];

    // Filter by category
    if (category && category !== "all") {
      filteredItems = filteredItems.filter(
        (item) => item.category?.id === category,
      );
    }

    // Filter by search query
    if (query) {
      filteredItems = filteredItems.filter(
        (item) =>
          item.name?.toLowerCase().includes(query.toLowerCase()) ||
          item.description?.toLowerCase().includes(query.toLowerCase()),
      );
    }

    const limit = 12;
    if (filteredItems.length > limit) {
      filteredItems = filteredItems.slice(0, limit);
    }

    console.log("✅ Local filter applied:", filteredItems.length, "items");
    setDisplayItems(filteredItems);

    // 🚀 PRELOAD FILTERED IMAGES
    if (filteredItems.length > 0) {
      preloadImages(filteredItems, 6);
    }
  }, [category, query, allItems]);

  const handleRefresh = async () => {
    try {
      setLoading(true);
      console.log("🔄 Manually refreshing data...");
      clearFoodCache();

      const [menuData, categoriesData] = await Promise.all([
        getMenu({ limit: 12 }),
        getCategories(),
      ]);

      setAllItems(Array.isArray(menuData) ? menuData : []);
      setDisplayItems(Array.isArray(menuData) ? menuData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);

      // 🚀 PRELOAD ON REFRESH
      if (menuData && menuData.length > 0) {
        preloadImages(menuData, 6);
      }
    } catch (error) {
      console.log("❌ Refresh error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Memoized render function for better performance
  const renderItem = useCallback(
    ({ item, index }: { item: MenuItem; index: number }) => {
      const isFirstRightColItem = index % 2 === 0;
      return (
        <TouchableOpacity
          key={item.id || `item-${index}`}
          className={
            isFirstRightColItem
              ? "flex-1 max-w-[48%] mt-0"
              : "flex-1 max-w-[48%] mt-10"
          }
          onPress={() => {
            router.push({
              pathname: "/(tabs)/product-details",
              params: {
                id: item.id,
                name: item.name,
                price: item.price?.toString() || "0",
                image: item.image,
                description: item.description,
                rating: item.rating?.toString() || "4.5",
                calories: item.calories?.toString() || "0",
                protein: item.protein?.toString() || "0",
                cookingTime: item.cooking_time || "15-20 mins",
                category: item.category?.name || "Fast Food",
                isVeg: item.is_veg ? "true" : "false",
                ingredients: item.ingredients
                  ? JSON.stringify(item.ingredients)
                  : "[]",
                customizations: item.customizations
                  ? JSON.stringify(item.customizations)
                  : "[]",
                categoryId: item.category?.id || "",
              },
            });
          }}
          activeOpacity={0.7}
        >
          <MenuCard item={item} />
        </TouchableOpacity>
      );
    },
    [],
  );

  if (loading && allItems.length === 0) {
    return (
      <SafeAreaView className="bg-white h-full justify-center items-center">
        <ActivityIndicator size="large" color="#FE8C00" />
        <Text className="mt-4 text-lg">Loading delicious food...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-white h-full">
      {/* Fixed Header Section */}
      <View className="bg-white pt-6 pb-5 px-5">
        <View className="flex-row justify-between items-center w-full mb-4">
          <View>
            <Text className="text-sm font-bold uppercase text-primary">
              Search
            </Text>
            <View className="flex-row gap-x-1 mt-1">
              <Text className="text-base font-semibold text-dark-100">
                {query
                  ? `Search results for "${query}"`
                  : "Find your favorite food"}
              </Text>
            </View>
          </View>
          <CartButton />
        </View>

        <SearchBar />
        <Filter categories={categories} />
      </View>

      {/* Scrollable Food Items Grid */}
      <FlatList
        data={displayItems}
        renderItem={renderItem}
        keyExtractor={(item: MenuItem) => item.id || `item-${item.name}`}
        numColumns={2}
        columnWrapperClassName="gap-4 justify-between"
        contentContainerClassName="gap-4 px-5 pb-32"
        showsVerticalScrollIndicator={false}
        initialNumToRender={4}
        maxToRenderPerBatch={6}
        windowSize={5}
        removeClippedSubviews={true}
        ListEmptyComponent={
          <View className="py-10">
            <Text className="text-center text-gray-500 text-lg">
              {loading ? "Loading..." : "No food items found"}
            </Text>
            {query && (
              <Text className="text-center text-gray-400 mt-2">
                Try a different search term
              </Text>
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default Search;

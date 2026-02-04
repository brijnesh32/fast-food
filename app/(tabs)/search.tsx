// app/(tabs)/search.tsx
import CartButton from "@/components/CartButton";
import Filter from "@/components/Filter";
import MenuCard from "@/components/MenuCard";
import SearchBar from "@/components/SearchBar";
import { clearFoodCache, getCategories, getMenu } from "@/lib/api";
import { MenuItem } from "@/type";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
      } catch (error) {
        console.log("❌ Error in loadInitialData:", error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

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
    } catch (error) {
      console.log("❌ Refresh error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && allItems.length === 0) {
    return (
      <SafeAreaView className="bg-white h-full justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="mt-4 text-lg">Loading menu...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-white h-full">
      <FlatList
        data={displayItems}
        renderItem={({ item, index }) => {
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
                    // Optional: Pass category ID as well
                    categoryId: item.category?.id || "",
                  },
                });
              }}
              activeOpacity={0.7}
            >
              <MenuCard item={item} />
            </TouchableOpacity>
          );
        }}
        keyExtractor={(item: MenuItem) => item.id || `item-${item.name}`}
        numColumns={2}
        columnWrapperClassName="gap-4 justify-between"
        contentContainerClassName="gap-4 px-5 pb-32"
        ListHeaderComponent={
          <View className="my-5 gap-5">
            <View className="flex-row justify-between items-center w-full">
              <View>
                <Text className="text-sm font-bold uppercase text-primary">
                  Search
                </Text>
                <View className="flex-row gap-x-1 mt-1">
                  <Text className="text-base font-semibold text-dark-100">
                    Find your favorite food
                  </Text>
                </View>
              </View>
              <CartButton />
            </View>

            <SearchBar />
            <Filter categories={categories} />
          </View>
        }
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

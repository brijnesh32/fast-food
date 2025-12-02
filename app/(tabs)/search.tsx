import CartButton from "@/components/CartButton";
import Filter from "@/components/Filter";
import MenuCard from "@/components/MenuCard";
import SearchBar from "@/components/SearchBar";
import { getCategories, getMenu, seedDatabase } from "@/lib/api";
import { MenuItem } from "@/type";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Search = () => {
  const { category, query } = useLocalSearchParams<{query?: string; category?: string}>();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [category, query]);

  const fetchData = async () => {
    setLoading(true);
    try {
      console.log('🔄 Fetching data...');
      const [menuData, categoriesData] = await Promise.all([
        getMenu({ category, query, limit: 12 }),
        getCategories()
      ]);
      
      console.log('✅ Menu data received:', menuData?.length || 0, 'items');
      console.log('✅ Categories data received:', categoriesData?.length || 0, 'categories');
      
      setItems(Array.isArray(menuData) ? menuData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error) {
      console.log('❌ Error in fetchData:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedDatabase = async () => {
    try {
      console.log('🌱 Seeding database...');
      await seedDatabase();
      console.log('✅ Database seeded! Reloading data...');
      // Reload the data after seeding
      await fetchData();
    } catch (error) {
      console.log('❌ Seed failed:', error);
    }
  };

  console.log('📊 Current state - Items:', items.length, 'Loading:', loading);

  if (loading && items.length === 0) {
    return (
      <SafeAreaView className="bg-white h-full justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="mt-4 text-lg">Loading menu...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="bg-white h-full">
      {/* Demo data notice */}
      {items.length > 0 && (
        <View className="bg-blue-100 p-2 mx-5 mt-2 rounded-lg">
          <Text className="text-blue-800 text-center text-xs">
            Showing {items.length} food items
          </Text>
          <TouchableOpacity onPress={handleSeedDatabase} className="mt-1">
            <Text className="text-green-600 text-center text-xs font-bold">
              Tap to load REAL food data 🌱
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={items}
        renderItem={({ item, index }) => {
          const isFirstRightColItem = index % 2 === 0;
          return (
            <View 
              key={item.id || `item-${index}`}
              className={isFirstRightColItem ? "flex-1 max-w-[48%] mt-0" : "flex-1 max-w-[48%] mt-10"}
            >
              <MenuCard item={item} />
            </View>
          );
        }}
        keyExtractor={(item: MenuItem, index) => item.id || `item-${index}`}
        numColumns={2}
        columnWrapperClassName="gap-4 justify-between"
        contentContainerClassName="gap-4 px-5 pb-32"
        ListHeaderComponent={
          <View className="my-5 gap-5">
            <View className="flex-row justify-between items-center w-full">
              <View>
                <Text className="text-sm font-bold uppercase text-primary">Search</Text>
                <View className="flex-row gap-x-1 mt-1">
                  <Text className="text-base font-semibold text-dark-100">Find your favorite food</Text>
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
              {loading ? 'Loading...' : 'No food items found'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default Search;
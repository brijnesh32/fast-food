import CartButton from "@/components/CartButton";
import Filter from "@/components/Filter";
import MenuCard from "@/components/MenuCard";
import SearchBar from "@/components/SearchBar";
import { clearFoodCache, getCategories, getMenu } from "@/lib/api";
import { MenuItem } from "@/type";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Search = () => {
  const { category, query } = useLocalSearchParams<{query?: string; category?: string}>();
  const [allItems, setAllItems] = useState<MenuItem[]>([]); // Store ALL items
  const [displayItems, setDisplayItems] = useState<MenuItem[]>([]); // Items to display
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data on first render
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        console.log('🚀 Initial data load...');
        const [menuData, categoriesData] = await Promise.all([
          getMenu({ limit: 12 }), // Load all items once
          getCategories()
        ]);
        
        console.log('✅ Initial data loaded:', menuData?.length || 0, 'items');
        
        // Store ALL items separately
        setAllItems(Array.isArray(menuData) ? menuData : []);
        // Initially display ALL items
        setDisplayItems(Array.isArray(menuData) ? menuData : []);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } catch (error) {
        console.log('❌ Error in loadInitialData:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []); // Empty dependency array - runs only once

  // Filter items locally when category or query changes
  useEffect(() => {
    if (allItems.length === 0) return;
    
    console.log('🔍 Applying local filters... Category:', category, 'Query:', query);
    
    // Start with ALL items every time
    let filteredItems = [...allItems];
    
    // Filter by category
    if (category && category !== 'all') {
      filteredItems = filteredItems.filter(item => 
        item.category?.id === category
      );
    }
    
    // Filter by search query
    if (query) {
      filteredItems = filteredItems.filter(item => 
        item.name?.toLowerCase().includes(query.toLowerCase()) ||
        item.description?.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    // Apply limit
    const limit = 12;
    if (filteredItems.length > limit) {
      filteredItems = filteredItems.slice(0, limit);
    }
    
    console.log('✅ Local filter applied:', filteredItems.length, 'items (out of', allItems.length, 'total)');
    setDisplayItems(filteredItems);
    
  }, [category, query, allItems]); // Re-filter when these change

  const handleRefresh = async () => {
    try {
      setLoading(true);
      console.log('🔄 Manually refreshing data...');
      clearFoodCache(); // Clear cache
      
      const [menuData, categoriesData] = await Promise.all([
        getMenu({ limit: 12 }),
        getCategories()
      ]);
      
      // Update both arrays
      setAllItems(Array.isArray(menuData) ? menuData : []);
      setDisplayItems(Array.isArray(menuData) ? menuData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error) {
      console.log('❌ Refresh error:', error);
    } finally {
      setLoading(false);
    }
  };

  console.log('📊 Current state - All items:', allItems.length, 'Display items:', displayItems.length, 'Loading:', loading);

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
      {/* Status bar */}
      <View className="bg-blue-100 p-2 mx-5 mt-2 rounded-lg flex-row justify-between items-center">
        <Text className="text-blue-800 text-xs">
          Showing {displayItems.length} of {allItems.length} items 
          {category && category !== 'all' ? ` • Filtered by: ${category}` : ''}
          {query ? ` • Search: "${query}"` : ''}
        </Text>
        <TouchableOpacity onPress={handleRefresh} className="bg-blue-500 px-3 py-1 rounded">
          <Text className="text-white text-xs">Refresh</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={displayItems}
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
        keyExtractor={(item: MenuItem) => item.id || `item-${item.name}`}
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
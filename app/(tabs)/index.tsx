import CartButton from "@/components/CartButton";
import { offers } from "@/constants";
import { djangoApi } from "@/lib/api";
import cn from "clsx";
import { useEffect, useState } from "react";
import { FlatList, Image, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const [categories, setCategories] = useState<any[]>([]);
  const [foods, setFoods] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesData, foodsData] = await Promise.all([
          djangoApi.getCategories(),
          djangoApi.getFoods()
        ]);
        setCategories(categoriesData);
        setFoods(foodsData);
        console.log('Home data loaded:', { categories: categoriesData.length, foods: foodsData.length });
      } catch (error) {
        console.log('Failed to load home data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <FlatList
        data={offers}
        renderItem={({ item, index }) => {
          const isEven = index % 2 === 0;
          return (
            <View>
              <Pressable
                className={cn("offer-card", isEven ? "flex-row-reverse" : "flex-row")}
                style={{ backgroundColor: item.color }}
                android_ripple={{ color: "#ffffff22" }}
              >
                <View className={"h-full w-1/2"}>
                  <Image source={item.image} className={"size-full"} resizeMode={"contain"} />
                </View>

                <View className={cn("offer-card__info", isEven ? "pl-10" : "pr-10")}>
                  <Text className="h1-bold text-white leading-tight">{item.title}</Text>

                  <Image
                    source={require("../../assets/icons/arrow-right.png")}
                    className="size-10"
                    resizeMode="contain"
                  />
                </View>
              </Pressable>
            </View>
          );
        }}
        contentContainerClassName="pb-28 px-5"
        ListHeaderComponent={() => (
          <View className="flex-between flex-row w-full my-5">
            <View className="flex-start">
              <Text className="small-bold text-primary">DELIVER TO</Text>
              <View className="flex-start flex-row gap-x-1 mt-0.5">
                <Text className="paragraph-bold text-dark-100">Croatia</Text>
              </View>
            </View>
            <CartButton />
          </View>
        )}
      />
    </SafeAreaView>
  );
}
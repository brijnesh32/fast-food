import { Category } from "@/type";
import cn from "clsx";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { FlatList, Platform, Text, TouchableOpacity } from "react-native";

const Filter = ({ categories }: { categories: Category[] }) => {
    const searchParams = useLocalSearchParams();
    const [active, setActive] = useState(searchParams.category || "");

    const handlePress = (id: string) => {
        setActive(id);

        if (id === "all") {
            router.setParams({ category: undefined });
        } else {
            router.setParams({ category: id });
        }
    };

    const filterData: (Category | { _id: string; name: string })[] = categories
        ? [{ _id: "all", name: "All" }, ...categories]
        : [{ _id: "all", name: "All" }];

    return (
        <FlatList
            data={filterData}
            keyExtractor={(item: any) => item._id || item.$id || item.id || "all"}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-x-2 pb-3"
            renderItem={({ item }: any) => {
                const id = item._id || item.$id || item.id || "all";
                const name = item.name || "All";
                
                return (
                    <TouchableOpacity
                        key={id} // Add this key prop
                        className={cn(
                            "px-4 py-2 rounded-full border border-gray-200",
                            active === id ? "bg-primary border-primary" : "bg-white"
                        )}
                        style={
                            Platform.OS === "android"
                                ? { elevation: 5, shadowColor: "#878787" }
                                : {}
                        }
                        onPress={() => handlePress(id)}
                    >
                        <Text
                            className={cn(
                                "text-sm font-medium",
                                active === id ? "text-white" : "text-gray-700"
                            )}
                        >
                            {name}
                        </Text>
                    </TouchableOpacity>
                );
            }}
        />
    );
};

export default Filter;
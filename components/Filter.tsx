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
            keyExtractor={(item: any) => item._id || item.$id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-x-2 pb-3"
            renderItem={({ item }: any) => {
                const id = item._id || item.$id;
                return (
                    <TouchableOpacity
                        key={id}
                        className={cn(
                            "filter",
                            active === id ? "bg-amber-500" : "bg-white"
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
                                "body-medium",
                                active === id ? "text-white" : "text-gray-200"
                            )}
                        >
                            {item.name}
                        </Text>
                    </TouchableOpacity>
                );
            }}
        />
    );
};

export default Filter;

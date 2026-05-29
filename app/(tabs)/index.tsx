import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { useMemo, useState } from "react";

import Ionicons from "@expo/vector-icons/Ionicons";

import { router } from "expo-router";

import { StatusBar } from "expo-status-bar";

import { CATEGORIES } from "../../constants/categories";

import Colors from "../../constants/Colors";

import { RESTAURANTS } from "../../data/restaurants";

type Restaurant = {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  minOrder: number;
  image: string;
  menu: any[];
};

export default function HomeScreen() {
  const [search, setSearch] = useState("");

  const [selectedCategory, setSelectedCategory] = useState("All");

  // FILTERING

  const filteredRestaurants = useMemo(() => {
    return RESTAURANTS.filter((restaurant) => {
      const matchesSearch = restaurant.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" || restaurant.cuisine === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [search, selectedCategory]);

  // RENDER RESTAURANT

  const renderRestaurant = ({ item }: { item: Restaurant }) => {
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => router.push(`/restaurant/${item.id}`)}
      >
        <Image source={{ uri: item.image }} style={styles.cardImage} />

        <View style={styles.cardContent}>
          <View style={styles.rowBetween}>
            <Text style={styles.restaurantName}>{item.name}</Text>

            <Text style={styles.rating}>⭐ {item.rating}</Text>
          </View>

          <Text style={styles.cuisine}>{item.cuisine}</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoText}>⏱ {item.deliveryTime}</Text>

            <Text style={styles.infoText}>🚚 {item.deliveryFee}€</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <StatusBar style="light" />

      <SafeAreaView style={styles.container} edges={["top"]}>
        <FlatList
          data={filteredRestaurants}
          keyExtractor={(item) => item.id}
          renderItem={renderRestaurant}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 120,
            paddingTop: 10,
          }}
          ListHeaderComponent={
            <>
              {/* HEADER */}

              <View style={styles.header}>
                <View style={styles.locationContainer}>
                  <Ionicons name="location" size={28} color={Colors.primary} />

                  <View style={styles.locationTextContainer}>
                    <Text style={styles.deliverText}>Deliver to</Text>

                    <Text style={styles.location}>Tunis Centre</Text>
                  </View>
                </View>

                <View style={styles.notificationButton}>
                  <Ionicons
                    name="notifications-outline"
                    size={24}
                    color={Colors.primary}
                  />
                </View>
              </View>

              {/* SEARCH */}

              <View style={styles.searchContainer}>
                <Ionicons name="search" size={22} color={Colors.gray} />

                <TextInput
                  placeholder="Search restaurant or cuisine"
                  value={search}
                  onChangeText={setSearch}
                  style={styles.searchInput}
                  placeholderTextColor="#999"
                />
              </View>

              {/* CATEGORIES */}

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                bounces={false}
                style={styles.categoriesScroll}
                contentContainerStyle={styles.categoriesContainer}
              >
                {CATEGORIES.map((category) => {
                  const isActive = selectedCategory === category;

                  return (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryPill,

                        isActive && styles.activeCategoryPill,
                      ]}
                      onPress={() => setSelectedCategory(category)}
                    >
                      <Text
                        style={[
                          styles.categoryText,

                          isActive && styles.activeCategoryText,
                        ]}
                      >
                        {category}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* TITLE */}

              <Text style={styles.sectionTitle}>Popular Restaurants</Text>
            </>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🍽️</Text>

              <Text style={styles.emptyTitle}>No restaurants found</Text>

              <Text style={styles.emptySubtitle}>
                Try another search or category
              </Text>
            </View>
          }
        />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // HEADER

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    marginTop: 10,
  },

  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  locationTextContainer: {
    marginLeft: 8,
  },

  deliverText: {
    color: Colors.gray,
    fontSize: 14,
  },

  location: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text,
    marginTop: 4,
  },

  notificationButton: {
    width: 46,
    height: 46,
    borderRadius: 23,

    backgroundColor: "#F3F3F3",

    justifyContent: "center",
    alignItems: "center",
  },

  // SEARCH

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#F3F3F3",

    borderRadius: 16,

    paddingHorizontal: 16,

    marginTop: 20,
  },

  searchInput: {
    flex: 1,

    paddingVertical: 14,
    paddingLeft: 10,

    fontSize: 16,
    color: Colors.text,
  },

  // CATEGORIES

  categoriesScroll: {
    marginTop: 20,
    maxHeight: 60,
  },

  categoriesContainer: {
    paddingRight: 20,
  },

  categoryPill: {
    width: 100,
    height: 45,

    backgroundColor: "#F3F3F3",

    borderRadius: 14,

    marginRight: 12,

    justifyContent: "center",
    alignItems: "center",
  },

  activeCategoryPill: {
    backgroundColor: Colors.primary,
  },

  categoryText: {
    color: Colors.text,
    fontWeight: "600",
    fontSize: 16,
  },

  activeCategoryText: {
    color: "white",
  },

  // SECTION

  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",

    marginTop: 24,
    marginBottom: 18,

    color: Colors.text,
  },

  // CARD

  card: {
    backgroundColor: "white",

    borderRadius: 22,

    overflow: "hidden",

    marginBottom: 20,

    borderWidth: 1,
    borderColor: Colors.border,
  },

  cardImage: {
    width: "100%",
    height: 190,
  },

  cardContent: {
    padding: 16,
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  restaurantName: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text,

    flex: 1,
    marginRight: 10,
  },

  rating: {
    fontSize: 15,
    fontWeight: "700",
  },

  cuisine: {
    marginTop: 8,
    color: Colors.gray,
    fontSize: 15,
  },

  infoRow: {
    flexDirection: "row",
    marginTop: 14,
    gap: 18,
  },

  infoText: {
    color: Colors.gray,
    fontSize: 14,
  },

  // EMPTY

  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",

    paddingTop: 100,
  },

  emptyIcon: {
    fontSize: 70,
    marginBottom: 20,
  },

  emptyTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text,
  },

  emptySubtitle: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.gray,
  },
});

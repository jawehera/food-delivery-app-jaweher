import {
    Image,
    SectionList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { useMemo, useState } from "react";

import Ionicons from "@expo/vector-icons/Ionicons";

import { router, useLocalSearchParams } from "expo-router";

import Colors from "../../constants/Colors";
import { useCart } from "../../context/CartContext";
import { RESTAURANTS } from "../../data/restaurants";

type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
};

type MenuSection = {
  category: string;
  items: MenuItem[];
};

export default function RestaurantScreen() {
  const { id } = useLocalSearchParams();

  const [search, setSearch] = useState("");
  const { items, addItem, updateQty, cartCount, cartTotal } = useCart();

  const restaurant = RESTAURANTS.find((item) => item.id === id);

  if (!restaurant) {
    return (
      <SafeAreaView style={styles.center}>
        <Text>Restaurant not found</Text>
      </SafeAreaView>
    );
  }

  // FILTER + SECTION LIST

  const sections = useMemo(() => {
    return restaurant.menu
      .map((section: MenuSection) => ({
        title: section.category,

        data: section.items.filter((item: MenuItem) =>
          item.name.toLowerCase().includes(search.toLowerCase()),
        ),
      }))
      .filter((section) => section.data.length > 0);
  }, [restaurant.menu, search]);

  const renderMenuItem = ({ item }: { item: MenuItem }) => {
    const cartItem = items.find((cartItem) => cartItem.id === item.id);

    return (
      <View style={styles.menuItem}>
        <Image
          source={{
            uri:
              item.image ||
              "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
          }}
          style={styles.menuImage}
        />

        <View style={styles.menuContent}>
          <Text style={styles.menuName}>{item.name}</Text>

          <Text style={styles.menuDescription} numberOfLines={1}>
            {item.description}
          </Text>

          <Text style={styles.menuPrice}>{item.price.toFixed(2)}€</Text>
        </View>

        {/* RIGHT SIDE */}

        {cartItem ? (
          <View style={styles.qtyContainer}>
            <TouchableOpacity
              style={styles.qtyButton}
              onPress={() => updateQty(item.id, cartItem.quantity - 1)}
            >
              <Ionicons name="remove" size={18} color="white" />
            </TouchableOpacity>

            <Text style={styles.qtyText}>{cartItem.quantity}</Text>

            <TouchableOpacity
              style={styles.qtyButton}
              onPress={() => updateQty(item.id, cartItem.quantity + 1)}
            >
              <Ionicons name="add" size={18} color="white" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() =>
              addItem({
                id: item.id,
                name: item.name,
                price: item.price,
                restaurantId: restaurant.id,
                restaurantName: restaurant.name,
              })
            }
          >
            <Ionicons name="add" size={22} color="white" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={{
          paddingBottom: 140,
        }}
        ListHeaderComponent={
          <>
            {/* HEADER IMAGE */}

            <View>
              <Image
                source={{ uri: restaurant.image }}
                style={styles.headerImage}
              />

              {/* TOP BUTTONS */}

              <View style={styles.topButtons}>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => router.back()}
                >
                  <Ionicons name="arrow-back" size={24} color={Colors.text} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.iconButton}>
                  <Ionicons
                    name="heart-outline"
                    size={24}
                    color={Colors.text}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* CONTENT */}

            <View style={styles.content}>
              <Text style={styles.restaurantName}>{restaurant.name}</Text>

              <View style={styles.infoRow}>
                <Text style={styles.infoText}>⭐ {restaurant.rating}</Text>

                <Text style={styles.infoText}>⏱ {restaurant.deliveryTime}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.deliveryText}>
                  🚚 {restaurant.deliveryFee}€
                </Text>

                <Text style={styles.infoText}>
                  Minimum {restaurant.minOrder}€
                </Text>
              </View>

              {/* SEARCH */}

              <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={Colors.gray} />

                <TextInput
                  placeholder="Search menu"
                  value={search}
                  onChangeText={setSearch}
                  style={styles.searchInput}
                />
              </View>
            </View>
          </>
        }
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionTitle}>{title}</Text>
        )}
        renderItem={renderMenuItem}
      />

      {/* CART BAR */}

      {cartCount > 0 && (
        <View style={styles.cartBar}>
          <Text style={styles.cartText}>{cartCount} items</Text>

          <Text style={styles.cartText}>{cartTotal.toFixed(2)}€</Text>

          <TouchableOpacity onPress={() => router.push("/cart")}>
            <Text style={styles.cartText}>Go to cart</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  headerImage: {
    width: "100%",
    height: 280,
  },

  topButtons: {
    position: "absolute",
    top: 50,
    left: 16,
    right: 16,

    flexDirection: "row",
    justifyContent: "space-between",
  },

  iconButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "white",

    justifyContent: "center",
    alignItems: "center",
  },

  content: {
    padding: 16,
  },

  restaurantName: {
    fontSize: 30,
    fontWeight: "700",
    color: Colors.text,
  },

  infoRow: {
    flexDirection: "row",
    gap: 20,
    marginTop: 12,
  },

  infoText: {
    color: Colors.gray,
    fontSize: 15,
  },

  deliveryText: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: "600",
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#F3F3F3",
    borderRadius: 16,

    marginTop: 24,

    paddingHorizontal: 16,
  },

  searchInput: {
    flex: 1,
    paddingVertical: 14,
    marginLeft: 10,
    fontSize: 16,
  },

  sectionTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text,

    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "white",

    marginHorizontal: 16,
    marginBottom: 16,

    padding: 12,

    borderRadius: 18,

    borderWidth: 1,
    borderColor: Colors.border,
  },

  menuImage: {
    width: 85,
    height: 85,
    borderRadius: 14,
  },

  menuContent: {
    flex: 1,
    marginLeft: 14,
  },

  menuName: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
  },

  menuDescription: {
    marginTop: 6,
    color: Colors.gray,
    fontSize: 14,
  },

  menuPrice: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
  },

  addButton: {
    width: 42,
    height: 42,
    borderRadius: 12,

    backgroundColor: Colors.primary,

    justifyContent: "center",
    alignItems: "center",
  },

  cartBar: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 20,

    backgroundColor: Colors.primary,

    borderRadius: 18,

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    paddingHorizontal: 20,
    paddingVertical: 18,
  },

  cartText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  qtyContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  qtyButton: {
    width: 34,
    height: 34,
    borderRadius: 10,

    backgroundColor: Colors.primary,

    justifyContent: "center",
    alignItems: "center",
  },

  qtyText: {
    marginHorizontal: 12,
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
  },
});

import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import Ionicons from "@expo/vector-icons/Ionicons";

import { router } from "expo-router";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import Colors from "../constants/Colors";
import { useCart } from "../context/CartContext";
import { RESTAURANTS } from "../data/restaurants";
import { Order } from "../types/order";

export default function CartScreen() {
  const { items, updateQty, removeItem, cartTotal, clearCart, restaurantId } =
    useCart();

  const [address, setAddress] = useState("Avenue Habib Bourguiba, Tunis");

  const restaurant = RESTAURANTS.find((r) => r.id === restaurantId);

  const deliveryFee = restaurant?.deliveryFee || 0;

  const total = cartTotal + deliveryFee;
  const grandTotal = cartTotal + deliveryFee;

  // PLACE ORDER

  const handlePlaceOrder = async () => {
    if (!address.trim()) {
      Alert.alert("Missing address", "Please enter a delivery address");

      return;
    }

    try {
      const newOrder: Order = {
        id: Date.now().toString(),

        restaurantId: restaurant!.id,
        restaurantName: restaurant!.name,
        restaurantImage: restaurant?.image,

        items: items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),

        subtotal: cartTotal,

        deliveryFee,

        total: grandTotal,

        deliveryAddress: address,

        status: "confirmed",

        rating: null,

        createdAt: new Date().toISOString(),
      };

      // GET OLD ORDERS

      const existingOrders = await AsyncStorage.getItem("orders");

      const parsedOrders: Order[] = existingOrders
        ? JSON.parse(existingOrders)
        : [];

      // ADD NEW ORDER

      parsedOrders.unshift(newOrder);

      // SAVE

      await AsyncStorage.setItem("orders", JSON.stringify(parsedOrders));

      // CLEAR CART

      clearCart();

      // NAVIGATE

      router.push({
        pathname: "/order-status",

        params: {
          orderId: newOrder.id,
        },
      });
    } catch (error) {
      Alert.alert("Error", "Something went wrong");
    }
  };

  // EMPTY CART

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Ionicons name="cart-outline" size={90} color={Colors.primary} />

        <Text style={styles.emptyTitle}>Your cart is empty</Text>

        <Text style={styles.emptySubtitle}>
          Discover restaurants and add delicious meals.
        </Text>

        <TouchableOpacity
          style={styles.emptyButton}
          onPress={() => router.push("/")}
        >
          <Text style={styles.emptyButtonText}>Browse Restaurants</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 120,
        }}
      >
        {/* HEADER */}

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>My Cart</Text>

          <View style={{ width: 40 }} />
        </View>

        {/* LINE */}

        <View style={styles.topDivider} />

        {/* RESTAURANT CARD */}

        {restaurant && (
          <View style={styles.restaurantCard}>
            <Image
              source={{ uri: restaurant.image }}
              style={styles.restaurantImage}
            />

            <View style={styles.restaurantContent}>
              <Text style={styles.restaurantName}>{restaurant.name}</Text>

              <View style={styles.restaurantInfoRow}>
                <Text style={styles.restaurantInfo}>
                  ⭐ {restaurant.rating}
                </Text>

                <Text style={styles.restaurantInfo}>
                  ⏱ {restaurant.deliveryTime}
                </Text>
              </View>

              <Text style={styles.deliveryFee}>
                🚚 Delivery {restaurant.deliveryFee}€
              </Text>
            </View>
          </View>
        )}

        {/* ITEMS CARD */}

        <View style={styles.itemsCard}>
          {items.map((item, index) => (
            <View key={item.id}>
              <View style={styles.cartItem}>
                {/* IMAGE */}

                <Image
                  source={{
                    uri:
                      item.image ||
                      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
                  }}
                  style={styles.itemImage}
                />

                {/* CONTENT */}

                <View style={styles.itemContent}>
                  <Text style={styles.itemName}>{item.name}</Text>

                  <Text style={styles.itemPrice}>{item.price.toFixed(2)}€</Text>

                  {/* QUANTITY */}

                  <View style={styles.qtyContainer}>
                    <TouchableOpacity
                      style={styles.qtyButton}
                      onPress={() => updateQty(item.id, item.quantity - 1)}
                    >
                      <Ionicons
                        name="remove"
                        size={18}
                        color={Colors.primary}
                      />
                    </TouchableOpacity>

                    {/* SEPARATOR */}

                    <View style={styles.qtySeparator} />

                    <Text style={styles.qtyText}>{item.quantity}</Text>

                    {/* SEPARATOR */}

                    <View style={styles.qtySeparator} />

                    <TouchableOpacity
                      style={styles.qtyButton}
                      onPress={() => updateQty(item.id, item.quantity + 1)}
                    >
                      <Ionicons name="add" size={18} color={Colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* RIGHT */}

                <View style={styles.rightSide}>
                  <TouchableOpacity onPress={() => removeItem(item.id)}>
                    <Ionicons
                      name="trash-outline"
                      size={24}
                      color={Colors.text}
                    />
                  </TouchableOpacity>

                  <Text style={styles.lineTotal}>
                    {(item.price * item.quantity).toFixed(2)}€
                  </Text>
                </View>
              </View>

              {/* ITEM SEPARATOR */}

              {index !== items.length - 1 && (
                <View style={styles.itemDivider} />
              )}
            </View>
          ))}
        </View>

        {/* TOTAL CARD */}

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>

            <Text style={styles.summaryValue}>{cartTotal.toFixed(2)}€</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>

            <Text style={styles.summaryValue}>{deliveryFee.toFixed(2)}€</Text>
          </View>

          {/* SEPARATOR */}

          <View style={styles.summaryDivider} />

          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>

            <Text style={styles.totalValue}>{total.toFixed(2)}€</Text>
          </View>
        </View>

        {/* LOCATION */}

        <View style={styles.locationCard}>
          <View>
            <Text style={styles.locationTitle}>Delivery Address</Text>

            <View style={styles.addressInputContainer}>
              <View style={styles.locationIcon}>
                <Ionicons name="location" size={22} color={Colors.primary} />
              </View>

              <TextInput
                value={address}
                onChangeText={setAddress}
                placeholder="Enter your address"
                style={styles.addressInput}
                placeholderTextColor={Colors.gray}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* PLACE ORDER */}

      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.placeOrderButton}
          onPress={handlePlaceOrder}
        >
          <Text style={styles.placeOrderText}>
            Place Order • {grandTotal.toFixed(2)}€
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },

  // EMPTY

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    backgroundColor: "#F7F7F7",
  },

  emptyTitle: {
    marginTop: 20,
    fontSize: 28,
    fontWeight: "700",
    color: Colors.text,
  },

  emptySubtitle: {
    marginTop: 10,
    textAlign: "center",
    color: Colors.gray,
    fontSize: 16,
    lineHeight: 24,
  },

  emptyButton: {
    marginTop: 30,
    backgroundColor: Colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 16,
  },

  emptyButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },

  // HEADER

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 18,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,

    backgroundColor: "white",

    justifyContent: "center",
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.text,
  },

  topDivider: {
    height: 1,
    backgroundColor: "#EAEAEA",
    marginBottom: 20,
  },

  // RESTAURANT CARD

  restaurantCard: {
    backgroundColor: "white",

    marginHorizontal: 16,
    marginBottom: 24,

    borderRadius: 24,
    overflow: "hidden",
  },

  restaurantImage: {
    width: "100%",
    height: 180,
  },

  restaurantContent: {
    padding: 18,
  },

  restaurantName: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text,
  },

  restaurantInfoRow: {
    flexDirection: "row",
    gap: 20,
    marginTop: 12,
  },

  restaurantInfo: {
    color: Colors.gray,
    fontSize: 15,
  },

  deliveryFee: {
    marginTop: 14,
    color: Colors.primary,
    fontWeight: "700",
    fontSize: 16,
  },
  // ITEMS

  itemsCard: {
    backgroundColor: "white",

    marginHorizontal: 16,
    borderRadius: 24,

    paddingVertical: 10,

    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  cartItem: {
    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 16,
    paddingVertical: 18,
  },

  itemDivider: {
    height: 1,
    backgroundColor: "#ECECEC",
    marginHorizontal: 16,
  },

  itemImage: {
    width: 92,
    height: 92,
    borderRadius: 18,
  },

  itemContent: {
    flex: 1,
    marginLeft: 14,
  },

  itemName: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text,
  },

  itemPrice: {
    marginTop: 8,
    fontSize: 18,
    color: Colors.gray,
  },

  // QTY

  qtyContainer: {
    marginTop: 18,

    flexDirection: "row",
    alignItems: "center",

    borderWidth: 1.5,
    borderColor: "#FFD8BF",

    borderRadius: 16,

    overflow: "hidden",

    alignSelf: "flex-start",
  },

  qtyButton: {
    width: 40,
    height: 46,

    justifyContent: "center",
    alignItems: "center",

    backgroundColor: "white",
  },

  qtySeparator: {
    width: 1,
    height: "100%",
    backgroundColor: "#FFD8BF",
  },

  qtyText: {
    width: 56,
    textAlign: "center",

    fontSize: 20,
    fontWeight: "700",
    color: Colors.text,
  },

  // RIGHT

  rightSide: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 92,
  },

  lineTotal: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.text,
  },

  // SUMMARY

  summaryCard: {
    backgroundColor: "white",

    marginHorizontal: 16,
    marginTop: 18,

    borderRadius: 24,

    padding: 22,

    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    marginBottom: 18,
  },

  summaryLabel: {
    fontSize: 18,
    color: Colors.text,
  },

  summaryValue: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
  },

  summaryDivider: {
    height: 1,
    backgroundColor: "#ECECEC",
    marginBottom: 22,
  },

  totalLabel: {
    fontSize: 32,
    fontWeight: "700",
    color: Colors.text,
  },

  totalValue: {
    fontSize: 34,
    fontWeight: "700",
    color: Colors.primary,
  },

  // LOCATION

  locationCard: {
    backgroundColor: "white",

    marginHorizontal: 16,
    marginTop: 18,

    borderRadius: 24,

    padding: 20,

    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  locationTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text,

    marginBottom: 16,
  },

  addressInputContainer: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#FFFFFF",

    borderWidth: 1.5,
    borderColor: "#EFEFEF",

    borderRadius: 20,

    paddingHorizontal: 14,

    minHeight: 68,

    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  locationIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,

    backgroundColor: "#FFF3EB",

    justifyContent: "center",
    alignItems: "center",

    marginRight: 12,
  },

  addressInput: {
    flex: 1,

    fontSize: 16,
    color: Colors.text,

    paddingVertical: 0,
  },

  locationSubtitle: {
    marginTop: 4,
    color: Colors.gray,
    fontSize: 15,
  },

  // ORDER BUTTON

  orderButton: {
    marginHorizontal: 16,
    marginTop: 24,

    backgroundColor: Colors.primary,

    borderRadius: 22,

    paddingVertical: 22,
    paddingHorizontal: 24,

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  orderButtonText: {
    color: "white",
    fontSize: 24,
    fontWeight: "700",
  },

  orderButtonPrice: {
    color: "white",
    fontSize: 24,
    fontWeight: "700",
  },
  // BOTTOM BUTTON

  bottomContainer: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 20,
  },

  placeOrderButton: {
    backgroundColor: Colors.primary,

    borderRadius: 20,

    justifyContent: "center",
    alignItems: "center",

    paddingVertical: 20,
  },

  placeOrderText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
});

import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { useEffect, useState } from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";

import Ionicons from "@expo/vector-icons/Ionicons";

import { router, useLocalSearchParams } from "expo-router";

import Colors from "../constants/Colors";

import { Order } from "../types/order";

export default function OrderDetailsScreen() {
  const { orderId } = useLocalSearchParams();

  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    loadOrder();
  }, []);

  const loadOrder = async () => {
    const storedOrders = await AsyncStorage.getItem("orders");

    if (!storedOrders) return;

    const parsedOrders: Order[] = JSON.parse(storedOrders);

    const foundOrder = parsedOrders.find(
      (item) => item.id === orderId,
    );

    setOrder(foundOrder || null);
  };

  if (!order) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 40,
        }}
      >
        {/* HEADER */}

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={Colors.text}
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>
            Order Details
          </Text>

          <View style={{ width: 42 }} />
        </View>

        {/* RESTAURANT */}

        <View style={styles.restaurantCard}>
          <Image
            source={{
              uri: order.restaurantImage,
            }}
            style={styles.restaurantImage}
          />

          <View style={styles.restaurantContent}>
            <Text style={styles.restaurantName}>
              {order.restaurantName}
            </Text>

            <Text style={styles.orderDate}>
              {new Date(order.createdAt).toLocaleString()}
            </Text>
          </View>
        </View>

        {/* ITEMS */}

        <View style={styles.itemsCard}>
          <Text style={styles.sectionTitle}>
            Ordered Items
          </Text>

          {order.items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>
                  {item.name}
                </Text>

                <Text style={styles.itemQty}>
                  Quantity: {item.quantity}
                </Text>
              </View>

              <Text style={styles.itemPrice}>
                {(item.price * item.quantity).toFixed(2)}€
              </Text>
            </View>
          ))}
        </View>

        {/* SUMMARY */}

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.label}>Subtotal</Text>

            <Text style={styles.value}>
              {order.subtotal.toFixed(2)}€
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.label}>
              Delivery Fee
            </Text>

            <Text style={styles.value}>
              {order.deliveryFee.toFixed(2)}€
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>

            <Text style={styles.totalValue}>
              {order.total.toFixed(2)}€
            </Text>
          </View>
        </View>

        {/* ADDRESS */}

        <View style={styles.addressCard}>
          <Text style={styles.sectionTitle}>
            Delivery Address
          </Text>

          <Text style={styles.addressText}>
            {order.deliveryAddress}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    paddingHorizontal: 20,
    paddingTop: 12,
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

  restaurantCard: {
    backgroundColor: "white",

    margin: 16,

    borderRadius: 24,

    overflow: "hidden",
  },

  restaurantImage: {
    width: "100%",
    height: 200,
  },

  restaurantContent: {
    padding: 20,
  },

  restaurantName: {
    fontSize: 26,
    fontWeight: "700",
    color: Colors.text,
  },

  orderDate: {
    marginTop: 10,
    fontSize: 15,
    color: Colors.gray,
  },

  itemsCard: {
    backgroundColor: "white",

    marginHorizontal: 16,

    borderRadius: 24,

    padding: 20,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.text,

    marginBottom: 20,
  },

  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",

    marginBottom: 18,
  },

  itemName: {
    fontSize: 17,
    fontWeight: "600",
    color: Colors.text,
  },

  itemQty: {
    marginTop: 6,
    color: Colors.gray,
  },

  itemPrice: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.primary,
  },

  summaryCard: {
    backgroundColor: "white",

    marginHorizontal: 16,
    marginTop: 20,

    borderRadius: 24,

    padding: 20,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",

    marginBottom: 18,
  },

  label: {
    fontSize: 17,
    color: Colors.text,
  },

  value: {
    fontSize: 17,
    fontWeight: "600",
    color: Colors.text,
  },

  divider: {
    height: 1,
    backgroundColor: "#ECECEC",
    marginBottom: 20,
  },

  totalLabel: {
    fontSize: 26,
    fontWeight: "700",
    color: Colors.text,
  },

  totalValue: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.primary,
  },

  addressCard: {
    backgroundColor: "white",

    marginHorizontal: 16,
    marginTop: 20,

    borderRadius: 24,

    padding: 20,
  },

  addressText: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
});
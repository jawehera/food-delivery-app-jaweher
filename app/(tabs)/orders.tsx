import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { useCallback, useState } from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";

import Ionicons from "@expo/vector-icons/Ionicons";

import { router, useFocusEffect } from "expo-router";

import Colors from "../../constants/Colors";

import { Order } from "../../types/order";

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);

  // LOAD ORDERS

  const loadOrders = async () => {
    try {
      const storedOrders = await AsyncStorage.getItem("orders");

      if (!storedOrders) {
        setOrders([]);
        return;
      }

      const parsedOrders: Order[] = JSON.parse(storedOrders);

      // SORT DESCENDING

      parsedOrders.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      setOrders(parsedOrders);
    } catch (error) {
      console.log(error);
    }
  };

  // RELOAD WHEN SCREEN FOCUSES

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, []),
  );

  // EMPTY STATE

  if (orders.length === 0) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Ionicons name="receipt-outline" size={90} color={Colors.primary} />

        <Text style={styles.emptyTitle}>No orders yet</Text>

        <Text style={styles.emptySubtitle}>
          Your past orders will appear here.
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

  // RENDER ORDER CARD

  const renderOrder = ({ item }: { item: Order }) => {
    const totalItems = item.items.reduce(
      (acc, current) => acc + current.quantity,
      0,
    );

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() =>
          router.push({
            pathname: "/order-details",
            params: {
              orderId: item.id,
            },
          })
        }
      >
        {/* IMAGE */}

        <Image
          source={{
            uri:
              item.restaurantImage ||
              "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
          }}
          style={styles.cardImage}
        />

        {/* CONTENT */}

        <View style={styles.cardContent}>
          <View style={styles.rowBetween}>
            <Text style={styles.restaurantName}>{item.restaurantName}</Text>

            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>

          <Text style={styles.date}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoText}>{totalItems} items</Text>

            <Text style={styles.infoText}>{item.total.toFixed(2)}€</Text>
          </View>

          {/* REORDER */}

          <TouchableOpacity
            style={styles.reorderButton}
            onPress={() => {
              Alert.alert("Reorder", "We will implement reorder next.");
            }}
          >
            <Ionicons name="refresh" size={18} color="white" />

            <Text style={styles.reorderText}>Reorder</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Orders</Text>
      </View>

      {/* LIST */}

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrder}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 120,
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },

  headerTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: Colors.text,
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
    fontSize: 16,
    color: Colors.gray,
    textAlign: "center",
  },

  emptyButton: {
    marginTop: 28,
    backgroundColor: Colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 18,
  },

  emptyButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },

  // CARD

  card: {
    backgroundColor: "white",
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 20,
  },

  cardImage: {
    width: "100%",
    height: 180,
  },

  cardContent: {
    padding: 18,
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  restaurantName: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.text,
    flex: 1,
    marginRight: 12,
  },

  statusBadge: {
    backgroundColor: "#FFF3EB",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
  },

  statusText: {
    color: Colors.primary,
    fontWeight: "700",
    textTransform: "capitalize",
  },

  date: {
    marginTop: 10,
    color: Colors.gray,
    fontSize: 15,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },

  infoText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: "600",
  },

  reorderButton: {
    marginTop: 22,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 14,

    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },

  reorderText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
});

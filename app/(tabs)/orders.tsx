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

import { useCart } from "../../context/CartContext";

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);

  const { addItem, clearCart, items, restaurantId } = useCart();

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

  // RELOAD ON FOCUS

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, []),
  );

  // REORDER

  const handleReorder = (order: Order) => {
    // CHECK DIFFERENT RESTAURANT

    if (items.length > 0 && restaurantId !== order.restaurantId) {
      Alert.alert(
        "Different restaurant",
        "Your cart contains items from another restaurant. Clear cart and reorder?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },

          {
            text: "Clear Cart",
            style: "destructive",

            onPress: () => {
              clearCart();

              order.items.forEach((item) => {
                for (let i = 0; i < item.quantity; i++) {
                  addItem({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    image: item.image,

                    restaurantId: order.restaurantId,
                    restaurantName: order.restaurantName,
                    restaurantImage: order.restaurantImage,
                  });
                }
              });

              router.push("/cart");
            },
          },
        ],
      );

      return;
    }

    // SAME RESTAURANT

    order.items.forEach((item) => {
      for (let i = 0; i < item.quantity; i++) {
        addItem({
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image,

          restaurantId: order.restaurantId,
          restaurantName: order.restaurantName,
          restaurantImage: order.restaurantImage,
        });
      }
    });

    router.push("/cart");
  };

  // EMPTY STATE

  if (orders.length === 0) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Ionicons name="receipt-outline" size={90} color={Colors.primary} />

        <Text style={styles.emptyTitle}>No orders yet</Text>

        <Text style={styles.emptySubtitle}>
          Your order history will appear here.
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

  // RENDER ORDER

  const renderOrder = ({ item }: { item: Order }) => {
    const totalItems = item.items.reduce(
      (acc, current) => acc + current.quantity,
      0,
    );

    return (
      <TouchableOpacity
        style={styles.orderCard}
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
        {/* TOP */}

        <View style={styles.orderTopRow}>
          <View style={styles.leftContent}>
            <Text style={styles.restaurantName}>{item.restaurantName}</Text>

            <Text style={styles.orderDate}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>

            {/* STATUS + ITEMS */}

            <View style={styles.metaRow}>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>

              <Text style={styles.itemsText}>{totalItems} items</Text>
            </View>
          </View>

          {/* IMAGE */}

          <Image
            source={{
              uri:
                item.restaurantImage ||
                "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
            }}
            style={styles.orderImage}
          />
        </View>

        {/* PRICE + BUTTON */}

        <View style={styles.bottomRow}>
          <Text style={styles.totalPrice}>{item.total.toFixed(2)}€</Text>

          <TouchableOpacity
            style={styles.reorderButton}
            onPress={() => handleReorder(item)}
          >
            <Text style={styles.reorderText}>Reorder</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrder}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 20,
          paddingBottom: 120,
        }}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Order History</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },

  // HEADER

  header: {
    marginBottom: 18,
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 26,
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

  orderCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 18,
    marginBottom: 18,
  },

  orderTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  leftContent: {
    flex: 1,
    justifyContent: "space-between",
  },

  orderImage: {
    width: 82,
    height: 82,
    borderRadius: 18,
    marginLeft: 16,
  },

  restaurantName: {
    fontSize: 21,
    fontWeight: "700",
    color: Colors.text,
  },

  orderDate: {
    marginTop: 6,
    color: Colors.gray,
    fontSize: 14,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
  },

  statusBadge: {
    backgroundColor: "#EAFBF0",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
  },

  statusText: {
    color: "#20A35B",
    fontWeight: "700",
    fontSize: 13,
    textTransform: "capitalize",
  },

  itemsText: {
    marginLeft: 12,
    color: Colors.gray,
    fontSize: 14,
    fontWeight: "500",
  },

  // BOTTOM

  bottomRow: {
    marginTop: 22,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  totalPrice: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text,
  },

  reorderButton: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 24,

    justifyContent: "center",
    alignItems: "center",
  },

  reorderText: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: "700",
  },
});

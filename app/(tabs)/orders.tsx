import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { useCallback, useState } from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";

import Ionicons from "@expo/vector-icons/Ionicons";

import { router, useFocusEffect } from "expo-router";

import Colors from "../../constants/Colors";

import { Order } from "../../types/order";

import { useMemo, useRef } from "react";
import { useCart } from "../../context/CartContext";

import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);

  const { addItem, clearCart, items, restaurantId } = useCart();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);

  const snapPoints = useMemo(() => ["40%", "75%", "100%"], []);

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
        activeOpacity={0.85}
        onPress={() => {
          setSelectedOrder(item);

          bottomSheetRef.current?.snapToIndex(0);
        }}
      >
        {/* TOP ROW */}

        <View style={styles.topRow}>
          <View style={styles.restaurantRow}>
            <Image
              source={{
                uri:
                  item.restaurantImage ||
                  "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
              }}
              style={styles.orderImage}
            />

            <View style={{ flex: 1 }}>
              <Text style={styles.restaurantName}>{item.restaurantName}</Text>

              <Text style={styles.orderDate}>
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>

          <Ionicons name="chevron-forward" size={22} color="#B8B8B8" />
        </View>

        {/* STATUS */}

        <View style={styles.metaRow}>
          <View style={styles.statusBadge}>
            <Ionicons name="checkmark-circle" size={14} color="#22C55E" />

            <Text style={styles.statusText}>{item.status}</Text>
          </View>

          <Text style={styles.itemsText}>{totalItems} items</Text>
        </View>

        {/* BOTTOM */}

        <View style={styles.bottomRow}>
          <Text style={styles.totalPrice}>{item.total.toFixed(2)}€</Text>

          <TouchableOpacity
            style={styles.reorderButton}
            onPress={() => handleReorder(item)}
          >
            <Ionicons name="refresh" size={16} color={Colors.primary} />

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
            <Text style={styles.headerTitle}> Your Orders History</Text>

            <Text style={styles.headerSubtitle}> {orders.length} orders</Text>
          </View>
        }
      />
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
      >
        {selectedOrder && (
          <BottomSheetScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              padding: 24,
              paddingBottom: 80,
            }}
          >
            <Image
              source={{
                uri: selectedOrder.restaurantImage,
              }}
              style={styles.sheetImage}
            />

            <Text style={styles.sheetRestaurant}>
              {selectedOrder.restaurantName}
            </Text>

            <Text style={styles.sheetDate}>
              {new Date(selectedOrder.createdAt).toLocaleString()}
            </Text>

            <View style={styles.sheetDivider} />

            <Text style={styles.sheetSection}>Ordered Items</Text>

            {selectedOrder.items.map((item) => (
              <View key={item.id} style={styles.sheetItemRow}>
                <Text style={styles.sheetItemName}>
                  {item.name} × {item.quantity}
                </Text>

                <Text style={styles.sheetItemPrice}>
                  {(item.price * item.quantity).toFixed(2)}€
                </Text>
              </View>
            ))}

            <View style={styles.sheetDivider} />

            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Subtotal</Text>

              <Text style={styles.priceValue}>
                {selectedOrder.subtotal.toFixed(2)}€
              </Text>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Delivery Fee</Text>

              <Text style={styles.priceValue}>
                {selectedOrder.deliveryFee.toFixed(2)}€
              </Text>
            </View>

            <View style={styles.sheetDivider} />

            <Text style={styles.addressTitle}>Delivery Address</Text>

            <Text style={styles.addressText}>
              {selectedOrder.deliveryAddress}
            </Text>

            <View style={styles.sheetTotalRow}>
              <Text style={styles.sheetTotalLabel}>Total</Text>

              <Text style={styles.sheetTotalValue}>
                {selectedOrder.total.toFixed(2)}€
              </Text>
            </View>
          </BottomSheetScrollView>
        )}
      </BottomSheet>
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
    marginBottom: 24,
  },

  headerTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: Colors.text,
  },

  headerSubtitle: {
    marginTop: 4,
    fontSize: 15,
    color: Colors.gray,
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
    borderRadius: 22,

    padding: 18,
    marginBottom: 14,

    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  restaurantRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  orderImage: {
    width: 58,
    height: 58,
    borderRadius: 14,
    marginRight: 14,
  },

  restaurantName: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
  },

  orderDate: {
    marginTop: 4,
    fontSize: 13,
    color: Colors.gray,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#EAFBF0",

    paddingHorizontal: 10,
    paddingVertical: 6,

    borderRadius: 12,
  },

  statusText: {
    marginLeft: 5,

    color: "#22C55E",

    fontSize: 13,
    fontWeight: "700",

    textTransform: "capitalize",
  },

  itemsText: {
    marginLeft: 12,

    fontSize: 14,
    color: Colors.gray,
  },

  ratingRow: {
    flexDirection: "row",
    marginTop: 12,
    gap: 2,
  },

  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    marginTop: 18,
  },

  totalPrice: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text,
  },

  reorderButton: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#FFF7F1",

    paddingHorizontal: 14,
    paddingVertical: 10,

    borderRadius: 14,
  },

  reorderText: {
    marginLeft: 6,

    color: Colors.primary,

    fontSize: 14,
    fontWeight: "700",
  },

  orderTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  leftContent: {
    flex: 1,
    justifyContent: "space-between",
  },

  //Bottom Sheet

  sheetImage: {
    width: "100%",
    height: 180,

    borderRadius: 20,
  },

  sheetRestaurant: {
    marginTop: 16,

    fontSize: 24,
    fontWeight: "700",

    color: Colors.text,
  },

  sheetDate: {
    marginTop: 6,

    color: Colors.gray,
  },

  sheetDivider: {
    height: 1,

    backgroundColor: "#ECECEC",

    marginVertical: 20,
  },

  sheetSection: {
    fontSize: 18,
    fontWeight: "700",

    color: Colors.text,

    marginBottom: 14,
  },

  sheetItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",

    marginBottom: 12,
  },

  sheetItemName: {
    fontSize: 16,
    color: Colors.text,
  },

  sheetItemPrice: {
    fontSize: 16,
    fontWeight: "700",

    color: Colors.primary,
  },

  addressTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 8,
  },

  addressText: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
    opacity: 0.8,
  },

  sheetTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",

    marginTop: 24,
  },

  sheetTotalLabel: {
    fontSize: 24,
    fontWeight: "700",

    color: Colors.text,
  },

  sheetTotalValue: {
    fontSize: 26,
    fontWeight: "700",

    color: Colors.primary,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  priceLabel: {
    fontSize: 16,
    color: Colors.gray,
  },

  priceValue: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
});

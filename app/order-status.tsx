import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import Ionicons from "@expo/vector-icons/Ionicons";

import { router, useLocalSearchParams } from "expo-router";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { useEffect, useMemo, useState } from "react";

import Colors from "../constants/Colors";

const STEPS = ["Order Confirmed", "Preparing", "Out for Delivery", "Delivered"];

export default function OrderStatusScreen() {
  const { orderId } = useLocalSearchParams();

  const [order, setOrder] = useState<any>(null);

  const [currentStep, setCurrentStep] = useState(0);

  const [remainingTime, setRemainingTime] = useState(32);

  const [selectedRating, setSelectedRating] = useState(0);

  // LOAD ORDER

  useEffect(() => {
    loadOrder();
  }, []);

  const loadOrder = async () => {
    const storedOrders = await AsyncStorage.getItem("orders");

    if (!storedOrders) return;

    const parsedOrders = JSON.parse(storedOrders);

    const foundOrder = parsedOrders.find((item: any) => item.id === orderId);

    setOrder(foundOrder);
  };

  // TIMER

  useEffect(() => {
    if (!order) return;

    const countdownInterval = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [order]);

  // STEP TRACKER

  useEffect(() => {
    if (!order) return;

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= 3) {
          clearInterval(stepInterval);
          return prev;
        }

        return prev + 1;
      });
    }, 8000);

    return () => clearInterval(stepInterval);
  }, [order]);

  // SAVE RATING

  const handleRating = async (rating: number) => {
    setSelectedRating(rating);

    const storedOrders = await AsyncStorage.getItem("orders");

    if (!storedOrders) return;

    const parsedOrders = JSON.parse(storedOrders);

    const updatedOrders = parsedOrders.map((item: any) =>
      item.id === orderId
        ? {
            ...item,
            rating,
          }
        : item,
    );

    await AsyncStorage.setItem("orders", JSON.stringify(updatedOrders));

    Alert.alert("Thank you!", "Rating saved successfully");
  };

  const totalItems = useMemo(() => {
    if (!order) return 0;

    return order.items.reduce(
      (acc: number, item: any) => acc + item.quantity,
      0,
    );
  }, [order]);

  if (!order) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 60,
        }}
      >
        {/* HEADER */}

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push("/")}
          >
            <Ionicons name="home-outline" size={24} color={Colors.text} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Order Status</Text>

          <View style={{ width: 42 }} />
        </View>

        {/* SUMMARY */}

        <View style={styles.summaryCard}>
          <Image
            source={{ uri: order.restaurantImage }}
            style={styles.restaurantImage}
          />

          <Text style={styles.restaurantName}>{order.restaurantName}</Text>

          <Text style={styles.summaryText}>{totalItems} items</Text>

          <Text style={styles.totalPrice}>{order.total.toFixed(2)}€</Text>
        </View>

        {/* TIMER */}

        <View style={styles.timerCard}>
          <Text style={styles.timerLabel}>Estimated delivery time</Text>

          <Text style={styles.timer}>{remainingTime}s</Text>
        </View>

        {/* STEPS */}

        <View style={styles.stepsContainer}>
          {STEPS.map((step, index) => {
            const completed = index < currentStep;

            const active = index === currentStep;

            return (
              <View key={step} style={styles.stepRow}>
                {/* INDICATOR */}

                <View style={styles.indicatorContainer}>
                  <View
                    style={[
                      styles.circle,

                      completed && styles.completedCircle,

                      active && styles.activeCircle,
                    ]}
                  >
                    {completed && (
                      <Ionicons name="checkmark" size={16} color="white" />
                    )}
                  </View>

                  {index !== STEPS.length - 1 && (
                    <View
                      style={[
                        styles.line,

                        index < currentStep && styles.activeLine,
                      ]}
                    />
                  )}
                </View>

                {/* TEXT */}

                <Text
                  style={[
                    styles.stepText,

                    active && styles.activeText,

                    completed && styles.completedText,
                  ]}
                >
                  {step}
                </Text>
              </View>
            );
          })}
        </View>

        {/* DELIVERED */}

        {currentStep === 3 && (
          <View style={styles.deliveredCard}>
            <Text style={styles.deliveredTitle}>Your order has arrived!</Text>

            <Text style={styles.ratingLabel}>Rate your experience</Text>

            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => handleRating(star)}>
                  <Ionicons
                    name={selectedRating >= star ? "star" : "star-outline"}
                    size={38}
                    color="#FFB800"
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
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
    alignItems: "center",
    justifyContent: "space-between",

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

  summaryCard: {
    backgroundColor: "white",

    margin: 16,
    borderRadius: 24,

    padding: 24,

    alignItems: "center",
  },

  restaurantImage: {
    width: "100%",
    height: 180,
    borderRadius: 20,
  },

  restaurantName: {
    marginTop: 20,
    fontSize: 26,
    fontWeight: "700",
    color: Colors.text,
  },

  summaryText: {
    marginTop: 8,
    color: Colors.gray,
    fontSize: 16,
  },

  totalPrice: {
    marginTop: 14,
    fontSize: 34,
    fontWeight: "700",
    color: Colors.primary,
  },

  timerCard: {
    backgroundColor: "white",

    marginHorizontal: 16,

    borderRadius: 24,

    padding: 24,

    alignItems: "center",
  },

  timerLabel: {
    color: Colors.gray,
    fontSize: 16,
  },

  timer: {
    marginTop: 12,
    fontSize: 46,
    fontWeight: "700",
    color: Colors.primary,
  },

  stepsContainer: {
    backgroundColor: "white",

    marginHorizontal: 16,
    marginTop: 20,

    borderRadius: 24,

    padding: 24,
  },

  stepRow: {
    flexDirection: "row",

    marginBottom: 26,
  },

  indicatorContainer: {
    alignItems: "center",
    marginRight: 16,
  },

  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,

    backgroundColor: "#D9D9D9",
  },

  completedCircle: {
    backgroundColor: Colors.primary,

    justifyContent: "center",
    alignItems: "center",
  },

  activeCircle: {
    backgroundColor: Colors.primary,
  },

  line: {
    width: 2,
    height: 60,

    backgroundColor: "#D9D9D9",

    marginTop: 4,
  },

  activeLine: {
    backgroundColor: Colors.primary,
  },

  stepText: {
    fontSize: 18,
    color: Colors.gray,
    marginTop: 2,
  },

  activeText: {
    color: Colors.text,
    fontWeight: "700",
  },

  completedText: {
    color: Colors.primary,
    fontWeight: "700",
  },

  deliveredCard: {
    backgroundColor: "white",

    marginHorizontal: 16,
    marginTop: 20,

    borderRadius: 24,

    padding: 24,

    alignItems: "center",
  },

  deliveredTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: Colors.text,
  },

  ratingLabel: {
    marginTop: 14,
    fontSize: 18,
    color: Colors.gray,
  },

  starsRow: {
    flexDirection: "row",
    marginTop: 18,
    gap: 10,
  },
});

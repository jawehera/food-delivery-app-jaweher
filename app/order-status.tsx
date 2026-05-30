import {
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

import Modal from "react-native-modal";
import Colors from "../constants/Colors";

const STEPS = ["Order Confirmed", "Preparing", "Out for Delivery", "Delivered"];

export default function OrderStatusScreen() {
  const { orderId } = useLocalSearchParams();

  const [order, setOrder] = useState<any>(null);

  const [currentStep, setCurrentStep] = useState(0);

  const [remainingTime, setRemainingTime] = useState(32);

  const [selectedRating, setSelectedRating] = useState(0);
  const [showRatingModal, setShowRatingModal] = useState(false);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

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

  //Delivered

  useEffect(() => {
    if (currentStep === 3) {
      const timeout = setTimeout(() => {
        setShowRatingModal(true);
      }, 1000);

      return () => clearTimeout(timeout);
    }
  }, [currentStep]);

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

    setShowRatingModal(false);

    setTimeout(() => {
      showCustomToast("Thank you for your feedback ❤️");
    }, 250);

    setTimeout(() => {
      router.replace("/");
    }, 1700);
  };
  const showCustomToast = (message: string) => {
    setToastMessage(message);

    setShowToast(true);

    setTimeout(() => {
      setShowToast(false);
    }, 2500);
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

        {/* STEPS */}

        <View style={styles.stepsContainer}>
          {STEPS.map((step, index) => {
            const completed = index < currentStep;
            const active = index === currentStep;

            return (
              <View key={step} style={styles.modernStepRow}>
                {/* LEFT SIDE */}
                <View style={styles.timelineContainer}>
                  <View
                    style={[
                      styles.timelineCircle,
                      completed && styles.completedTimelineCircle,
                      active && styles.activeTimelineCircle,
                    ]}
                  >
                    {(completed || active) && (
                      <Ionicons name="checkmark" size={18} color="white" />
                    )}
                  </View>

                  {index !== STEPS.length - 1 && (
                    <View
                      style={[
                        styles.timelineLine,
                        index < currentStep && styles.timelineLineActive,
                      ]}
                    />
                  )}
                </View>

                {/* RIGHT SIDE */}
                <View style={styles.stepContent}>
                  <Text
                    style={[
                      styles.modernStepTitle,
                      completed && styles.completedStepTitle,
                      active && styles.activeStepTitle,
                    ]}
                  >
                    {step}
                  </Text>

                  <Text style={styles.stepDescription}>
                    {index === 0 && "Your order has been confirmed"}
                    {index === 1 && "The restaurant is preparing your food"}
                    {index === 2 && "Your order is on the way"}
                    {index === 3 && "Enjoy your meal"}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* DELIVERED */}

        <Modal
          isVisible={showRatingModal}
          onBackdropPress={() => setShowRatingModal(false)}
          swipeDirection="down"
          onSwipeComplete={() => setShowRatingModal(false)}
          style={styles.ratingModal}
        >
          <View style={styles.ratingModalContent}>
            <View style={styles.dragHandle} />

            <Text style={styles.ratingTitle}>Order Delivered 🎉</Text>

            <Image
              source={require("../assets/images/delivery-success.png")}
              style={styles.deliverySuccessImage}
              resizeMode="contain"
            />

            <Text style={styles.ratingSubtitle}>Your order has arrived!</Text>

            <Text style={styles.ratingQuestion}>How was your experience?</Text>

            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setSelectedRating(star)}
                >
                  <Ionicons
                    name={selectedRating >= star ? "star" : "star-outline"}
                    size={42}
                    color="#FFB800"
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.submitRatingButton}
              onPress={() => {
                if (selectedRating > 0) {
                  handleRating(selectedRating);
                }
              }}
            >
              <Text style={styles.submitRatingText}>Submit Rating</Text>
            </TouchableOpacity>
          </View>
        </Modal>

        {showToast && (
          <View style={styles.toast}>
            <Ionicons name="checkmark-circle" size={20} color="white" />

            <Text style={styles.toastText}>{toastMessage}</Text>
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
  modernStepRow: {
    flexDirection: "row",
    marginBottom: 30,
  },

  timelineContainer: {
    width: 50,
    alignItems: "center",
  },

  timelineCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#E2E2E2",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },

  completedTimelineCircle: {
    backgroundColor: "#22C55E",
  },

  activeTimelineCircle: {
    backgroundColor: "#FF8A00",
    shadowColor: "#FF8A00",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  timelineLine: {
    width: 4,
    flex: 1,
    backgroundColor: "#E5E5E5",
    marginTop: 4,
  },

  timelineLineActive: {
    backgroundColor: "#22C55E",
  },

  stepContent: {
    flex: 1,
    paddingBottom: 10,
  },

  modernStepTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#222",
  },

  completedStepTitle: {
    color: "#22C55E",
  },

  activeStepTitle: {
    color: "#FF8A00",
  },

  stepDescription: {
    marginTop: 6,
    fontSize: 15,
    color: "#8B8B8B",
    lineHeight: 22,
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
  ratingModal: {
    justifyContent: "flex-end",
    margin: 0,
  },

  ratingModalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    alignItems: "center",
  },

  dragHandle: {
    width: 60,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#D9D9D9",
    marginBottom: 20,
  },

  deliverySuccessImage: {
    width: 300,
    height: 200,
    alignSelf: "center",
    marginBottom: 12,
  },

  ratingTitle: {
    marginTop: 18,
    fontSize: 26,
    fontWeight: "700",
    color: Colors.text,
  },

  ratingSubtitle: {
    marginTop: 8,
    fontSize: 20,
    fontWeight: "600",
    color: Colors.text,
  },

  ratingQuestion: {
    marginTop: 24,
    fontSize: 16,
    color: Colors.gray,
  },

  submitRatingButton: {
    width: "100%",
    marginTop: 30,
    backgroundColor: Colors.primary,
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: "center",
  },

  submitRatingText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },

  toast: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",

    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#222",

    paddingHorizontal: 20,
    paddingVertical: 14,

    borderRadius: 20,
  },

  toastText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
});

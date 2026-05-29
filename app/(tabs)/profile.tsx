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

import { useState } from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";

import * as ImagePicker from "expo-image-picker";

import Ionicons from "@expo/vector-icons/Ionicons";

import * as Yup from "yup";

import Colors from "../../constants/Colors";

export default function ProfileScreen() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const [avatar, setAvatar] = useState<string | null>(null);

  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
  });

  // VALIDATION

  const validationSchema = Yup.object().shape({
    firstName: Yup.string().required("First name is required"),

    lastName: Yup.string().required("Last name is required"),

    email: Yup.string()
      .email("Invalid email format")
      .matches(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, "Please enter a valid email")
      .required("Email is required"),

    address: Yup.string().required("Address is required"),
  });

  // IMAGE PICKER

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission required", "Please allow gallery access");

      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  // SAVE PROFILE

  const handleSaveProfile = async () => {
    try {
      // RESET ERRORS

      setErrors({
        firstName: "",
        lastName: "",
        email: "",
        address: "",
      });

      // VALIDATE

      await validationSchema.validate(
        {
          firstName,
          lastName,
          email,
          address,
        },
        {
          abortEarly: false,
        },
      );

      // PROFILE OBJECT

      const profile = {
        firstName,
        lastName,
        email,
        address,
        avatar,
      };

      // SAVE

      await AsyncStorage.setItem("profile", JSON.stringify(profile));

      Alert.alert("Success", "Profile saved successfully");
    } catch (error: any) {
      if (error.inner) {
        const newErrors = {
          firstName: "",
          lastName: "",
          email: "",
          address: "",
        };

        error.inner.forEach((err: any) => {
          newErrors[err.path as keyof typeof newErrors] = err.message;
        });

        setErrors(newErrors);
      }
    }
  };

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
          <Text style={styles.title}>Setup your profile</Text>

          <Text style={styles.subtitle}>
            Personalize your food delivery experience
          </Text>
        </View>

        {/* CARD */}

        <View style={styles.card}>
          {/* AVATAR */}

          <View style={styles.avatarContainer}>
            <TouchableOpacity
              style={styles.avatarWrapper}
              onPress={pickImage}
              activeOpacity={0.9}
            >
              {avatar ? (
                <Image source={{ uri: avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={68} color="#BDBDBD" />
                </View>
              )}

              <View style={styles.cameraButton}>
                <Ionicons name="camera" size={18} color="white" />
              </View>
            </TouchableOpacity>
          </View>

          {/* FIRST NAME */}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>First Name</Text>

            <View style={styles.inputWrapper}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name="person-outline"
                  size={22}
                  color={Colors.primary}
                />
              </View>

              <TextInput
                value={firstName}
                onChangeText={(text) => {
                  setFirstName(text);

                  if (errors.firstName) {
                    setErrors((prev) => ({
                      ...prev,
                      firstName: "",
                    }));
                  }
                }}
                placeholder="Enter your first name"
                placeholderTextColor="#A0A0A0"
                style={styles.input}
              />
            </View>

            {errors.firstName ? (
              <Text style={styles.errorText}>{errors.firstName}</Text>
            ) : null}
          </View>

          {/* LAST NAME */}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Last Name</Text>

            <View style={styles.inputWrapper}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name="person-outline"
                  size={22}
                  color={Colors.primary}
                />
              </View>

              <TextInput
                value={lastName}
                onChangeText={(text) => {
                  setLastName(text);

                  if (errors.lastName) {
                    setErrors((prev) => ({
                      ...prev,
                      lastName: "",
                    }));
                  }
                }}
                placeholder="Enter your last name"
                placeholderTextColor="#A0A0A0"
                style={styles.input}
              />
            </View>

            {errors.lastName ? (
              <Text style={styles.errorText}>{errors.lastName}</Text>
            ) : null}
          </View>

          {/* EMAIL */}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>

            <View style={styles.inputWrapper}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name="mail-outline"
                  size={22}
                  color={Colors.primary}
                />
              </View>

              <TextInput
                value={email}
                onChangeText={(text) => {
                  setEmail(text);

                  if (errors.email) {
                    setErrors((prev) => ({
                      ...prev,
                      email: "",
                    }));
                  }
                }}
                placeholder="example@email.com"
                placeholderTextColor="#A0A0A0"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
            </View>

            {errors.email ? (
              <Text style={styles.errorText}>{errors.email}</Text>
            ) : null}
          </View>

          {/* ADDRESS */}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Default delivery address</Text>

            <View style={styles.inputWrapper}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name="location-outline"
                  size={22}
                  color={Colors.primary}
                />
              </View>

              <TextInput
                value={address}
                onChangeText={(text) => {
                  setAddress(text);

                  if (errors.address) {
                    setErrors((prev) => ({
                      ...prev,
                      address: "",
                    }));
                  }
                }}
                placeholder="Enter your address"
                placeholderTextColor="#A0A0A0"
                style={styles.input}
              />
            </View>

            {errors.address ? (
              <Text style={styles.errorText}>{errors.address}</Text>
            ) : null}
          </View>

          {/* BUTTON */}

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveProfile}
            activeOpacity={0.9}
          >
            <Text style={styles.saveButtonText}>Save Profile</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F7FB",
  },

  // HEADER

  header: {
    paddingTop: 20,
    paddingHorizontal: 24,
    alignItems: "center",
  },

  title: {
    fontSize: 32,
    fontWeight: "800",
    color: Colors.text,
  },

  subtitle: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.gray,
    textAlign: "center",
    lineHeight: 22,
  },

  // CARD

  card: {
    backgroundColor: "white",

    marginHorizontal: 16,
    marginTop: 30,

    borderRadius: 34,

    padding: 22,

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,

    elevation: 3,
  },

  // AVATAR

  avatarContainer: {
    alignItems: "center",
    marginBottom: 28,
  },

  avatarWrapper: {
    position: "relative",
  },

  avatar: {
    width: 130,
    height: 130,
    borderRadius: 65,
  },

  avatarPlaceholder: {
    width: 130,
    height: 130,
    borderRadius: 65,

    backgroundColor: "#F1F1F1",

    justifyContent: "center",
    alignItems: "center",
  },

  cameraButton: {
    position: "absolute",
    right: 4,
    bottom: 4,

    width: 38,
    height: 38,
    borderRadius: 19,

    backgroundColor: Colors.primary,

    justifyContent: "center",
    alignItems: "center",

    borderWidth: 3,
    borderColor: "white",
  },

  changePhotoText: {
    marginTop: 14,
    fontSize: 15,
    fontWeight: "600",
    color: Colors.primary,
  },

  // INPUTS

  inputContainer: {
    marginBottom: 22,
  },

  label: {
    fontSize: 14,
    color: Colors.gray,
    marginBottom: 10,
    marginLeft: 4,
    fontWeight: "600",
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#FAFAFA",

    borderWidth: 1.5,
    borderColor: "#EEEEEE",

    borderRadius: 20,

    paddingHorizontal: 14,

    minHeight: 64,
  },

  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,

    backgroundColor: "#FFF3EB",

    justifyContent: "center",
    alignItems: "center",

    marginRight: 12,
  },

  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },

  errorText: {
    color: "#E53935",
    marginTop: 8,
    marginLeft: 6,
    fontSize: 13,
  },

  // BUTTON

  saveButton: {
    marginTop: 12,

    backgroundColor: Colors.primary,

    borderRadius: 22,

    paddingVertical: 18,

    justifyContent: "center",
    alignItems: "center",

    shadowColor: Colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 10,

    elevation: 4,
  },

  saveButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
});

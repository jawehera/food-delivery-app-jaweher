import {
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { useEffect, useState } from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";

import * as ImagePicker from "expo-image-picker";

import Ionicons from "@expo/vector-icons/Ionicons";

import * as Yup from "yup";

import Modal from "react-native-modal";
import Colors from "../../constants/Colors";

type Profile = {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  avatar: string | null;
};

export default function ProfileScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);

  const [editModalVisible, setEditModalVisible] = useState(false);

  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  // FORM STATES

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

  // LOAD PROFILE

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const storedProfile = await AsyncStorage.getItem("profile");

      if (storedProfile) {
        const parsedProfile: Profile = JSON.parse(storedProfile);

        setProfile(parsedProfile);

        setFirstName(parsedProfile.firstName);
        setLastName(parsedProfile.lastName);
        setEmail(parsedProfile.email);
        setAddress(parsedProfile.address);
        setAvatar(parsedProfile.avatar);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // VALIDATION

  const validationSchema = Yup.object().shape({
    firstName: Yup.string().required("First name is required"),

    lastName: Yup.string().required("Last name is required"),

    email: Yup.string()
      .email("Invalid email format")
      .matches(/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/, "Please enter a valid email")
      .required("Email is required"),

    address: Yup.string().required("Address is required"),
  });

  // IMAGE PICKER

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled) {
      const newAvatar = result.assets[0].uri;

      setAvatar(newAvatar);

      if (profile) {
        const updatedProfile = {
          ...profile,
          avatar: newAvatar,
        };

        setProfile(updatedProfile);

        await AsyncStorage.setItem("profile", JSON.stringify(updatedProfile));

        showCustomToast("Photo updated");
      }
    }
  };

  // TOAST

  const showCustomToast = (message: string) => {
    setToastMessage(message);

    setShowToast(true);

    setTimeout(() => {
      setShowToast(false);
    }, 2500);
  };

  // SAVE PROFILE

  const handleSaveProfile = async () => {
    try {
      setErrors({
        firstName: "",
        lastName: "",
        email: "",
        address: "",
      });

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

      const newProfile: Profile = {
        firstName,
        lastName,
        email,
        address,
        avatar,
      };

      await AsyncStorage.setItem("profile", JSON.stringify(newProfile));

      setProfile(newProfile);

      setEditModalVisible(false);

      showCustomToast(
        profile
          ? "Profile updated successfully"
          : "Profile created successfully",
      );
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

  // SIGN OUT

  const handleSignOut = async () => {
    try {
      await AsyncStorage.removeItem("profile");

      setProfile(null);

      setFirstName("");
      setLastName("");
      setEmail("");
      setAddress("");
      setAvatar(null);

      setErrors({
        firstName: "",
        lastName: "",
        email: "",
        address: "",
      });

      setEditModalVisible(false);

      showCustomToast("Signed out successfully");
    } catch (error) {
      console.log(error);
    }
  };

  // INITIALS

  const initials = `${
    profile?.firstName?.charAt(0)?.toUpperCase() || ""
  }${profile?.lastName?.charAt(0)?.toUpperCase() || ""}`;

  // =========================
  // SETUP PROFILE SCREEN
  // =========================

  if (!profile) {
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
                    <Ionicons name="person" size={40} color="#BDBDBD" />
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

        {/* TOAST */}

        {showToast && (
          <View style={styles.toast}>
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        )}
      </SafeAreaView>
    );
  }

  // =========================
  // PROFILE SCREEN
  // =========================

  return (
    <SafeAreaView style={styles.profileContainer}>
      <ImageBackground
        source={require("../../assets/images/profile-bg.png")}
        style={styles.backgroundImage}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 40,
        }}
      >
        {/* PROFILE SECTION */}

        <View style={styles.profileSection}>
          <TouchableOpacity
            style={styles.avatarWrapper}
            onPress={pickImage}
            activeOpacity={0.9}
          >
            {profile.avatar ? (
              <Image source={{ uri: profile.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.initialsText}>{initials}</Text>
              </View>
            )}

            <View style={styles.cameraButton}>
              <Ionicons name="camera" size={18} color="white" />
            </View>
          </TouchableOpacity>
          <Text style={styles.profileName}>
            {profile.firstName} {profile.lastName}
          </Text>

          <Text style={styles.profileEmail}>{profile.email}</Text>

          <View style={styles.orangeLine} />
        </View>

        {/* ADDRESS CARD */}

        <View style={styles.addressCardModern}>
          <View style={styles.addressIconContainer}>
            <Ionicons name="home" size={28} color={Colors.primary} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.addressTitle}>Delivery Address</Text>

            <Text style={styles.addressValue}>{profile.address}</Text>
          </View>
        </View>

        {/* EDIT BUTTON */}

        <TouchableOpacity
          style={styles.editProfileButton}
          onPress={() => setEditModalVisible(true)}
        >
          <Ionicons name="create-outline" size={22} color="white" />

          <Text style={styles.editProfileText}>Edit Profile</Text>
        </TouchableOpacity>

        {/* SIGN OUT */}

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={22} color="#FF4D4F" />

          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* EDIT MODAL */}

      <Modal
        isVisible={editModalVisible}
        onBackdropPress={() => setEditModalVisible(false)}
        onBackButtonPress={() => setEditModalVisible(false)}
        onSwipeComplete={() => setEditModalVisible(false)}
        swipeDirection="down"
        propagateSwipe
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropTransitionOutTiming={0}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <View style={styles.dragIndicator} />

          <Text style={styles.modalTitle}>Edit Profile</Text>

          <TouchableOpacity
            style={styles.modalAvatarContainer}
            onPress={pickImage}
          >
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.modalAvatar} />
            ) : (
              <View style={styles.modalAvatarPlaceholder}>
                <Ionicons name="person" size={50} color="#BDBDBD" />
              </View>
            )}
          </TouchableOpacity>

          <TextInput
            value={firstName}
            onChangeText={setFirstName}
            placeholder="First name"
            style={styles.modalInput}
          />

          <TextInput
            value={lastName}
            onChangeText={setLastName}
            placeholder="Last name"
            style={styles.modalInput}
          />

          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            style={styles.modalInput}
          />

          <TextInput
            value={address}
            onChangeText={setAddress}
            placeholder="Address"
            style={styles.modalInput}
          />

          <TouchableOpacity
            style={styles.modalSaveButton}
            onPress={handleSaveProfile}
          >
            <Text style={styles.modalSaveText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Garde ton modal actuel ici */}

      {showToast && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F7FB",
  },

  backgroundImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
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

  profileAvatarWrapper: {
    width: 190,
    height: 190,
    justifyContent: "center",
    alignItems: "center",
  },

  avatarRing: {
    width: 190,
    height: 190,

    borderRadius: 95,

    backgroundColor: "#FFFFFF",

    justifyContent: "center",
    alignItems: "center",
  },

  profileAvatar: {
    width: 168,
    height: 168,

    borderRadius: 84,
  },

  initialsAvatar: {
    width: 168,
    height: 168,

    borderRadius: 84,

    backgroundColor: "#F4F4F4",

    justifyContent: "center",
    alignItems: "center",
  },

  cameraWrapper: {
    position: "absolute",

    right: 0,
    bottom: 15,

    width: 74,
    height: 74,

    borderRadius: 37,

    backgroundColor: "#FFFFFF",

    justifyContent: "center",
    alignItems: "center",
  },

  initialsText: {
    fontSize: 42,
    fontWeight: "800",
    color: Colors.primary,
  },

  cameraOuterCircle: {
    position: "absolute",

    right: -6,
    bottom: 6,

    width: 62,
    height: 62,

    borderRadius: 31,

    backgroundColor: "white",

    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 8,
  },

  profileCameraButton: {
    width: 48,
    height: 48,

    borderRadius: 24,

    backgroundColor: Colors.primary,

    justifyContent: "center",
    alignItems: "center",
  },

  profileSection: {
    alignItems: "center",
    marginTop: 140,
  },

  orangeLine: {
    width: 80,
    height: 5,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    marginTop: 20,
  },

  addressCardModern: {
    backgroundColor: "white",

    marginHorizontal: 20,
    marginTop: 40,

    borderRadius: 26,

    padding: 20,

    flexDirection: "row",
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,

    elevation: 4,
  },

  addressIconContainer: {
    width: 58,
    height: 58,

    borderRadius: 29,

    backgroundColor: "#FFF3EB",

    justifyContent: "center",
    alignItems: "center",

    marginRight: 16,
  },

  addressTitle: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: "700",
  },

  addressValue: {
    marginTop: 4,
    fontSize: 15,
    color: Colors.gray,
  },

  editProfileButton: {
    backgroundColor: Colors.primary,

    marginHorizontal: 20,
    marginTop: 28,

    height: 66,

    borderRadius: 22,

    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  editProfileText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 10,
  },

  signOutButton: {
    backgroundColor: "#FFF1F0",

    marginHorizontal: 20,
    marginTop: 18,

    height: 66,

    borderRadius: 22,

    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  signOutText: {
    color: "#FF4D4F",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 10,
  },
  profileHeader: {
    alignItems: "center",
    paddingTop: 40,
    paddingHorizontal: 24,
  },

  profileName: {
    marginTop: 18,
    fontSize: 28,
    fontWeight: "800",
    color: Colors.text,
  },

  profileEmail: {
    marginTop: 8,
    fontSize: 16,
    color: Colors.gray,
  },

  infoCard: {
    marginTop: 40,
    marginHorizontal: 20,

    backgroundColor: "white",

    borderRadius: 22,

    padding: 18,

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },

  infoLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  infoTitle: {
    fontSize: 14,
    color: Colors.gray,
    marginLeft: 12,
  },

  infoValue: {
    marginTop: 4,
    marginLeft: 12,

    fontSize: 16,
    color: Colors.text,

    fontWeight: "600",
  },

  editButton: {
    marginTop: 24,
    marginHorizontal: 20,

    backgroundColor: Colors.primary,

    borderRadius: 18,

    height: 60,

    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  logoutButton: {
    marginTop: 16,
    marginHorizontal: 20,

    backgroundColor: "#FFF1F0",

    borderRadius: 18,

    height: 60,

    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

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
  },

  card: {
    backgroundColor: "white",
    marginHorizontal: 16,
    marginTop: 30,
    borderRadius: 34,
    padding: 22,
  },

  dragIndicator: {
    width: 60,
    height: 6,
    borderRadius: 10,
    backgroundColor: "#D9D9D9",
    alignSelf: "center",
    marginBottom: 20,
  },

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

  saveButton: {
    marginTop: 12,
    backgroundColor: Colors.primary,
    borderRadius: 22,
    paddingVertical: 18,
    justifyContent: "center",
    alignItems: "center",
  },

  saveButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },

  profileContainer: {
    flex: 1,
    backgroundColor: "#F6F7FB",
  },

  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },

  modalContent: {
    backgroundColor: "white",

    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,

    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 20,

    elevation: 10,
  },

  modalTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.text,
    marginBottom: 24,
    textAlign: "center",
  },

  modalAvatarContainer: {
    alignItems: "center",
    marginBottom: 24,
  },

  modalAvatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },

  modalAvatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#F1F1F1",
    justifyContent: "center",
    alignItems: "center",
  },

  modalInput: {
    backgroundColor: "#FAFAFA",
    borderRadius: 18,
    paddingHorizontal: 18,
    height: 58,
    marginBottom: 16,
    fontSize: 16,
    color: Colors.text,
  },

  modalSaveButton: {
    marginTop: 10,
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: "center",
  },

  modalSaveText: {
    color: "white",
    fontSize: 17,
    fontWeight: "700",
  },

  toast: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    backgroundColor: "#222",
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 18,
  },

  toastText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
});
